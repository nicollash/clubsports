import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Input, Select, CardMessage } from "components/common";
import { BindingCbWithOne, ISelectOption } from "common/models";
import { CardMessageTypes } from "components/common/card-message/types";
import { loadFormFields } from "./logic/actions";
import styles from "../../styles.module.scss";
import { IFields } from "../../index";

enum fieldType {
  INPUT = 0,
  SELECT = 1,
}

enum defaultOptions {
  REQUIRED = 1,
  REQUESTED = 0,
}

interface IPlayerStatsProps {
  data: any;
  onChange: BindingCbWithOne<IFields>;
  jerseyNumberRequired: boolean;
  loadFormFields: BindingCbWithOne<string>;
  formFields: any;
  eventId: string | undefined;
}

const PlayerStats = ({
  data,
  onChange,
  formFields,
  eventId,
  loadFormFields,
}: IPlayerStatsProps) => {
  useEffect(() => {
    if (eventId) {
      loadFormFields(eventId);
    }
  }, [eventId, loadFormFields]);
  const checkFieldType = (value: string | null) => {
    try {
      if (!value) {
        return { type: fieldType.INPUT, value };
      }

      const parsedArray = JSON.parse(value);
      if (Array.isArray(parsedArray) && parsedArray.length === 1) {
        const parsedObject = parsedArray[0];

        const options = Object.entries(parsedObject).map((el) => ({
          value: el[0],
          label: el[1],
        }));
        return {
          type: fieldType.SELECT,
          value: options,
        };
      }
      return { type: fieldType.INPUT, value };
    } catch {
      return { type: fieldType.INPUT, value };
    }
  };

  const renderField = (field: {
    data_defaults: string | null;
    data_label: string;
    is_required_YN: number | null;
    data_sort_order: number;
    request_id: number;
    data_field_id: number;
  }) => {
    const { value, type } = checkFieldType(field.data_defaults);
    const label = field.data_label;
    const dataType = field.request_id.toString();
    const dataFieldId = field?.data_field_id.toString();

    if (type === fieldType.INPUT) {
      return (
        <Input
          fullWidth={true}
          label={
            field.is_required_YN === defaultOptions.REQUIRED
              ? `${label} *`
              : label
          }
          isRequired={
            field.is_required_YN === defaultOptions.REQUIRED ? true : false
          }
          value={
            data.find((d: IFields) => d.fieldName === dataType)?.fieldValue
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({
              fieldName: dataType,
              fieldValue: e.target.value,
              fieldDataId: dataFieldId,
            })
          }
        />
      );
    } else {
      return (
        <Select
          options={value as ISelectOption[]}
          label={
            field.is_required_YN === defaultOptions.REQUIRED
              ? `${label} *`
              : label
          }
          isRequired={
            field.is_required_YN === defaultOptions.REQUIRED ? true : false
          }
          value={
            data.find((d: IFields) => d.fieldName === dataType)?.fieldValue
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({
              fieldName: dataType,
              fieldValue: e.target.value,
              fieldKeyValue: (value as ISelectOption[]).find(
                (v: ISelectOption) => v.value === e.target.value
              )?.label,
              fieldDataId: dataFieldId,
            })
          }
        />
      );
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionRow}>
        {formFields.map((el: any, index: number) => (
          <div className={styles.sectionItem} key={index}>
            {renderField(el)}
          </div>
        ))}
      </div>
      <div className={styles.toolTipMessage}>
        <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
          Omitting data will eliminate it from any coaches books that might be
          distributed.
        </CardMessage>
      </div>
    </div>
  );
};

const mapStateToProps = (state: {
  playerStatsReducer: { formFields: any };
}) => ({
  formFields: state.playerStatsReducer.formFields,
});

const mapDispatchToProps = {
  loadFormFields,
};

export default connect(mapStateToProps, mapDispatchToProps)(PlayerStats);
