import React from 'react';
import { Link } from 'react-router-dom';
import { getIcon } from 'helpers';
import { Icons, EventMenuTitles } from 'common/enums';
import { IMenuItem } from 'common/models';
import styles from './styles.module.scss';

const STYLES_WARNING_ICON = {
  marginRight: '10px',
  fill: '#FFCB00',
};

const STYLES_MENU_ITEM = {
  width: '24px',
  height: '24px',
  marginRight: '10px',
  fill: '#3a3a3a',
};

const IncompleteItemDesc = {
  [EventMenuTitles.EVENT_DETAILS]: 'It is impossible.',
  [EventMenuTitles.FACILITIES]: 'You need to create at least one facility.',
  [EventMenuTitles.REGISTRATION]: 'You need to create a registration.',
  [EventMenuTitles.DIVISIONS_AND_POOLS]:
    'You need to create at least one division&pool.',
  [EventMenuTitles.SCHEDULING]: 'There must be one published schedule.',
  [EventMenuTitles.TEAMS]: 'All teams must be assigned.',
  [EventMenuTitles.SCORING]: 'There must be one published schedule.',
};

interface Props {
  incompleteMenuItems: IMenuItem[];
  eventId: string;
}

const HazardList = ({ incompleteMenuItems, eventId }: Props) => {
  return (
    <section className={styles.wrapper}>
      <header className={styles.hazardHeader}>
        <h3 className={styles.hazardTitle}>
          {getIcon(Icons.WARNING, STYLES_WARNING_ICON)} We need setup to be
          complete so that we can finalize and publish the event!
        </h3>
        <p className={styles.hazardTitleDesc}>
          Please address the below items so that we can proceed.
        </p>
      </header>
      <dl className={styles.hazardList}>
        {incompleteMenuItems.map(it => (
          <React.Fragment key={it.title}>
            <dt>
              <Link to={`${it.link}/${eventId}`}>{it.title}</Link>
            </dt>
            <dd>
              {getIcon(it.icon, STYLES_MENU_ITEM)}
              {IncompleteItemDesc[it.title]}
            </dd>
          </React.Fragment>
        ))}
      </dl>
    </section>
  );
};

export default HazardList;
