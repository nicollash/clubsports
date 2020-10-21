import { ButtonColors, ButtonVariant } from "common/enums";
import { Button } from "components/common";
import React from 'react';

interface Props {
  formName: string;
  insertFormField: (value: string) => void;
};

export const InsertFormFieldButton = ({ formName, insertFormField }: Props) => {

  const onClick = () => {
    if (formName === "Download app link") {
      insertFormField(` https://bit.ly/clublaxapp `);
      return;
    }
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