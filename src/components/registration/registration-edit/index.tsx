import React from 'react';
import HeadingLevelTwo from '../../common/headings/heading-level-two';
import Button from '../../common/buttons/button';
import SectionDropdown from '../../common/section-dropdown';
import DataRequest from './data-request';
import styles from './styles.module.scss';
import Paper from '../../common/paper';
import PricingAndCalendar from './pricing-and-calendar';
import RegistrationDetails from './registration-details';
import Payments from './payments';
import PromoCodes from './promo-codes';
import { IEventDetails } from 'common/models/event';
import {
  IRegistration,
  IWelcomeSettings,
  IContactPerson,
} from 'common/models/registration';
import {
  BindingAction,
  BindingCbWithTwo,
  IDivision,
  BindingCbWithOne,
} from 'common/models';
import { ButtonFormTypes, EventMenuRegistrationTitles } from 'common/enums';
import FabButton from 'components/common/fab-button';
import { PopupExposure } from 'components/common';
import Waiver from '../waiver';
import EmailReceipts from './email-receipts';

interface IRegistrationEditProps {
  onCancel: BindingAction;
  onSave: BindingAction;
  registration?: IRegistration;
  onChange: BindingCbWithTwo<string, any>;
  changesAreMade: boolean;
  divisions: IDivision[];
  eventType: string;
  eventId: string;
  event: IEventDetails;
  onAddNewField: () => void;
  editField: BindingCbWithOne<any>;
  registrantDataFields: any;
}

interface IRegistrationEditState {
  isExposurePopupOpen: boolean;
}

class RegistrationEdit extends React.Component<
  IRegistrationEditProps,
  IRegistrationEditState
> {
  state = { isExposurePopupOpen: false };

  onModalClose = () => {
    this.setState({ isExposurePopupOpen: false });
  };

  onCancelClick = () => {
    if (this.props.changesAreMade) {
      this.setState({ isExposurePopupOpen: true });
    } else {
      this.props.onCancel();
    }
  };

  mapEmailSettingToObj = () => {
    const { registration } = this.props;

    if (!registration) {
      return;
    }

    const emailSetting = !registration.welcome_email_settings
      ? {
          from: '',
          replyTo: '',
          subject: '',
          contactPerson: '',
          includeCancellationPolicy: 0,
          includeEventLogo: 0,
          includeAdditionalInstructions: 0,
          body: '',
        }
      : JSON.parse(registration.welcome_email_settings);

    const contactPerson: IContactPerson = !emailSetting?.contactPerson
      ? {
          contactName: '',
          contactEmail: '',
          contactPhoneNumber: '',
        }
      : {
          contactName: emailSetting.contactPerson.substring(
            0,
            emailSetting.contactPerson.indexOf(' (')
          ),
          contactEmail: emailSetting.contactPerson.substring(
            emailSetting.contactPerson.indexOf('(') + 1,
            emailSetting.contactPerson.indexOf(',')
          ),
          contactPhoneNumber: emailSetting.contactPerson.substring(
            emailSetting.contactPerson.indexOf('+') + 1,
            emailSetting.contactPerson.indexOf(')')
          ),
        };
    emailSetting.contactPerson = contactPerson;

    return emailSetting;
  };

  mapObjToEmailSettings = (emailSettings: IWelcomeSettings) => {
    const {
      contactName,
      contactEmail,
      contactPhoneNumber,
    } = emailSettings.contactPerson;

    return {
      ...emailSettings,
      contactPerson: `${contactName} (${contactEmail}, +${contactPhoneNumber})`,
    };
  };

  onChangeEmailSettings = (emailSettings: IWelcomeSettings) => {
    this.props.onChange(
      'welcome_email_settings',
      JSON.stringify(this.mapObjToEmailSettings(emailSettings))
    );
  };

  render() {
    const {
      onAddNewField,
      registrantDataFields,
      eventId,
      editField,
    } = this.props;

    return (
      <section>
        <form
          onSubmit={event => {
            event.preventDefault();
            this.props.onSave();
          }}
          ref='formToSubmit'
        >
          <Paper sticky={true}>
            <div className={styles.mainMenu}>
              <div className={styles.btnsWrapper}>
                <Button
                  label='Cancel'
                  variant='text'
                  color='secondary'
                  onClick={this.onCancelClick}
                />
                <Button
                  label='Save'
                  variant='contained'
                  color='primary'
                  btnType={ButtonFormTypes.SUBMIT}
                />
                <FabButton
                  onClick={this.onCancelClick}
                  sequence={1}
                  label='Cancel'
                  variant='outlined'
                />
                <FabButton
                  btnType={ButtonFormTypes.SUBMIT}
                  sequence={2}
                  label='Save'
                  variant='contained'
                />
              </div>
            </div>
          </Paper>
          <div className={styles.sectionContainer}>
            <div className={styles.heading}>
              <HeadingLevelTwo>Registration</HeadingLevelTwo>
            </div>
            <ul className={styles.libraryList}>
              <li>
                <SectionDropdown
                  type='section'
                  panelDetailsType='flat'
                  isDefaultExpanded={true}
                >
                  <span>Pricing &amp; Calendar</span>
                  <PricingAndCalendar
                    event={this.props.event}
                    data={this.props.registration}
                    onChange={this.props.onChange}
                  />
                </SectionDropdown>
              </li>
              <li>
                <SectionDropdown
                  type='section'
                  panelDetailsType='flat'
                  isDefaultExpanded={true}
                >
                  <span>Registration Details</span>
                  <RegistrationDetails
                    data={this.props.registration}
                    onChange={this.props.onChange}
                    eventType={this.props.eventType}
                  />
                </SectionDropdown>
              </li>
              <li>
                <SectionDropdown
                  type='section'
                  panelDetailsType='flat'
                  isDefaultExpanded={true}
                >
                  <span>Custom Data Requests</span>
                  <DataRequest
                    eventId={eventId}
                    onAddNewField={onAddNewField}
                    editField={editField}
                    registrantDataFields={registrantDataFields}
                  />
                </SectionDropdown>
              </li>
              <li>
                <SectionDropdown
                  id={EventMenuRegistrationTitles.PAYMENTS}
                  type='section'
                  panelDetailsType='flat'
                  isDefaultExpanded={true}
                >
                  <span>{EventMenuRegistrationTitles.PAYMENTS}</span>
                  <Payments
                    data={this.props.registration}
                    onChange={this.props.onChange}
                  />
                </SectionDropdown>
              </li>
              {this.props.registration?.registration_id && (
                <li>
                  <SectionDropdown
                    id={EventMenuRegistrationTitles.PROMO_CODES}
                    type='section'
                    panelDetailsType='flat'
                    isDefaultExpanded={true}
                  >
                    <span>{EventMenuRegistrationTitles.PROMO_CODES}</span>
                    <PromoCodes
                      registrationId={this.props.registration?.registration_id}
                    />
                  </SectionDropdown>
                </li>
              )}
              {this.props.event &&
              this.props.event[0].waivers_required === 1 ? (
                <li>
                  <SectionDropdown
                    type='section'
                    panelDetailsType='flat'
                    isDefaultExpanded={true}
                  >
                    <span>Waiver</span>
                    <div className={styles.waiverWrapp}>
                      <Waiver
                        data={this.props.registration}
                        onChange={this.props.onChange}
                        isEdit={true}
                      />
                    </div>
                  </SectionDropdown>
                </li>
              ) : null}
              <li>
                <SectionDropdown
                  type='section'
                  panelDetailsType='flat'
                  isDefaultExpanded={true}
                >
                  <span>Email Confirmations Settings</span>
                  <EmailReceipts
                    data={this.mapEmailSettingToObj()}
                    onChange={this.onChangeEmailSettings}
                  />
                </SectionDropdown>
              </li>
            </ul>
          </div>
          <PopupExposure
            isOpen={this.state.isExposurePopupOpen}
            onClose={this.onModalClose}
            onExitClick={this.props.onCancel}
            onSaveClick={this.props.onSave}
          />
        </form>
      </section>
    );
  }
}

export default RegistrationEdit;
