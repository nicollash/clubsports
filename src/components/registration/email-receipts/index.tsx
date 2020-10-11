import React from 'react';
import { Checkbox } from 'components/common';
import { IRegistration } from 'common/models';

import styles from '../styles.module.scss';

interface IEmailReceipts {
  data: Partial<IRegistration>;
}

const EmailReceipts = ({ data }: IEmailReceipts) => {

  const emailReceiptsData = !data || data.welcome_email_settings == null
    ? null
    : JSON.parse(data.welcome_email_settings);

  return (
    <div className={styles.section}>

      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <h3>Email Sender Settings</h3>
        </div>
      </div>

      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <span className={styles.sectionTitle}>From:</span>
          <p>{emailReceiptsData ? emailReceiptsData.from : '—'}</p>
        </div>
        <div className={styles.sectionItem}>
          <span className={styles.sectionTitle}>Reply to:</span>
          <p>{emailReceiptsData ? emailReceiptsData.replyTo : '—'}</p>
        </div>
        <div className={styles.sectionItem}>
          <span className={styles.sectionTitle}>Subject:</span>
          <p>{emailReceiptsData ? emailReceiptsData.subject : '—'}</p>
        </div>

        <div className={styles.sectionItem}>
          <span className={styles.sectionTitle}>Contact for Refunds/Concerns:</span>
          <p>{emailReceiptsData ? emailReceiptsData.contactPerson : '—'}</p>
        </div>
      </div>

      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          {emailReceiptsData && emailReceiptsData !== null
            ? <Checkbox
              options={[
                {
                  label: 'Additional Instructions (body of email)',
                  checked: Boolean(emailReceiptsData ? emailReceiptsData.includeAdditionalInstructions : false),
                  disabled: true,
                },
              ]}
            />
            : <div>
              <span className={styles.sectionTitle}>Additional Instructions (body of email)</span>
              <p>—</p>
            </div>
          }
        </div>
        <div className={`${styles.sectionItem} `}>
          {emailReceiptsData && emailReceiptsData !== null
            ? <Checkbox
              options={[
                {
                  label: 'Include Cancellation Policy',
                  checked: Boolean(emailReceiptsData ? emailReceiptsData.includeCancellationPolicy : false),
                  disabled: true,
                },
              ]}
            />
            : <div>
              <span className={styles.sectionTitle}>Cancellation Policy</span>
              <p>—</p>
            </div>
          }

        </div>
        <div className={styles.sectionItem}>
          {emailReceiptsData && emailReceiptsData !== null
            ? <Checkbox
              options={[
                {
                  label: 'Event Logo',
                  checked: Boolean(emailReceiptsData ? emailReceiptsData.includeEventLogo : false),
                  disabled: true,
                },
              ]}
            />
            : <div>
              <span className={styles.sectionTitle}>Include Event Logo</span>
              <p>—</p>
            </div>
          }
        </div>
        <div className={styles.sectionItem} />
      </div>

      <div className={styles.sectionRow}>
        {emailReceiptsData && emailReceiptsData.includeAdditionalInstructions ? (
          <div className={styles.sectionItem}>
            <h3>Email body</h3>
          </div>
        ) : null}
      </div>

      <div className={styles.sectionRow}>
        {emailReceiptsData && emailReceiptsData.includeAdditionalInstructions ? (
          <div className={`${styles.emailReceiptsView} ql-snow ql-editor `}>
            <div dangerouslySetInnerHTML={{ __html: emailReceiptsData.body }} />
          </div>
        ) : null}
      </div>

    </div>
  )
}

export default EmailReceipts;