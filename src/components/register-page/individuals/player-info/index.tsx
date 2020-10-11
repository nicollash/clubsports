/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import styles from '../../styles.module.scss';
import { Input, Select, DatePicker } from 'components/common';
import { BindingCbWithTwo, ISelectOption, BindingCbWithOne } from 'common/models';
import 'react-phone-input-2/lib/high-res.css';
import PhoneInput from 'react-phone-input-2';
import { IIndividualsRegister } from 'common/models/register';
import EmailInput from "components/common/email-input";

interface IPlayerInfoProps {
  data: Partial<IIndividualsRegister>;
  onChange: BindingCbWithTwo<string, string | number>;
  fillParticipantInfo: any;
  divisions: ISelectOption[];
  states: ISelectOption[];
  isInvited: boolean;
  datePickerRequired: boolean;
  onError: BindingCbWithOne<boolean>;
}

// const playerLevelOptions = [{ label: 'Level1', value: 'Level1' }];

const PlayerInfo = ({
  data,
  onChange,
  fillParticipantInfo,
  divisions,
  states,
  isInvited,
  datePickerRequired,
  onError,
}: IPlayerInfoProps) => {
  const [selectedDate, setSelectedDate] = useState(
    data.player_birthdate ? data.player_birthdate : null
  );
  const [isEmailCorrect, setIsEmailCorrect] = useState<boolean>(true);
  const [isBirthDateCorrect, setIsBirthDateCorrect] = useState<boolean>(true);

  useEffect(() => {
    if (data.registrant_is_the_participant) {
      const info = {
        participant_first_name: data.registrant_first_name,
        participant_last_name: data.registrant_last_name,
        participant_mobile: data.registrant_mobile,
        participant_email: data.registrant_email,
      };
      fillParticipantInfo(info);
    }
  }, []);

  useEffect(() => {
    onError(!isEmailCorrect || !isBirthDateCorrect);
  }, [isEmailCorrect, isBirthDateCorrect]);

  const onFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('participant_first_name', e.target.value);

  const onLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('participant_last_name', e.target.value);

  const onPhoneNumberChange = (value: string) =>
    onChange('participant_mobile', value);

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('participant_email', e.target.value);

  const onPlayerCityChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('player_city', e.target.value);

  const onPlayerStateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('player_state', e.target.value);

  const onDivisionChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('ext_sku', e.target.value);

  // const onPlayerLevelSelect = (e: React.ChangeEvent<HTMLInputElement>) =>
  //   onChange('player_level', e.target.value);

  const onPlayerBirthdayChange = (e: Date | string) => {
    const date = new Date(e);
    !isNaN(Number(e)) &&
      onChange("player_birthdate", date.toISOString());
    setSelectedDate(e ? date.toString() : '');
    setIsBirthDateCorrect(e ? e.toString() !== "Invalid Date" : true);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <Input
            fullWidth={true}
            label='Participant First Name'
            value={data.participant_first_name || ''}
            isRequired={true}
            onChange={onFirstNameChange}
          />
        </div>
        <div className={styles.sectionItem}>
          <Input
            fullWidth={true}
            label='Participant Last Name'
            value={data.participant_last_name || ''}
            isRequired={true}
            onChange={onLastNameChange}
          />
        </div>

        <div className={styles.sectionItem}>
          <DatePicker
            dateFormat='MM/dd/yyyy'
            fullWidth={true}
            label={`Birthdate ${datePickerRequired ? '(MM/DD/YYYY)' : ''}`}
            type='date'
            value={selectedDate}
            isRequired={datePickerRequired}
            onChange={onPlayerBirthdayChange}
            disableFuture={true}
            initialFocusedDate={new Date(2000, 0, 1)}
          />
        </div>

        <div className={styles.sectionItem}>
          <Select
            options={divisions}
            label='Division'
            value={data.ext_sku || ''}
            isRequired={true}
            onChange={onDivisionChange}
            disabled={isInvited}
          />
        </div>
      </div>
      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <EmailInput
            fullWidth={true}
            label='Email'
            value={data.participant_email || ''}
            isRequired={true}
            onChange={onEmailChange}
            onError={error => setIsEmailCorrect(!error)}
          />
        </div>
        <div className={styles.sectionItem}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionTitle}>Phone Number</div>
            <PhoneInput
              country={'us'}
              // disableDropdown
              onlyCountries={['us', 'ca']}
              disableCountryCode={false}
              placeholder=''
              value={data.participant_mobile || ''}
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
        <div className={styles.sectionItem}>
          <Input
            fullWidth={true}
            label='City'
            value={data.player_city || ''}
            isRequired={true}
            onChange={onPlayerCityChange}
          />
        </div>
        <div className={styles.sectionItem}>
          <Select
            options={states}
            label='State/Province'
            value={data.player_state || ''}
            onChange={onPlayerStateChange}
            isRequired={true}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
