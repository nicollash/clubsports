import React from 'react';
import styles from '../styles.module.scss';
import { IRegistration } from 'common/models/registration';
import { Checkbox } from 'components/common';
import moment from 'moment';

const Payments = ({ data }: { data: Partial<IRegistration> }) => {
  let paymentSchedule = null;
  if (data?.payment_schedule_json) {
    const decodedSchedule = JSON.parse(data?.payment_schedule_json!).find(
      (x: any) => x.type === 'schedule'
    );
    if (decodedSchedule?.schedule) {
      paymentSchedule = decodedSchedule.schedule
        .map(
          (x: any) =>
            `${moment(x.date * 1000).format('YYYY-MM-DD')}: ${x.amount}%`
        )
        .join(', ');
    }
  }
  return (
    <div className={styles.section}>
      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <div>
            <span className={styles.sectionTitle}>Accept Payments</span>
            <p>{data.payments_enabled_YN ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className={styles.sectionItem}>
          {data?.upcharge_fees_on_registrations ? (
            <div>
              <span className={styles.sectionTitle}>
                Upcharge Processing Fees
              </span>
              <p>{data.upcharge_fee ? `${data.upcharge_fee}%` : '—'}</p>
            </div>
          ) : (
            <Checkbox
              options={[
                {
                  label: 'Upcharge Processing Fees',
                  checked: Boolean(
                    data ? data.upcharge_fees_on_registrations : false
                  ),
                  disabled: true,
                },
              ]}
            />
          )}
        </div>
        <div className={styles.sectionItem}>
          {data?.include_sales_tax_YN ? (
            <div>
              <span className={styles.sectionTitle}>Sales Tax Rate</span>
              <p>{data.sales_tax_rate ? `${data.sales_tax_rate}%` : '—'}</p>
            </div>
          ) : (
            <Checkbox
              options={[
                {
                  label: 'Include Sales Tax',
                  checked: Boolean(data ? data.include_sales_tax_YN : false),
                  disabled: true,
                },
              ]}
            />
          )}
        </div>
      </div>
      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <span className={styles.sectionTitle}>Installments</span>
          <p>
            {data?.payment_schedule_json
              ? paymentSchedule
                ? paymentSchedule
                : `${data.num_installments} monthly payments`
              : 'No'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payments;
