import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  ExpansionPanelWrapped,
  ExpansionPanelSummaryWrapped,
  ExpansionPanelDetailsWrapper,
} from '../expansion-panel-material';
import { getIcon, stringToLink } from 'helpers';
import { IMenuItem } from 'common/models';
import { Icons, RequiredMenuKeys } from 'common/enums';
import styles from './styles.module.scss';

const STYLES_MENUITEM_ICON = {
  marginRight: '8px',
};

const STYLES_PROGREES_ICON = {
  width: '20px',
  height: '20px',
  marginLeft: '9px',
};

interface Props {
  eventId?: string;
  menuItem: IMenuItem;
  isAllowEdit: boolean;
  isCollapsed: boolean;
}

const MenuItem = ({ eventId, menuItem, isAllowEdit, isCollapsed }: Props) => {
  const { pathname } = useLocation();
  const isActiveItem = pathname.includes(menuItem.link);

  return (
    <li className={styles.listItem}>
      <ExpansionPanelWrapped disabled={!menuItem.isAllowEdit && !isAllowEdit}>
        <ExpansionPanelSummaryWrapped
          expandIcon={
            menuItem.children.length !== 0 && !isCollapsed && <ExpandMoreIcon />
          }
        >
          {getIcon(
            menuItem.icon,
            !isCollapsed ? STYLES_MENUITEM_ICON : undefined
          )}
          {!isCollapsed && (
            <Link
              className={`${styles.itemTitle} ${
                isActiveItem ? styles.itemTitleActive : ''
                }`}
              to={`${menuItem.link}/${eventId || ''}`}
            >
              {menuItem.title}
              {!isCollapsed &&
                menuItem.hasOwnProperty(RequiredMenuKeys.IS_COMPLETED) &&
                (menuItem.isCompleted
                  ? getIcon(Icons.CHECK_CIRCLE, {
                    ...STYLES_PROGREES_ICON,
                    fill: '#00CC47',
                  })
                  : getIcon(Icons.WARNING, {
                    ...STYLES_PROGREES_ICON,
                    fill: '#FFCB00',
                  }))}
            </Link>
          )}
        </ExpansionPanelSummaryWrapped>
        {!isCollapsed && menuItem.children.length !== 0 && (
          <ExpansionPanelDetailsWrapper>
            <ul className={styles.subList}>
              {menuItem.children.map((menuSubItem: string) => (
                <li className={styles.subListItem} key={menuSubItem}>
                  <HashLink
                    to={`${menuItem.link}/${eventId || ''}#${stringToLink(
                      menuSubItem
                    )}`}
                  >
                    {menuSubItem}
                  </HashLink>
                </li>
              ))}
            </ul>
          </ExpansionPanelDetailsWrapper>
        )}
      </ExpansionPanelWrapped>
    </li>
  );
};

export default MenuItem;
