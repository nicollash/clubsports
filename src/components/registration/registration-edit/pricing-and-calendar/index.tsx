import React, { useEffect } from 'react';
import styles from '../styles.module.scss';
import { Input, DatePicker, Checkbox, Select } from 'components/common';
import { IRegistration } from 'common/models/registration';
import { BindingCbWithTwo, IEventDetails } from 'common/models';
import { timeToDate, dateToTime } from 'helpers';

interface IPricingAndCalendarProps {
  data?: IRegistration;
  event: IEventDetails;
  onChange: BindingCbWithTwo<string, string | number | null>;
}

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'CAD', value: 'CAD' },
];

const PricingAndCalendar = ({ data, event, onChange }: IPricingAndCalendarProps) => {

  const closeDate = +new Date(event[0].event_startdate) - 86400000;
  useEffect(() => {
    if (!data) {
      onOpenDateChange(new Date(event[0].created_datetime));
      onCloseDateChange(new Date(closeDate));
      onDiscountEndDateChange(new Date());
    }
    if (data && !data.currency) {
      onChange('currency', 'USD');
    }
  });

  const onOpenDateChange = (e: Date | string) =>
    !isNaN(Number(e)) &&
    onChange('registration_start', new Date(e).toISOString());

  const onCloseDateChange = (e: Date | string) =>
    !isNaN(Number(e)) &&
    onChange('registration_end', new Date(e).toISOString());

  const onEntryFeeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('entry_fee', e.target.value);

  const onEntryDepositChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('entry_deposit', e.target.value);

  const onEarlyBirdDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('early_bird_discount', e.target.value);

  const onDiscountEndDateChange = (e: Date | string) =>
    !isNaN(Number(e)) &&
    onChange('discount_enddate', new Date(e).toISOString());

  const onCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('currency', e.target.value);

  const onEntryDepositEnabledChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => onChange('entry_deposit_YN', Number(e.target.checked));

  const onSpecificTimeOpenChange = ({
    target: { checked },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (checked) {
      onChange('specific_time_reg_open_YN', Number(checked));
    } else {
      onChange('specific_time_reg_open_YN', Number(checked));
      onChange('specific_time_reg_open', null);
    }
  };

  const onEnableWaitListChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('enable_waitlist_YN', Number(e.target.checked));

  const onFeesVaryByDivisionChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('fees_vary_by_division_YN', Number(e.target.checked));

  const onSpecificTimeRegOpen = (date: Date) => {
    onChange('specific_time_reg_open', dateToTime(date));
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionRow}>
        <div className={styles.sectionItem} />
        <div className={styles.sectionItem} />
        <div className={styles.sectionItem}>
          <DatePicker
            fullWidth={true}
            label="Open Date"
            type="date"
            value={data ? data.registration_start :  event[0].created_datetime}
            onChange={onOpenDateChange} 
          />
        </div>
        <div className={styles.sectionItem}>
          <DatePicker
            fullWidth={true}
            label="Close Date"
            type="date"
            value={data ? data.registration_end : new Date(closeDate)}
            onChange={onCloseDateChange}
          />
        </div>
      </div>
      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <Input
            fullWidth={true}
            label="Registration Fee"
            startAdornment="$"
            type="number"
            autofocus={true}
            value={data ? data.entry_fee : ''}
            onChange={onEntryFeeChange}
          />
        </div>
        <div className={styles.sectionItem}>
          <Select
            options={currencyOptions}
            label="Currency"
            value={data ? data.currency : 'USD'}
            onChange={onCurrencyChange}
          />
        </div>
        <div className={styles.sectionItem}>
          <Input
            fullWidth={true}
            label="Early Bird Discount"
            startAdornment="$"
            type="number"
            value={data?.early_bird_discount ? data.early_bird_discount : ''}
            onChange={onEarlyBirdDiscountChange}
          />
        </div>
        <div className={styles.sectionItem}>
          <DatePicker
            fullWidth={true}
            label="Discount End Date"
            type="date"
            value={data ? data.discount_enddate : new Date()}
            onChange={onDiscountEndDateChange}
          />
        </div>
      </div>
      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <Checkbox
            onChange={onEntryDepositEnabledChange}
            options={[
              {
                label: 'Entry Deposit Enabled',
                checked: Boolean(data ? data.entry_deposit_YN : false),
              },
            ]}
          />
          {data?.entry_deposit_YN ? (
            <Input
              fullWidth={true}
              startAdornment="$"
              type="number"
              value={data ? data.entry_deposit : ''}
              onChange={onEntryDepositChange}
            />
          ) : null}
        </div>
        <div className={styles.sectionItem}>
          <Checkbox
            onChange={onFeesVaryByDivisionChange}
            options={[
              {
                label: 'Division Fees Vary',
                checked: Boolean(data ? data.fees_vary_by_division_YN : false),
              },
            ]}
          />
        </div>
        <div className={styles.sectionItem}>
          <Checkbox
            onChange={onSpecificTimeOpenChange}
            options={[
              {
                label: 'Registrations Open At a Specific Time',
                checked: Boolean(data ? data.specific_time_reg_open_YN : false),
              },
            ]}
          />
          {Boolean(data?.specific_time_reg_open_YN) && (
            <DatePicker
              onChange={onSpecificTimeRegOpen}
              minWidth="100%"
              type="time"
              value={timeToDate(data?.specific_time_reg_open || '')}
            />
          )}
        </div>
        <div className={styles.sectionItem}>
          <Checkbox
            onChange={onEnableWaitListChange}
            options={[
              {
                label: 'Enable a Waitlist',
                checked: Boolean(data ? data.enable_waitlist_YN : false),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default PricingAndCalendar;
