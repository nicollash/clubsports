import React from 'react';
import { Input, Checkbox, Button, DeletePopupConfrim } from 'components/common';
import { IField, IFacility, BindingCbWithTwo } from 'common/models';
import { IInputEvent } from 'common/types';
import { ButtonVariant, ButtonColors, ButtonTypes } from 'common/enums';
import styles from './styles.module.scss';

interface Props {
  field: IField;
  facility: IFacility;
  fieldNumber: number;
  isEdit: boolean;
  onChangeField: (field: IField) => void;
  deleteField: BindingCbWithTwo<IFacility, IField>;
}

enum FormFields {
  FIELD_NAME = 'field_name',
  IS_ILLUMINATED_YN = 'is_illuminated_YN',
  IS_PREMIER_YN = 'is_premier_YN',
  IS_TURF_YN = 'is_turf_YN',
}

const Field = ({
  facility,
  field,
  fieldNumber,
  isEdit,
  onChangeField,
  deleteField,
}: Props) => {
  const [isDeletePopupOpen, toggleDeletePopup] = React.useState<boolean>(false);

  const onToggleDeletePopup = () => {
    toggleDeletePopup(!isDeletePopupOpen);
  };

  const onDeleteField = () => {
    deleteField(facility, field);

    onToggleDeletePopup();
  };

  const FIELD_OPTIONS = [
    {
      label: 'Illuminated',
      checked: Boolean(field.is_illuminated_YN),
      name: FormFields.IS_ILLUMINATED_YN,
      disabled: !isEdit,
    },
    {
      label: 'Premier Field Location',
      checked: Boolean(field.is_premier_YN),
      name: FormFields.IS_PREMIER_YN,
      disabled: !isEdit,
    },
    {
      label: 'Turf (Unchecked = Grass)',
      checked: Boolean(field.is_turf_YN),
      name: FormFields.IS_TURF_YN,
      disabled: !isEdit,
    },
  ];

  const onChange = ({
    target: { name, value, type, checked },
  }: IInputEvent) => {
    const updetedField = {
      ...field,
      [name]: type === 'checkbox' ? +checked : value,
    };

    onChangeField(updetedField);
  };

  return (
    <>
      <fieldset className={styles.field}>
        <legend className={styles.fieldTitleWrapper}>
          <span>Field {fieldNumber} Name</span>
          <Button
            onClick={onToggleDeletePopup}
            variant={ButtonVariant.TEXT}
            color={ButtonColors.SECONDARY}
            type={ButtonTypes.DANGER_LINK}
            label="Delete"
          />
        </legend>
        <Input
          onChange={onChange}
          value={field.field_name || ''}
          name={FormFields.FIELD_NAME}
          width="250px"
          placeholder={`Field ${fieldNumber}`}
          disabled={!isEdit}
        />
        <Checkbox onChange={onChange} options={FIELD_OPTIONS} />
      </fieldset>
      <DeletePopupConfrim
        type="Field"
        deleteTitle={field.field_name}
        isOpen={isDeletePopupOpen}
        onClose={onToggleDeletePopup}
        onDeleteClick={onDeleteField}
      />
    </>
  );
};

export default Field;
