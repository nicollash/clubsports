import React from 'react';
import styles from '../styles.module.scss';
import { IRegistration } from 'common/models';
import { Checkbox } from 'components/common';

enum Options {
  'Required' = 1,
  'Requested' = 2,
  'Not Needed' = 0,
}

interface IRegistrationDetails {
  data: IRegistration;
  eventType: string;
}

const RegistrationDetails = ({ data, eventType }: IRegistrationDetails) => (
  <div className={styles.section}>
    <div className={styles.sectionRow}>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Alternative Division Name Label</span>
        <p>{data.division_name_label || '—'}</p>
      </div>
      <div className={styles.sectionItem}>
        {eventType === 'Showcase' ? (
          <>
            <span className={styles.sectionTitle}>
              Max Players Per Division
            </span>
            <p>{data.max_players_per_division || 'Not specified'}</p>
          </>
        ) : (
          <>
            <span className={styles.sectionTitle}>Max Teams Per Division</span>
            <p>{data.max_teams_per_division || 'Not specified'}</p>
          </>
        )}
      </div>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Max Athletes on Roster</span>
        <p>{data.max_players_per_roster || 'Not specified'}</p>
      </div>
      <div className={styles.sectionItem} />
    </div>
    <div className={styles.sectionRow}>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Athlete Birth Date</span>
        <p>{Options[data.request_athlete_birthdate] || 'Not specified'}</p>
      </div>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Athlete Jersey Number</span>
        <p>{Options[data.request_athlete_jersey_number] || 'Not specified'}</p>
      </div>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Athlete Email</span>
        <p>{Options[data.request_athlete_email] || 'Not specified'}</p>
      </div>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>US Lacrosse Membership</span>
        <p>{Options[data.us_lax_memb_YN] || 'Not specified'}</p>
      </div>
    </div>
    <div className={styles.sectionInfoRow}>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Refund Policy:</span>
        <p>{data.disclaimer || 'Nothing Specified'}</p>
      </div>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Registration Details:</span>
        <p>{data.registration_information || 'Nothing Specified'}</p>
      </div>
    </div>
    <div className={styles.sectionRow}>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Event Director First Name</span>
        <p>{data.reg_first_name || '—'}</p>
      </div>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Event Director Last Name</span>
        <p>{data.reg_last_name || '—'}</p>
      </div>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Role</span>
        <p>{data.role || '—'}</p>
        <span className={styles.tournamentStatus} />
      </div>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Email</span>
        <p>{data.email_address || '—'}</p>
      </div>
    </div>
    <div className={styles.sectionRow}>
      <div className={styles.sectionItem}>
        <span className={styles.sectionTitle}>Phone Number</span>
        <p>{data.mobile_number ? `+${data.mobile_number}` : '—'}</p>
      </div>
      <div className={styles.sectionItem}>
        <Checkbox
          formLabel=""
          options={[
            {
              label: 'Permission to Text',
              checked: data ? Boolean(data.permission_to_text) : Boolean(0),
              disabled: true,
            },
          ]}
        />
      </div>
      <div className={styles.sectionItem} />
      <div className={styles.sectionItem} />
    </div>
  </div>
);

export default RegistrationDetails;
