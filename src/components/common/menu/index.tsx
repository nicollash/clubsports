/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import TournamentStatus from './components/tournament-status';
import MenuItem from './components/menu-item';
import { getIcon } from 'helpers';
import { Icons } from 'common/enums/icons';
import { Routes } from 'common/enums';
import { IMenuItem } from 'common/models/menu-list';
import styles from './styles.module.scss';
import { useLocation } from 'react-router-dom';
import {
  BindingAction,
  IEventDetails,
  ISchedule,
  IFetchedBracket,
} from 'common/models';

enum MenuCollapsedTypes {
  PIN = 'Pin',
  UNPIN = 'Unpin',
}

interface Props {
  list: IMenuItem[];
  isAllowEdit: boolean;
  togglePublishPopup?: BindingAction;
  toggleUnpublishPopup?: BindingAction;
  hideOnList?: Routes[];
  event?: IEventDetails;
  schedules?: ISchedule[];
  brackets?: IFetchedBracket[];
}

const Menu = ({
  list,
  event,
  schedules,
  brackets,
  isAllowEdit,
  togglePublishPopup,
  hideOnList,
}: Props) => {
  const location = useLocation();
  const [hideDashboard, hideDashboardChange] = React.useState(false);
  const [isCollapsed, onCollapse] = React.useState(false);
  const [isCollapsible, onSetCollapsibility] = React.useState(false);

  useEffect(() => {
    const value = !!hideOnList?.filter(el => location?.pathname.includes(el))
      ?.length;
    hideDashboardChange(value);
  }, [location]);

  return (
    <aside
      className={`${styles.dashboardMenu} ${
        hideDashboard ? styles.dashboardHidden : ''
      } ${isCollapsed ? styles.dashboardMenuCollapsed : ''} `}
      onMouseEnter={() => isCollapsible && onCollapse(false)}
      onMouseLeave={() => isCollapsible && onCollapse(true)}
    >
      {!isCollapsed && event && (
        <b className={styles.eventTitle}>{event.event_name}</b>
      )}
      <ul className={styles.list}>
        {list.map(menuItem => (
          <MenuItem
            eventId={event?.event_id}
            menuItem={menuItem}
            isAllowEdit={isAllowEdit}
            isCollapsed={isCollapsed}
            key={menuItem.title}
          />
        ))}
      </ul>
      {!isCollapsed && event && schedules && brackets && togglePublishPopup && (
        <TournamentStatus
          event={event}
          schedules={schedules}
          brackets={brackets}
          togglePublishPopup={togglePublishPopup}
        />
      )}
      <button
        className={styles.pinBtn}
        onClick={() => onSetCollapsibility(!isCollapsible)}
      >
        {getIcon(Icons.PIN)}
        {!isCollapsed &&
          `${
            isCollapsible ? MenuCollapsedTypes.PIN : MenuCollapsedTypes.UNPIN
          }  Menu`}
      </button>
    </aside>
  );
};

export default Menu;
