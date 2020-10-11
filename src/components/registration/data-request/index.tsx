import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { loadFormFields } from 'components/register-page/individuals/player-stats/logic/actions';
import styles from '../styles.module.scss';
import { BindingCbWithOne } from 'common/models';

enum Options {
  'Required' = 1,
  'Requested' = 0,
}

interface IRegistrationDetails {
  eventId: string;
  loadFormFields: BindingCbWithOne<string>;
  formFields: any;
}

const DataRequest = ({
  eventId,
  formFields,
  loadFormFields,
}: IRegistrationDetails) => {
  useEffect(() => {
    loadFormFields(eventId);
  }, [loadFormFields, eventId]);

  return (
    <div className={styles.section}>
      <div className={styles.sectionRowAligned}>
        {formFields.map((field: any, index: number) => (
          <div className={styles.sectionItemAligned} key={index}>
            <span className={styles.sectionTitle}>{field.data_label}</span>
            <p>{Options[field.is_required_YN] || 'Not Needed'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: {
  playerStatsReducer: { formFields: any };
}) => ({
  formFields: state.playerStatsReducer.formFields,
});

const mapDispatchToProps = {
  loadFormFields,
};

export default connect(mapStateToProps, mapDispatchToProps)(DataRequest);
