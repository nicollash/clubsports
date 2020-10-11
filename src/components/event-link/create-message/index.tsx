/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Paper,
  Button,
  HeadingLevelTwo,
  Radio,
  Input,
  Select,
  Checkbox,
} from 'components/common';
import styles from './styles.module.scss';
import history from 'browserhistory';
import { getData, sendMessages, saveMessages } from '../logic/actions';
import {
  BindingAction,
  BindingCbWithOne,
  IEventDetails,
  IDivision,
  IPool,
  ITeam,
} from 'common/models';
import Filter from './filter';
import { IScheduleFilter } from './filter';
import { applyFilters, mapFilterValues, mapTeamsByFilter, MessageType, messageTypeOptions, recipientOptions, typeOptions } from '../helpers';
import { IInputEvent } from 'common/types/events';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { RouteComponentProps } from "react-router-dom";
import { ButtonColors, ButtonVariant } from "common/enums";

interface MatchParams {
  eventId: string;
}
export interface IMessageToSend {
  type: string;
  messageType: string;
  title: string;
  message: string;
  recipients: any[];
  senderName: string;
  eventId: string | undefined,
}

interface Props {
  getData: BindingAction;
  sendMessages: BindingCbWithOne<IMessageToSend>;
  saveMessages: BindingCbWithOne<IMessageToSend>;
  events: IEventDetails[];
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeam[];
}

const CreateMessage = ({
  getData,
  sendMessages,
  saveMessages,
  events,
  divisions,
  pools,
  teams,
  match,
}: Props & RouteComponentProps<MatchParams>) => {
  const currentEventId = match.params.eventId;

  useEffect(() => {
    getData();
  }, []);

  const [data, setData] = useState<IMessageToSend>({
    type: 'Text',
    messageType: 'Notification (one way)',
    title: '',
    message: '',
    recipients: [''],
    senderName: '',
    eventId: undefined,
  });

  const [pollOptions, setPollOptions] = useState<string[]>(['Yes', 'No']);
  const [pollValues, setPollValues] = useState<string[]>(['1', '0']);

  const eventOptions = events.length
    ? events.map(e => ({
        label: e.event_name,
        value: e.event_id,
      }))
    : [];

  const [eventId, setEventId] = useState();

  const [recipientType, setRecipientType] = useState('One');

  const [filterValues, changeFilterValues] = useState<IScheduleFilter>(
    applyFilters({ divisions, pools, teams })
  );

  useEffect(() => {
    changeFilterValues(applyFilters({ divisions, pools, teams }, eventId));
  }, [eventId]);

  const onCancelClick = () => {
    history.goBack();
  };

  const onDataChange = (field: string, value: string | any[]) => {
    setData({ ...data, [field]: value });
  }

  const onEventSelect = (e: any) => {
    setEventId(e.target.value);
  };

  const onRecipientTypeChange = (e: IInputEvent) => {
    setRecipientType(e.target.value);
  };

  const onSend = () => {
    if (recipientType === 'Many') {
      const recipients = mapTeamsByFilter([...teams], filterValues, data.type);
      sendMessages({
        ...data,
        recipients: recipients.length ? recipients : [''],
      });
    } else {
      sendMessages(data);
    }
  };

  const onSave = () => {
    if (recipientType === 'Many') {
      const recipients = mapTeamsByFilter([...teams], filterValues, data.type);
      saveMessages({
        ...data,
        recipients: recipients.length ? recipients : [''],
        eventId,
      });
    } else {
      saveMessages(data);
    }
  };

  const onFilterChange = (data: IScheduleFilter) => {
    const newData = mapFilterValues({ teams, pools }, data);
    changeFilterValues({ ...newData });
  };

  const onChangeFirstPollOption = (e: IInputEvent) => {
    setPollOptions([e.target.value, pollOptions[1]]);
  };

  const onChangeSecondPollOption = (e: IInputEvent) => {
    setPollOptions([pollOptions[0], e.target.value]);
  };

  const onChangeFirstPollValue = (e: IInputEvent) => {
    setPollValues([e.target.value, pollValues[1]]);
  };

  const onChangeSecondPollValue = (e: IInputEvent) => {
    setPollValues([pollValues[0], e.target.value]);
  };

  const renderOneRecipientInput = () => {
    return (
      <div className={styles.recipientWrapper}>
        <span className={styles.title}>
          {data.type === 'Text' ? 'Number:' : 'Email:'}{' '}
        </span>
        {data.type === 'Text' ? (
          <PhoneInput
            country={'us'}
            onlyCountries={['us','ca']}
            disableCountryCode={false}
            placeholder=""
            value={data.recipients[0] || ''}
            onChange={(value: string) =>
              setData({ ...data, recipients: [value] })
            }
            containerStyle={{ marginTop: '7px' }}
            inputStyle={{
              height: '40px',
              fontSize: '18px',
              color: '#6a6a6a',
              borderRadius: '4px',
              width: '23%',
            }}
          />
        ) : (
          <Input
            width="23%"
            placeholder={'example@example.com'}
            onChange={(e: IInputEvent) =>
              onDataChange("recipients", [e.target.value])
            }
            value={data.recipients[0] || ''}
          />
        )}
      </div>
    );
  };
  const renderRecipientFilter = () => {
    return (
      <div className={styles.recipientsFilterWrapper}>
        {!currentEventId && (
          <div className={styles.selectContainer}>
            <Select
              label="Event"
              width={'100%'}
              options={eventOptions}
              onChange={onEventSelect}
              value={eventId || ''}
            />
          </div>
        )}
        {(eventId || currentEventId) && (
          <Filter
            filterValues={filterValues}
            onChangeFilterValue={onFilterChange}
          />
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Paper sticky={true}>
        <div className={styles.btnsWrapper}>
          <Button
            color="secondary"
            variant="text"
            onClick={onCancelClick}
            label="Cancel"
          />
          <Button
            color="primary"
            variant="contained"
            onClick={onSave}
            label="Send Later"
          />
          <Button
            color="primary"
            variant="contained"
            onClick={onSend}
            label="Send Now"
          />
        </div>
      </Paper>
      <HeadingLevelTwo margin="24px 0">New Message</HeadingLevelTwo>
      <div className={styles.btnsGroup}>
        <div className={styles.radioBtns}>
          <Radio
            options={typeOptions}
            formLabel="Type"
            onChange={(e: IInputEvent) => onDataChange("type", e.target.value)}
            checked={data.type}
          />
          <Radio
            options={recipientOptions}
            formLabel="Recipient"
            onChange={onRecipientTypeChange}
            checked={recipientType}
          />
          <Radio
            options={messageTypeOptions}
            formLabel="Message Type"
            onChange={(e: IInputEvent) => onDataChange("messageType", e.target.value)}
            checked={data.messageType}
          />
          <div />
        </div>
        {data.messageType === MessageType.TWO_WAY && (
          <div className={styles.polls}>
            <div className={styles.pollsWrapper}>
              <div className={styles.label}>Poll Options</div>
              <Input
                fullWidth={true}
                onChange={onChangeFirstPollOption}
                value={pollOptions[0]}
              />
              <Input
                fullWidth={true}
                onChange={onChangeSecondPollOption}
                value={pollOptions[1]}
              />
            </div>
            <div className={styles.pollsWrapper}>
              <div className={styles.label}>Poll Values</div>
              <Input
                fullWidth={true}
                onChange={onChangeFirstPollValue}
                value={pollValues[0]}
              />
              <Input
                fullWidth={true}
                onChange={onChangeSecondPollValue}
                value={pollValues[1]}
              />
            </div>
            <div className={styles.pollsWrapper}>
              <div className={styles.label}>Responses</div>
              <div className={styles.response}>
                <div className={styles.checkboxWrpp}>
                  <Checkbox
                    options={[
                      {
                        label: '',
                        checked: true,
                      },
                    ]}
                    onChange={(e: IInputEvent) => onDataChange("title", e.target.value)}
                  />
                </div>
                <Input
                  fullWidth={true}
                  onChange={(e: IInputEvent) => onDataChange("senderName", e.target.value)}
                  value={data.senderName}
                />
              </div>
              <div className={styles.response}>
                <div className={styles.checkboxWrpp}>
                  <Checkbox
                    options={[
                      {
                        label: '',
                        checked: true,
                      },
                    ]}
                    onChange={(e: IInputEvent) => onDataChange("title", e.target.value)}
                  />
                </div>
                <Input
                  fullWidth={true}
                  onChange={(e: IInputEvent) => onDataChange("title", e.target.value)}
                  value={data.title}
                />
              </div>
            </div>
            <div className={styles.pollsWrapper}>
              <div className={styles.additionalWrapp}>
                <Button
                  onClick={() => {}}
                  variant={ButtonVariant.OUTLINED}
                  color={ButtonColors.PRIMARY}
                  label="+ Add Additional"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={styles.recipientsWrapper}>
        {recipientType === 'One'
          ? renderOneRecipientInput()
          : renderRecipientFilter()}
      </div>
      <div className={styles.inputGroup}>
        <div>
          {data.type === 'Email' && (
            <div className={styles.messageTitleWrapper}>
              <Input
                label="From"
                fullWidth={true}
                onChange={(e: IInputEvent) => onDataChange("senderName", e.target.value)}
                value={data.senderName}
              />
              <Input
                label="Title"
                fullWidth={true}
                onChange={(e: IInputEvent) => onDataChange("title", e.target.value)}
                value={data.title}
              />
            </div>
          )}
          {data.type === 'Text' && (
            <div className={styles.messageTitleWrapper}>
              <Input
                label="Message Name"
                placeholder = "Helps you will remember this message"
                fullWidth={true}
                onChange={(e: IInputEvent) => onDataChange("title", e.target.value)}
                value={data.title}
              />
            </div>
          )}
          <Input
            label="Message"
            placeholder="Type the contents of your message here..."
            multiline={true}
            rows="10"
            onChange={(e: IInputEvent) => onDataChange("message", e.target.value)}
            value={data.message}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: {
  eventLink: {
    data: {
      events: IEventDetails[];
      divisions: IDivision[];
      pools: IPool[];
      teams: ITeam[];
    };
  };
}) => {
  return {
    events: state.eventLink.data.events,
    divisions: state.eventLink.data.divisions,
    pools: state.eventLink.data.pools,
    teams: state.eventLink.data.teams,
  };
};

const mapDispatchToProps = {
  getData,
  sendMessages,
  saveMessages,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateMessage);
