import React from "react";
import styles from "../styles.module.scss";
import { IRegistration, BindingCbWithTwo } from "common/models";
import { Checkbox, Input, Select, Radio } from "components/common";
import PaymentSchedule from "./payment-schedule";

interface IPaymentsProps {
  data?: IRegistration;
  onChange: BindingCbWithTwo<string, string | number>;
}

const installmentOptions = [
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
];

export enum installmentTypeOptions {
  "Equal Monthly Payments" = 0,
  "Schedule" = 1,
}

const installmentTypeRadioOptions = [
  installmentTypeOptions[0],
  installmentTypeOptions[1],
];

const Payments = ({ data, onChange }: IPaymentsProps) => {
  const onUpchargeProcessingFeesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => onChange("upcharge_fees_on_registrations", Number(e.target.checked));

  const onPaymentsEnabledYNChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange("payments_enabled_YN", Number(e.target.checked));

  const onRegSaverEnabledYNChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange("regsaver_enabled_YN", Number(e.target.checked));

  const onIncludeSalesTaxYNChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange("include_sales_tax_YN", Number(e.target.checked));

  const onInstallmentPaymentsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (Boolean(e.target.checked)) {
      onChange("installment_payments_YN", 0);
      onChange("num_installments", 0);
      onChange("payment_schedule_json", "[]");
    } else {
      onChange("payment_schedule_json", "");
      onChange("installment_payments_YN", 1);
      onChange("num_installments", 1);
    }
  };

  const onInstallmentPaymentTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let newPaymentScheduleJson: any[] = [];
    if (e.target.value === installmentTypeOptions[1]) {
      newPaymentScheduleJson = [
        {
          id: "FP",
          name: "Pay in full",
          type: "installment",
          iterations: 1,
          interval: "month",
          intervalCount: "1",
        },
        {
          id: "S",
          type: "schedule",
          name: "Pay later",
          schedule: [
            {
              date: new Date().getTime() / 1000,
              amount: 100,
              amountType: "percent",
            },
          ],
        },
      ];

      onChange("payment_schedule_json", JSON.stringify(newPaymentScheduleJson));
      onChange("installment_payments_YN", 0);
      onChange("num_installments", 1);
    } else if (e.target.value === installmentTypeOptions[0]) {
      onChange("payment_schedule_json", JSON.stringify(newPaymentScheduleJson));
      onChange("installment_payments_YN", 1);
      onChange("num_installments", 1);
    }
  };

  const onNumInstallmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange("num_installments", e.target.value);
    const plans = [];
    for (let i = 1; i <= +e.target.value; i++) {
      const plan = {
        id: i === 1 ? "FP" : `${i}M`,
        name: i === 1 ? "Pay in full" : `${i} installments`,
        type: "installment",
        iterations: i,
        interval: "day",
        intervalCount: "1",
      };
      plans.push(plan);
    }
    if (scheduleIsPresent) {
      plans.push(paymentSchedule);
    }
    onChange("payment_schedule_json", JSON.stringify(plans));
  };

  const onUpchargeFeeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange("upcharge_fee", e.target.value);

  const onSalesTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange("sales_tax_rate", e.target.value);

  // const onPaymentScheduleJsonChange = (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => onChange('payment_schedule_json', e.target.value);

  const paymentSchedule = data?.payment_schedule_json
    ? JSON.parse(data?.payment_schedule_json!)?.find(
        (x: any) => x.type === "schedule"
      )
    : null;

  const onScheduleChange = (schedule: any) => {
    const newPaymentScheduleJson = JSON.parse(
      data?.payment_schedule_json!
    ).map((paymentOption: any) =>
      paymentOption.type === "schedule" ? schedule : paymentOption
    );
    onChange("payment_schedule_json", JSON.stringify(newPaymentScheduleJson));
  };

  const scheduleIsPresent =
    data?.payment_schedule_json &&
    JSON.parse(data?.payment_schedule_json).find(
      (x: any) => x.type === "schedule"
    )
      ? true
      : false;

  return (
    <div className={styles.section}>
      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <Checkbox
            onChange={onPaymentsEnabledYNChange}
            options={[
              {
                label: "Accept Payments",
                checked: Boolean(data ? data.payments_enabled_YN : false),
              },
            ]}
          />
        </div>
        <div className={styles.sectionItem}>
          <Checkbox
            onChange={onRegSaverEnabledYNChange}
            options={[
              {
                label: "Offer RegSaver Insurance to All Registrants",
                checked: Boolean(data ? data.regsaver_enabled_YN : false),
              },
            ]}
          />
        </div>

        <div
          className={styles.sectionItem}
          style={{ flexGrow: 1, maxWidth: "30%" }}
        >
          <Checkbox
            onChange={onUpchargeProcessingFeesChange}
            options={[
              {
                label: "Upcharge Processing Fees to Registrants",
                checked: Boolean(
                  data ? data.upcharge_fees_on_registrations : false
                ),
              },
            ]}
          />
          {data?.upcharge_fees_on_registrations ? (
            <Input
              fullWidth={true}
              endAdornment="%"
              type="number"
              value={data ? data.upcharge_fee : ""}
              onChange={onUpchargeFeeChange}
            />
          ) : null}
        </div>
        <div className={styles.sectionItem}>
          <Checkbox
            onChange={onIncludeSalesTaxYNChange}
            options={[
              {
                label: "Add Sales Tax Fees On Top of Costs",
                checked: Boolean(data ? data.include_sales_tax_YN : false),
              },
            ]}
          />
          {data?.include_sales_tax_YN ? (
            <Input
              fullWidth={true}
              endAdornment="%"
              type="number"
              value={data ? data.sales_tax_rate : ""}
              onChange={onSalesTaxRateChange}
            />
          ) : null}
        </div>
      </div>
      <div className={styles.sectionRow}>
        <div
          className={styles.sectionItem}
          style={{ flexGrow: 1, maxWidth: "30%" }}
        >
          <Checkbox
            onChange={onInstallmentPaymentsChange}
            options={[
              {
                label: "Enable Installment Payments",
                checked: Boolean(data?.payment_schedule_json),
              },
            ]}
          />
        </div>
        <div className={styles.sectionItem}>
          {data?.payment_schedule_json ? (
            <Radio
              options={installmentTypeRadioOptions}
              checked={installmentTypeRadioOptions[Number(scheduleIsPresent)]}
              onChange={onInstallmentPaymentTypeChange}
              row={true}
            />
          ) : null}
        </div>
      </div>
      <div className={styles.sectionRow}>
        {!scheduleIsPresent && data?.payment_schedule_json ? (
          <div
            className={styles.sectionItem}
            style={{ flexGrow: 1, maxWidth: "30%" }}
          >
            <Select
              options={installmentOptions}
              label="Number of monthly installments"
              value={data ? String(data.num_installments) : ""}
              onChange={onNumInstallmentsChange}
            />
          </div>
        ) : null}
        {/* <Input
            fullWidth={true}
            label="Payment Schedule"
            type="text"
            value={data ? data.payment_schedule_json : ''}
            onChange={onPaymentScheduleJsonChange}
          /> */}
        {paymentSchedule ? (
          <div
            className={styles.sectionItem}
            style={{ flexGrow: 1, justifyItems: "left", maxWidth: "100%" }}
          >
            <PaymentSchedule
              schedule={paymentSchedule}
              onScheduleChange={onScheduleChange}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Payments;
