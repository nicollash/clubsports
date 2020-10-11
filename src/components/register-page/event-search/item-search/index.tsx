import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.scss';
import moment from 'moment';
import { IRegistrationExtended } from 'common/models';

const ItemSearch = ({ event }: { event: IRegistrationExtended }) => (
  <li className={styles.mainSearchTournamentItem}>
    <Link
      className={styles.mainSearchItemLink}
      to={`/register/event/${event.event_id}`}
    >
      <h3 className={styles.mainSearchUtemTitle}>{event.event_name}</h3>
      <p className={styles.mainSearchItemDescription}>
        {event.event_startdate && (
          <span className={styles.mainSearchItemDate}>
            <time>{moment.utc(event.event_startdate).format('LL')}</time>
            {event.event_enddate && (
              <time>{` - ${moment.utc(event.event_enddate).format('LL')}`}</time>
            )}
          </span>
        )}
        {event.primary_location_city && (
          <span className={styles.mainSearchItemLocation}>
            {` - ${event.primary_location_city} ${
              event.primary_location_state
                ? `, ${event.primary_location_state}`
                : ''
            }`}
          </span>
        )}
      </p>
    </Link>
  </li>
);

export default ItemSearch;
