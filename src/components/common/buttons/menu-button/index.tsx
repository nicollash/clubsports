import React from 'react';
import { Button, Menu, MenuItem, ButtonProps } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

import styles from './styles.module.scss';

interface IMenuItem {
  label: string;
  icon?: IconProp;
  disabled?: boolean;
  action?: () => void;
}

interface IProps extends ButtonProps {
  label: string;
  menuItems: IMenuItem[];
}

const MenuButton: React.FC<IProps> = ({ label, menuItems, variant, color }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onMenuItemClick = (action: any) => {
    action();
    handleClose();
  };

  return (
    <>
      <Button
        variant={variant}
        color={color}
        aria-controls='simple-menu'
        aria-haspopup='true'
        size="large"
        onClick={handleClick}
      >
        {label}
      </Button>
      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {menuItems.map((menuItem: IMenuItem) => (
          <MenuItem
            className={styles.menuItem}
            key={menuItem?.label}
            disabled={menuItem?.disabled}
            onClick={() => onMenuItemClick(menuItem?.action)}
          >
            {Boolean(menuItem.icon) && (
              <div className={styles.iconWrapper}>
                <FontAwesomeIcon icon={menuItem?.icon!} />
              </div>
            )}
            {menuItem?.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default MenuButton;
