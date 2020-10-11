import React from 'react';
import axios from 'axios';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { Input, Select, CardMessage } from 'components/common/';
import Checkbox from 'components/common/buttons/checkbox';
import styles from '../styles.module.scss';
import { sortByField } from 'helpers';
import { IDivision, ITeam, ISelectOption, IUSAState } from 'common/models';
import { SortByFilesTypes } from 'common/enums';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { CardMessageTypes } from 'components/common/card-message/types';

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

interface ICreateTeamFormProps {
  key: number;
  index: number;
  onChange: any;
  team: Partial<ITeam>;
  divisions: IDivision[];
}

interface ICreateTeamFormState {
  states: ISelectOption[];
}

class CreateTeamForm extends React.Component<
  ICreateTeamFormProps,
  ICreateTeamFormState
  > {
  constructor(props: any) {
    super(props);

    this.state = {
      states: [],
    };
  }
  onLongNameChange = (e: InputTargetValue) => {
    this.props.onChange('long_name', e.target.value, this.props.index);
  };

  onShortNameChange = (e: InputTargetValue) =>
    this.props.onChange('short_name', e.target.value, this.props.index);

  onTagChange = (e: InputTargetValue) =>
    this.props.onChange('team_tag', e.target.value, this.props.index);

  onCityChange = (e: InputTargetValue) =>
    this.props.onChange('city', e.target.value, this.props.index);

  onStateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onChange('state', e.target.value, this.props.index);

  onDivisionChange = (e: InputTargetValue) => {
    this.props.onChange('division_id', e.target.value, this.props.index);
  };

  onLevelChange = (e: InputTargetValue) =>
    this.props.onChange('level', e.target.value, this.props.index);

  onFirstNameChange = (e: InputTargetValue) =>
    this.props.onChange('contact_first_name', e.target.value, this.props.index);

  onLastNameChange = (e: InputTargetValue) =>
    this.props.onChange('contact_last_name', e.target.value, this.props.index);

  onPhoneChange = (value: string) =>
    this.props.onChange('phone_num', value, this.props.index);

  onEmailChange = (e: InputTargetValue) =>
    this.props.onChange('contact_email', e.target.value, this.props.index);

  onScheduleRestrictionsChange = (e: InputTargetValue) => {
    this.props.onChange(
      'schedule_restrictions',
      e.target.checked ? 1 : 0,
      this.props.index
    );
  };

  componentDidMount() {
    axios.get('/states').then(response => {
      const selectStateOptions = response.data.map((it: IUSAState) => ({
        label: it.state_id,
        value: it.state_name,
      }));

      const sortedSelectStateOptions = selectStateOptions.sort(
        (a: ISelectOption, b: ISelectOption) =>
          a.label.localeCompare(b.label, undefined, { numeric: true })
      );

      this.setState({ states: sortedSelectStateOptions });
    });
  }

  render() {
    const {
      long_name,
      short_name,
      team_tag,
      city,
      state,
      division_id,
      level,
      contact_first_name,
      contact_last_name,
      phone_num,
      contact_email,
      schedule_restrictions,
    } = this.props.team;
    const { states } = this.state;

    const divisionsOptions = sortByField(
      this.props.divisions,
      SortByFilesTypes.DIVISIONS
    ).map((division: IDivision) => ({
      label: division.short_name,
      value: division.division_id,
    }));

    const levelOptions = [
      { label: 'Very', value: 'Very Competitive' },
      { label: 'Somewhat', value: 'Somewhat' },
      { label: 'Not Competitive', value: 'Not Competitive' },
      { label: 'Unknown', value: 'Unknown' },
    ];

    return (
      <div className={styles.sectionContainer}>
        <div className={styles.section}>
          <div className={styles.sectionRow}>
            <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
              Long Names do not render well on phones. So please enter both a
              long (web) and short (mobile)!
            </CardMessage>
            <div className={styles.sectionItem} />
          </div>
          <div className={styles.sectionRow}>
            <div className={styles.sectionItemLarge}>
              <Input
                fullWidth={true}
                label="Long Name (For Browser) *"
                placeholder = "Max 30 characters"
                value={long_name || ''}
                autofocus={true}
                onChange={this.onLongNameChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <Input
                fullWidth={true}
                label="Short Name (On Mobile) *"
                placeholder= "Max 15 characters"
                value={short_name || ''}
                onChange={this.onShortNameChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <Input
                fullWidth={true}
                label="Team Tag (Social Media)"
                placeholder = "InstagramTag"
                startAdornment="@"
                value={team_tag || ''}
                onChange={this.onTagChange}
              />
            </div>
            <div className={styles.sectionItem} />
          </div>
          <div className={styles.sectionRow}>
            <div className={styles.sectionItemLarge}>
              <Input
                fullWidth={true}
                label="City"
                placeholder = "Differentiates teams/people want to know..."
                value={city || ''}
                onChange={this.onCityChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <Select
                options={states}
                label="State *"
                value={state || ''}
                onChange={this.onStateChange}
                isRequired={true}
              />
            </div>
            <div className={styles.sectionItem}>
              <Select
                label="Division *"
                options={divisionsOptions}
                value={division_id || ''}
                onChange={this.onDivisionChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <Select
                label="Competitiveness"
                options={[...levelOptions]}
                value={level || ''}
                onChange={this.onLevelChange}
              />
            </div>
          </div>
          <div className={styles.sectionRow}>
            <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
              Entering States enables eliminating intra-state games when
              creating schedules! 2 Letter States (e.g., IL, NJ) or 3 for
              Canadian Provinces!
            </CardMessage>
            <div className={styles.sectionItem} />
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionRow}>
            <div className={styles.sectionItem}>
              <Input
                fullWidth={true}
                label="Coach First Name *"
                placeholder = "First"
                value={contact_first_name || ''}
                onChange={this.onFirstNameChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <Input
                fullWidth={true}
                label="Last Name *"
                placeholder = "Last"
                value={contact_last_name || ''}
                onChange={this.onLastNameChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <div className={styles.title}>Mobile Number *</div>
              <PhoneInput
                country={'us'}
                disableDropdown
                onlyCountries={['us']}
                disableCountryCode={true}
                placeholder=""
                value={phone_num || ''}
                onChange={this.onPhoneChange}
                containerStyle={{ marginTop: '7px' }}
                inputStyle={{
                  height: '42px',
                  fontSize: '18px',
                  color: '#6a6a6a',
                  borderRadius: '4px',
                  width: '100%',
                }}
                inputClass={styles.phoneInput}
              />
            </div>
            <div className={styles.sectionItemLarge}>
              <div className={styles.label}>Email *</div>
              <ValidatorForm onSubmit={() => { }}>
                <TextValidator
                  onChange={this.onEmailChange}
                  value={contact_email || ''}
                  name="email"
                  placeholder = "thecoach@gmail.com"
                  validators={['required', 'isEmail']}
                  errorMessages={['This field is required', 'Invalid email address']}
                />
              </ValidatorForm>
            </div>
          </div>
          <div className={styles.sectionRow}>
            <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
              Mobile numbers are needed by event staff to call coaches if their
              team is Missing In Action!
            </CardMessage>
          </div>
          <div className={styles.sectionRow}>
            <div>
              <Checkbox
                formLabel=""
                options={[
                  {
                    label: 'Team has Scheduling Restrictions',
                    checked: Boolean(schedule_restrictions),
                  },
                ]}
                onChange={this.onScheduleRestrictionsChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CreateTeamForm;
