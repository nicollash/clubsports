import React from 'react';
import { Button } from 'components/common';
import { ButtonColors, ButtonVariant } from 'common/enums';
import { BindingAction } from 'common/models';

interface Props {
  label: string;
  color: ButtonColors;
  variant: ButtonVariant;
  loadFunc: BindingAction;
  isDisabled?: boolean;
}

const ButtonLoad = ({ label, color, variant, isDisabled, loadFunc }: Props) => {
  const [isLoading, changeLoading] = React.useState<boolean>(false);

  const onClick = async () => {
    changeLoading(true);

    await loadFunc();

    changeLoading(false);
  };

  return (
    <Button
      btnStyles={{
        pointerEvents: isLoading ? 'none' : 'auto',
      }}
      onClick={onClick}
      label={isLoading ? 'Loading...' : label}
      color={color}
      variant={variant}
      disabled={isDisabled}
    />
  );
};

export default ButtonLoad;
