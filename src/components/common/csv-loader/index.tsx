/* tslint:disable: jsx-no-lambda */
import React from "react";
import { connect } from "react-redux";
import { LinearProgress } from "@material-ui/core";
import Papa from "papaparse";
import { BindingAction, BindingCbWithOne } from "common/models";
import { ITableColumns, IMapping, IField } from "common/models/table-columns";
import {
  Modal,
  FileUpload,
  Select,
  Button,
  Checkbox,
  Input,
} from "components/common/";
import { PopupExposure, Toasts } from "components/common";
import MuiTable from "components/common/mui-table";
import {
  FileUploadTypes,
  AcceptFileTypes,
} from "components/common/file-upload";
import {
  parseTableDetails,
  getPreview,
  getColumnOptions,
  mapFieldForSaving,
  parseMapping,
  mapDataForSaving,
  checkCsvForValidity,
  getRequiredFields,
} from "./helpers";
import { LoaderButton } from "components/common/loader/index";
import {
  getTableColumns,
  saveMapping,
  getMappings,
  removeMapping,
} from "./logic/actions";
import CsvTable from "./table";
import SaveMapping from "./save-mapping";
import ManageMapping from "./manage-mapping";
import styles from "./styles.module.scss";

interface IComponentsProps {
  isOpen: boolean;
  onClose: BindingAction;
  type: string;
  onCreate: any;
  eventId?: string;
}

interface IMapStateToProps {
  tableColumns: ITableColumns;
  mappings: IMapping[];
}

interface IMapDispatchToProps {
  getTableColumns: BindingCbWithOne<string>;
  saveMapping: BindingCbWithOne<Partial<IMapping>>;
  getMappings: BindingCbWithOne<string>;
  removeMapping: BindingCbWithOne<number>;
}
type Props = IMapStateToProps & IMapDispatchToProps & IComponentsProps;

interface State {
  preview: { header: string[]; row: string[] };
  data: string[][];
  fields: IField[];
  selectedMapping: string;
  isHeaderIncluded: boolean;
  headerPosition: number;
  isConfirmModalOpen: boolean;
  isMappingModalOpen: boolean;
  isManageMappingOpen: boolean;
  errorList: { index: number; msg: string }[];
  infoList: { index: number; msg: string }[];
  isCheck: boolean;
  importLoading: boolean;
  importMethod: string;
  inProgress: { status: string; msg: string }[];
}

const methodOptions = [
  {
    label: "Import/Append to Existing",
    value: "append",
  },
  {
    label: "Delete All & Replace",
    value: "replace",
  },
];

class CsvLoader extends React.Component<Props, State> {
  state: State = {
    preview: { header: [], row: [] },
    data: [],
    fields: [],
    selectedMapping: "",
    isHeaderIncluded: true,
    headerPosition: 1,
    isConfirmModalOpen: false,
    isMappingModalOpen: false,
    isManageMappingOpen: false,
    errorList: [],
    infoList: [],
    isCheck: false,
    importLoading: false,
    inProgress: [],
    importMethod: "append",
  };

  componentDidUpdate(prevProps: Props) {
    const {
      tableColumns,
      isOpen,
      getTableColumns,
      getMappings,
      type,
    } = this.props;
    const { fields } = this.state;
    if (prevProps.isOpen === false && isOpen === true) {
      getTableColumns(type);
      getMappings(type);
    }

    if (
      (tableColumns && !fields.length) ||
      tableColumns !== prevProps.tableColumns
    ) {
      const parsedTableDetails = parseTableDetails(tableColumns?.table_details);

      this.setState({
        fields: parsedTableDetails.map((column, index: number) => ({
          value: column.column_name,
          csvPosition: index,
          dataType: column.data_type,
          included: true,
          map_id: column.map_id,
        })),
      });
    }
  }

  onFileSelect = (files: File[]) => {
    const { isHeaderIncluded, headerPosition, fields } = this.state;

    if (isHeaderIncluded && !Number(headerPosition)) {
      return Toasts.errorToast("Please, choose header position");
    }

    if (files[0]) {
      Papa.parse(files[0], {
        skipEmptyLines: true,
        complete: ({ data }) => {
          const isCsvValid = checkCsvForValidity(
            data,
            isHeaderIncluded,
            headerPosition,
            fields
          );
          if (!isCsvValid) {
            return Toasts.errorToast(
              "Please check your csv. Something seems to be off with it."
            );
          } else {
            const preview = getPreview(data, isHeaderIncluded, headerPosition);

            this.setState((prevState) => ({
              preview,
              data: isHeaderIncluded ? data.slice(headerPosition) : data,
              fields: preview.header.map((column, index: number) => ({
                value: column,
                csvPosition: index,
                dataType:
                  prevState.fields.find((x) => x.value === column)?.dataType ||
                  "",
                included:
                  prevState.fields.find((x) => x.value === column)?.included ||
                  prevState.fields.find((x) => x.value === column) ===
                    undefined,
                map_id:
                  prevState.fields.find((x) => x.value === column)?.map_id ||
                  "",
              })),
              errorList: [],
              infoList: [],
            }));
          }
        },
      });
    }
  };

  onFieldSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { tableColumns } = this.props;
    const { fields } = this.state;

    const parsedColumnsDetails = parseTableDetails(tableColumns?.table_details);

    const newField = parsedColumnsDetails.filter(
      (field) => field.column_name === e.target.value
    )[0];
    const newF = fields.filter((field) => field.value === e.target.value)[0];
    const old = fields[index];
    const toChange = fields.indexOf(newF);

    this.setState({
      fields: fields.map((field, idx: number) => {
        if (idx === index) {
          return {
            ...field,
            data_type: newField.data_type,
            value: e.target.value,
            csvPosition: index,
            map_id: newField.map_id,
          };
        } else if (idx === toChange) {
          return {
            ...field,
            data_type: old.dataType,
            value: old.value,
            map_id: old.map_id,
          };
        } else {
          return field;
        }
      }),
    });
  };

  onImport = () => {
    const { data, fields, importMethod } = this.state;
    if (!data.length) {
      this.setState({ importLoading: false });
      return Toasts.errorToast("Please, upload a csv file first");
    }

    const { type, eventId, onCreate } = this.props;

    const dataToSave: any = [];
    data.forEach((res) => {
      const event = mapDataForSaving(type, res, fields, eventId);
      dataToSave.push(event);
    });
    this.setState({ importLoading: true, isConfirmModalOpen: false });
    if (type === "divisions" || type === "players" || type === "teams" || type === "sms_authorized_scorers") {
      onCreate(dataToSave, importMethod, this.onModalClose);
    } else {
      onCreate(dataToSave, this.onModalClose);
    }
  };

  onCheck = () => {
    const { data } = this.state;
    if (!data.length) {
      return Toasts.errorToast("Please, upload a csv file first");
    }

    this.setState({ isCheck: true });
  };

  onFieldIncludeChange = (
    _e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    this.setState({
      fields: this.state.fields.map((field, idx: number) =>
        idx === index ? { ...field, included: !field.included } : field
      ),
    });
  };

  onIsHeaderIncludedChange = () => {
    const { isHeaderIncluded } = this.state;
    this.setState({ isHeaderIncluded: !isHeaderIncluded });
  };

  onHeaderPositionChange = (e: React.ChangeEvent<any>) => {
    this.setState({ headerPosition: e.target.value });
  };

  onMappingSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      tableColumns: { table_details },
    } = this.props;
    const mapping = parseMapping(e.target.value, table_details);

    this.setState({ fields: mapping, selectedMapping: e.target.value });
  };

  onChangeImportMethod = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      importMethod: e.target.value,
    });
  };

  onModalClose = async (param = { type: "", data: [] }) => {
    const { onClose } = this.props;
    const { type, data } = param;

    if (type === "error" && data.length >= 0) {
      this.setState({ errorList: data, inProgress: [] });
    } else if (type === "progress") {
      this.setState({
        inProgress: data,
      });
    } else if (type === "info" && data.length >= 0) {
      await this.setState({ infoList: data, inProgress: [] });
      Toasts.successToast(this.state.infoList[0].msg);
    } else {
      onClose();
      this.setState({
        preview: { header: [], row: [] },
        data: [],
        fields: [],
        selectedMapping: "",
        headerPosition: 1,
        errorList: [],
        infoList: [],
        inProgress: [],
      });
      this.setState({ isCheck: false, importLoading: false });
    }
  };

  getErrorList = () => {
    const { errorList, data } = this.state;

    return errorList.map((el) => [
      el.msg,
      (el.index + 1).toString(),
      ...data[el.index],
    ]);
  };

  getInfoList = () => {
    const { infoList } = this.state;
    return infoList.map((el) => [el.msg]);
  };

  onCancelClick = () => {
    const { data } = this.state;

    if (data.length) {
      this.setState({ isConfirmModalOpen: true });
    } else {
      this.onCancel();
    }
  };

  onConfirmModalClose = () => {
    this.setState({ isConfirmModalOpen: false });
  };

  onCancel = () => {
    this.onModalClose();
    this.setState({ isConfirmModalOpen: false });
  };

  onSaveMappingCancel = () => {
    this.setState({ isMappingModalOpen: false });
  };

  onMappingSave = (name: string) => {
    const { saveMapping, type } = this.props;
    const { fields } = this.state;

    const data = {
      import_description: name,
      map_id_json: JSON.stringify(mapFieldForSaving(fields)),
      destination_table: type,
    };

    saveMapping(data);
    this.setState({ isMappingModalOpen: false });
  };

  onSaveMappingClick = () => {
    this.setState({ isMappingModalOpen: true });
  };

  onMappingModalClose = () => {
    this.setState({ isMappingModalOpen: false });
  };

  onManageMappingClick = () => {
    this.setState({ isManageMappingOpen: true });
  };

  onManageMappingModalClose = () => {
    this.setState({ isManageMappingOpen: false });
  };

  onIncludeAllChange = () => {
    const { fields } = this.state;
    const areAllFieldsSelected = fields.every((field) => field.included);
    this.setState({
      fields: fields.map((field) => ({
        ...field,
        included: !areAllFieldsSelected,
      })),
    });
  };

  render() {
    const { isOpen, mappings, removeMapping, tableColumns, type } = this.props;
    const {
      data,
      fields,
      headerPosition,
      isCheck,
      isConfirmModalOpen,
      isHeaderIncluded,
      isManageMappingOpen,
      isMappingModalOpen,
      preview,
      selectedMapping,
      errorList,
      infoList,
      inProgress,
      importMethod,
    } = this.state;
    const columnOptions =
      tableColumns && getColumnOptions(tableColumns?.table_details);

    const mappingsOptions = mappings.map((map) => ({
      label: map.import_description,
      value: map.map_id_json,
    }));

    const requiredFields = tableColumns
      ? getRequiredFields(type, tableColumns?.table_details)
      : [];

    return (
      <Modal isOpen={isOpen} onClose={this.onModalClose}>
        <div className={styles.container}>
          <div className={styles.uploaderWrapper}>
            <div>
              <FileUpload
                type={FileUploadTypes.BUTTON}
                acceptTypes={[AcceptFileTypes.CSV]}
                onUpload={this.onFileSelect}
                btnLabel={"Select CSV File"}
                withoutRemoveBtn={true}
              />
            </div>
            <Button
              label="Manage Mappings"
              color="secondary"
              variant="text"
              onClick={this.onManageMappingClick}
            />
          </div>
          {errorList.length !== 0 && (
            <div className={styles.row}>
              <b>
                Cannot Import File: Duplicates found! Below are the details.
              </b>
            </div>
          )}
          <div className={styles.row}>
            <div className={styles.checkboxWrapper}>
              <Checkbox
                options={[
                  {
                    label: "Header is included on row #",
                    checked: isHeaderIncluded,
                  },
                ]}
                onChange={this.onIsHeaderIncludedChange}
              />
              <Input
                width={"50px"}
                minWidth={"50px"}
                label=""
                value={headerPosition}
                onChange={this.onHeaderPositionChange}
                type="number"
                disabled={!isHeaderIncluded}
              />
            </div>
            <div style={{ display: "flex" }}>
              {(type === "divisions" ||
                type === "players" ||
                type === "teams" ||
                type === "sms_authorized_scorers") && (
                <div style={{ marginRight: 10 }}>
                  <Select
                    width={"200px"}
                    options={methodOptions || []}
                    label="Import Method"
                    value={importMethod}
                    onChange={this.onChangeImportMethod}
                    disabled={!data.length}
                  />
                </div>
              )}
              <Select
                width={"200px"}
                options={mappingsOptions || []}
                label="Select Historical Mapping"
                value={selectedMapping}
                onChange={this.onMappingSelect}
                disabled={!data.length}
              />
            </div>
          </div>
          {type === "divisions_pools_teams" && isCheck && (
            <MuiTable header={preview.header} fields={data} />
          )}

          {(type !== "divisions_pools_teams" || !isCheck) &&
            (errorList.length === 0 ? (
              <CsvTable
                preview={preview}
                fields={fields}
                onFieldIncludeChange={this.onFieldIncludeChange}
                onSelect={this.onFieldSelect}
                columnOptions={columnOptions}
                onIncludeAllChange={this.onIncludeAllChange}
              />
            ) : (
              <MuiTable
                header={["Status", "No", ...preview.header]}
                fields={this.getErrorList()}
              />
            ))}

          {inProgress.length > 0 && (
            <div className={styles.linearProgressContainer}>
              <p className={styles.linearProgressLabel}>
                {inProgress[0].status}
              </p>
              <LinearProgress
                variant="determinate"
                value={Number(inProgress[0].msg) * 100}
              />
            </div>
          )}
          <div className={styles.requiredFieldWrapper}>
            <span className={styles.title}>Required Fields:</span>{" "}
            {requiredFields.map((field, index) =>
              index !== requiredFields.length - 1
                ? `"${field}", `
                : `"${field}"`
            )}
          </div>

          <div className={styles.btnsWrapper}>
            <Button
              label="Cancel"
              color="secondary"
              variant="text"
              onClick={this.onCancelClick}
            />
            {errorList.length === 0 && infoList.length === 0 && (
              <>
                <Button
                  label="Save Mapping"
                  color="secondary"
                  variant="text"
                  onClick={this.onSaveMappingClick}
                />
                {type === "divisions_pools_teams" && !isCheck ? (
                  <Button
                    label="Check"
                    color="primary"
                    variant="contained"
                    onClick={this.onCheck}
                  />
                ) : this.state?.importLoading ? (
                  <LoaderButton />
                ) : (
                  <Button
                    label="Import"
                    color="primary"
                    variant="contained"
                    onClick={this.onImport}
                  />
                )}
              </>
            )}
            {infoList.length > 0 && (
              <Button
                label="Ok"
                color="secondary"
                variant="text"
                onClick={() => this.props.onClose()}
              />
            )}
          </div>
          <PopupExposure
            isOpen={isConfirmModalOpen}
            onClose={this.onConfirmModalClose}
            onExitClick={this.onCancel}
            onSaveClick={this.onImport}
          />
          <SaveMapping
            isOpen={isMappingModalOpen}
            onClose={this.onMappingModalClose}
            onCancel={this.onSaveMappingCancel}
            onSave={this.onMappingSave}
          />
          <ManageMapping
            isOpen={isManageMappingOpen}
            onClose={this.onManageMappingModalClose}
            mappings={mappings}
            onMappingDelete={removeMapping}
          />
        </div>
      </Modal>
    );
  }
}

interface IState {
  tableColumns: { data: ITableColumns; mappings: any[] };
}

const mapStateToProps = (state: IState) => ({
  mappings: state.tableColumns.mappings,
  tableColumns: state.tableColumns.data,
});

const mapDispatchToProps = {
  getMappings,
  getTableColumns,
  removeMapping,
  saveMapping,
};

export default connect(mapStateToProps, mapDispatchToProps)(CsvLoader);
