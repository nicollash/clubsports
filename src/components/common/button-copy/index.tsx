import React, { CSSProperties } from 'react';
import { getIcon } from 'helpers';
import { Button, Toasts, Tooltip } from 'components/common';
import { TooltipMessageTypes } from 'components/common/tooltip-message/types';
import { ButtonColors, ButtonVariant, Icons } from 'common/enums';
import { copyToClipboard } from './helpers';
import styles from './styles.module.scss';

const COPY_ICON_STYLES = {
  height: '23px',
  marginLeft: '10px',
};

interface Props {
  copyString: string;
  label: string;
  color: ButtonColors;
  variant: ButtonVariant;
  disableMessage?: string;
  style?: CSSProperties;
  successMessage?: string;
}

const ButtonCopy = ({
  label,
  color,
  variant,
  copyString,
  disableMessage,
  style,
  successMessage = 'Successfully copied!',
}: Props) => {
  const onClick = () => {
    copyToClipboard(copyString);

    Toasts.successToast(successMessage);
  };

  const WrappedLabel = (
    <span className={styles.labelWrapper} style={style}>
      <span>{label}</span>
      {getIcon(Icons.FILE_COPY, COPY_ICON_STYLES)}
    </span>
  );

  const WrappedButton = (
    <Button
      onClick={onClick}
      label={WrappedLabel}
      color={color}
      variant={variant}
      disabled={Boolean(disableMessage)}
    />
  );

  return disableMessage ? (
    <Tooltip title={disableMessage} type={TooltipMessageTypes.INFO}>
      <span>{WrappedButton}</span>
    </Tooltip>
  ) : (
    WrappedButton
  );
};

export default ButtonCopy;
