import React, { useState } from "react";
import { connect } from "react-redux";
import api from "api/api";
import { getIcon } from "helpers";
import { Icons } from "common/enums";
import Input from "components/common/input";
import { Toasts, Select } from "components/common";
import Button from "components/common/buttons/button";
import { loadRegistrantData } from "components/register-page/individuals/player-stats/logic/actions";
import styles from "./styles.module.scss";

const CLOSE_ICON_STYLES = {
  height: "23px",
  marginLeft: "10px",
};

interface IModalField {
  onCancel: () => void;
  registrantDataFields?: any;
  loadRegistrantData: () => void;
  data?: any;
}

const addButton = {
  color: "white",
  fontSize: "16px",
  opacity: "1",
  height: "40px",
  marginTop: "auto",
  marginLeft: "10px",
};

const type = [
  { label: "Input", value: "Input" },
  { label: "Select", value: "Select" },
];

const ModalField = ({
  data,
  registrantDataFields,
  onCancel,
  loadRegistrantData,
}: IModalField) => {
  const [dataLabel, setDataLabel] = useState(data ? data.data_label : "");
  const [dataDefaults, setDataDefaults] = useState("");
  const [selectOptions, setSelectOptions] = useState<string[]>(
    data && data.data_defaults
      ? Object.values(JSON.parse(data.data_defaults)[0])
      : []
  );
  const [groupByValue, setGroupByValue] = useState(data ? data.data_group : "User Defined");
  const [fieldType, setFieldType] = useState(data && data.data_defaults ? "Select" : "Input");

  const onAction = async () => {
    try {
      const structuredSelectOptions = {};
      const updatedOptions = dataDefaults
        ? [...selectOptions, dataDefaults]
        : selectOptions;
      updatedOptions.map((el: any, index: number) => {
        const key = `value_${index + 1}`;
        structuredSelectOptions[key] = el;
        return true;
      });
      if (data) {
        await api.put(`/registrant_data_fields?data_field_id=${data.data_field_id}`, {
            data_group: groupByValue,
            data_label: dataLabel,
            data_defaults:
              fieldType === "Input"
                ? null
                : JSON.stringify([structuredSelectOptions]),
        });
      } else {
        await api.post("/registrant_data_fields", {
          data_group: groupByValue,
          data_label: dataLabel,
          data_defaults:
            fieldType === "Input"
              ? null
              : JSON.stringify([structuredSelectOptions]),
          is_active_YN: 1,
        });
      }
    } catch {
      Toasts.errorToast(`Could not ${data ? "edit a" : "add a new"} field.`);
    }

    loadRegistrantData();
    onCancel();
  };

  const onDelete = async () => {
    try {
      await api.delete(
        `/registrant_data_fields?data_field_id=${data.data_field_id}`
      );
    } catch {
      Toasts.errorToast(`Could not delete a field.`);
    }
    loadRegistrantData();
    onCancel();
  }

  const getGroupByList = () => {
    const groupByList = new Set();
    registrantDataFields.map((el: any) => {
      groupByList.add(el.data_group);
      return true;
    });
    const options: any = [];

    groupByList.forEach((el) => {
      options.push({
        label: el,
        value: el,
      });
    });

    return options;
  };

  const onDataLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDataLabel(e.target.value);
  };

  const onDataDefaultsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDataDefaults(e.target.value);
  };

  const onChangeGroupBy = (e: any) => {
    setGroupByValue(e.target.value);
  };

  const onChangeFieldType = (e: any) => {
    setFieldType(e.target.value);
  };

  const onAddSelectItem = () => {
    if (dataDefaults) {
      setSelectOptions([...selectOptions, dataDefaults]);
      setDataDefaults("");
    }
  };

  const closeSelectItem = (index: number) => () => {
    const updatedSelectOptions = [...selectOptions];

    updatedSelectOptions.splice(index, 1);
    setSelectOptions(updatedSelectOptions);
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonsWrapp}>
        <div className={styles.sectionTitle}>
          {data ? "Edit Field" : "Add a New Field"}
        </div>
        <div>
          <Button
            label="Delete"
            variant="text"
            type="dangerLink"
            color="secondary"
            onClick={onDelete}
          />
        </div>
      </div>

      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <div className={styles.sectionItem}>
            <Select
              onChange={onChangeGroupBy}
              name={"Data Group"}
              options={getGroupByList()}
              value={groupByValue}
              label="Data Group"
            />
          </div>
          <div className={styles.sectionItem}>
            <Input
              fullWidth={true}
              label="Label Name"
              isRequired={true}
              value={dataLabel}
              onChange={onDataLabelChange}
            />
          </div>
        </div>
        <div className={styles.sectionItem}>
          <div className={styles.sectionItem}>
            <Select
              onChange={onChangeFieldType}
              name="Type"
              options={type}
              value={fieldType}
              label="Type"
            />
          </div>
          <div className={styles.addSelectItem}>
            <Input
              fullWidth={true}
              label="Add Select Options"
              isRequired={true}
              value={dataDefaults}
              onChange={onDataDefaultsChange}
              disabled={fieldType !== "Select"}
            />
            <Button
              label="+"
              variant="contained"
              color="secondary"
              onClick={onAddSelectItem}
              btnStyles={addButton}
              disabled={fieldType !== "Select"}
            />
          </div>
          <div className={styles.selectItems}>
            {selectOptions.map((el: string, index: number) => (
              <div
                key={index}
                className={`${styles.selectItem} ${
                  fieldType !== "Select" ? styles.disabled : ""
                }`}
              >
                {el}
                <span
                  onClick={closeSelectItem(index)}
                  className={styles.closeIcon}
                >
                  {getIcon(Icons.CLOSE, CLOSE_ICON_STYLES)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.buttonsGroup}>
        <Button
          label="Cancel"
          variant="text"
          color="secondary"
          onClick={onCancel}
        />
        <Button
          label={data ? "Edit" : "Add"}
          variant="contained"
          color="primary"
          onClick={onAction}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: {
  playerStatsReducer: { registrantDataFields: any };
}) => ({
  registrantDataFields: state.playerStatsReducer.registrantDataFields,
});

const mapDispatchToProps = {
  loadRegistrantData,
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalField);
