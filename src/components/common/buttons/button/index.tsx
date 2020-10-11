import React from 'react';
import { Button as MuiButton } from '@material-ui/core';
import styles from './style.module.scss';

interface IButtonProps {
  label: string | JSX.Element;
  color: 'primary' | 'secondary' | 'inherit' | 'default' | undefined;
  variant: 'text' | 'outlined' | 'contained' | undefined;
  type?:
    | 'squared'
    | 'danger'
    | 'squaredOutlined'
    | 'dangerLink'
    | 'icon'
    | undefined;
  btnType?: 'button' | 'submit';
  btnStyles?: object;
  icon?: JSX.Element;
  isIconRightSide?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const Button: React.FC<IButtonProps> = ({
  label,
  color,
  variant,
  type,
  onClick,
  icon,
  disabled,
  btnStyles,
  btnType,
  isIconRightSide,
}) => (
  <MuiButton
    disabled={disabled}
    variant={variant}
    color={color}
    className={type && styles[`${type}Btn`]}
    onClick={onClick}
    style={{
      fontSize: '16px',
      ...btnStyles,
      opacity: disabled ? '0.4' : '1',
    }}
    type={btnType}
  >
    {icon && !isIconRightSide && (
      <div
        className={type === 'icon' ? styles.icon : icon && styles.iconWrapper}
      >
        {icon}
      </div>
    )}
    {label}
    {icon && isIconRightSide && (
      <div
        className={type === 'icon' ? styles.icon : icon && styles.iconWrapper}
      >
        {icon}
      </div>
    )}
  </MuiButton>
);

export default Button;
