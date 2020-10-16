import { ButtonColors, ButtonVariant } from "common/enums";
import { Button } from "components/common";
import React from 'react';

interface Props {
  formName: string;
  insertFormField: (value: string) => void;
};

export const InsertFormFieldButton = ({ formName, insertFormField }: Props) => {

  const onClick = () => {
    insertFormField(`{{${formName}}}`);
  };

  return (
    <Button
      onClick={onClick}
      variant={ButtonVariant.OUTLINED}
      color={ButtonColors.PRIMARY}
      label={formName}
    />
  );
};