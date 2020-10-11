import React from 'react';
import { connect } from 'react-redux';
import styles from '../../styles.module.scss';
import { Input, Select } from 'components/common';
import { BindingCbWithTwo, ISelectOption, ITeamItem } from 'common/models';
import { IIndividualsRegister } from 'common/models/register';
import { CardElement } from '@stripe/react-stripe-js';
import stripeLogo from 'assets/stripeLogo.png';
import { Button } from '@material-ui/core';
// import CardHelp from '../../card-help';

interface IPaymentSelectionOptions extends ISelectOption {
  price: number;
  payment_plan_id: string;
  notice: string;
}

interface IPaymentProps {
  data: Partial<IIndividualsRegister>;
  onChange: BindingCbWithTwo<string, string | number>;
  processing: boolean;
  purchasing: boolean;
  paymentSelectionOptions: IPaymentSelectionOptions[];
  teams: ITeamItem[];
  reloadPaymentPlans(): void;
}

const paymentMethodOptions = [
  { label: 'Credit Card', value: 'Credit Card' },
  { label: 'Check', value: 'Check' },
  { label: 'ACH', value: 'ACH' },
];

const Payment = ({
  data,
  onChange,
  processing,
  paymentSelectionOptions,
  teams,
  reloadPaymentPlans,
}: IPaymentProps) => {
  const onPaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('payment_method', e.target.value);

  const onDiscountCodeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('discount_code', e.target.value);

  const onPaymentSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('payment_selection', e.target.value);

  let totalAmountNotice;

  if (data.payment_selection) {
    const selectedPlan = paymentSelectionOptions.find(
      x => x.value === data.payment_selection
    )!;

    totalAmountNotice = (
      <div>
        {teams.length > 1 ? 'For each team: ' : ''}
        {selectedPlan.notice}
      </div>
    );
  }

  const paymentForm = (
    <div className={styles.section}>
      <div className={styles.paymentRow}>
        <div className={styles.sectionRow}>
          <div className={styles.sectionItem}>
            <Select
              options={paymentSelectionOptions}
              label='Payment Options'
              disabled={processing}
              value={data.payment_selection || ''}
              onChange={onPaymentSelectionChange}
            />
          </div>
          <div className={styles.sectionItem}>
            <Select
              options={paymentMethodOptions}
              label='Payment Method'
              disabled={true}
              value={data.payment_method || ''}
              onChange={onPaymentMethodChange}
              isRequired={true}
            />
          </div>
          <div className={styles.sectionItem}>
            <Input
              fullWidth={true}
              label='Discount Code'
              disabled={processing}
              value={data.discount_code || ''}
              onChange={onDiscountCodeChange}
            />
            <Button onClick={reloadPaymentPlans} color='primary'>
              Apply Code
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.sectionRow}>
        <strong>{totalAmountNotice}</strong>
      </div>
      <div className={styles.sectionRow}>&nbsp;</div>
      <div className={styles.cardWrapp}>
        <div className={styles.card}>
          <div className={styles.sectionTitle}>Card Details</div>
          <CardElement
            className={styles.stripeElement}
            options={{
              disabled:
                data.payment_method !== 'Credit Card' || processing
                  ? true
                  : false,
              iconStyle: 'solid',
              style: {
                base: {
                  iconColor: '#1c315f',
                  fontSize: '16px',
                  color: '#6a6a6a',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <img
          src={stripeLogo}
          style={{
            marginLeft: '46px',
            width: '150px',
            height: '75px',
          }}
          alt='Stripe logo'
        />
      </div>
    </div>
  );

  return paymentForm;
};

const mapStateToProps = (state: { regTeams: { teams: ITeamItem[] } }) => ({
  teams: state.regTeams.teams,
});

export default connect(mapStateToProps)(Payment);
