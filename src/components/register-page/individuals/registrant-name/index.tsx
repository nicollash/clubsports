import React from 'react';
import styles from '../../styles.module.scss';
import { Input, Checkbox } from 'components/common';
import { BindingCbWithTwo, BindingCbWithOne } from 'common/models';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/high-res.css';
import { IIndividualsRegister } from 'common/models/register';
import EmailInput from "components/common/email-input";

interface IRegistrantNameProps {
  data: Partial<IIndividualsRegister>;
  onChange: BindingCbWithTwo<string, string | number>;
  onError: BindingCbWithOne<boolean>;
}

const RegistrantName = ({ data, onChange, onError }: IRegistrantNameProps) => {
  const onFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('registrant_first_name', e.target.value);

  const onLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('registrant_last_name', e.target.value);

  const onPhoneNumberChange = (value: string) =>
    onChange('registrant_mobile', value);

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('registrant_email', e.target.value);

  const onIsParticipantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('registrant_is_the_participant', Number(e.target.checked));
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <Input
            fullWidth={true}
            label="First Name"
            value={data.registrant_first_name || ''}
            onChange={onFirstNameChange}
            isRequired={true}
          />
        </div>
        <div className={styles.sectionItem}>
          <Input
            fullWidth={true}
            label="Last Name"
            value={data.registrant_last_name || ''}
            isRequired={true}
            onChange={onLastNameChange}
          />
        </div>
        <div className={styles.sectionItem}>
          <EmailInput
            label="Email *"
            fullWidth={true}
            value={data.registrant_email || ''}
            isRequired={true}
            onChange={onEmailChange}
            onError={onError}
          />
        </div>
        <div className={styles.sectionItem}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionTitle}>Phone Number</div>
            <PhoneInput
              country={'us'}
              onlyCountries={['us', 'ca']}
              disableCountryCode={false}
              placeholder=""
              value={data.registrant_mobile || ''}
              onChange={onPhoneNumberChange}
              containerStyle={{ marginTop: '7px' }}
              inputStyle={{
                height: '40px',
                fontSize: '18px',
                color: '#6a6a6a',
                borderRadius: '4px',
                width: '100%',
              }}
              inputProps={{
                required: true,
                minLength: 14,
              }}
            />
          </div>
        </div>
      </div>
      <div className={styles.sectionRow}>
        <Checkbox
          onChange={onIsParticipantChange}
          options={[
            {
              label: 'Registrant is the Player',
              checked: Boolean(data.registrant_is_the_participant || false),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default RegistrantName;
