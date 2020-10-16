/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import {
  HeadingLevelTwo,
  Radio,
  Input,
  Select,
  CardMessage,
  Checkbox,
  DatePicker,
} from "components/common";
import styles from './styles.module.scss';
import history from 'browserhistory';
import { getData, saveMessages } from '../logic/actions';
import { IEventDetails, IDivision, IPool, ITeam } from "common/models";
import Filter from './filter';
import { IScheduleFilter } from './filter';
import {
  applyFilters,
  insertFormFieldButtonsLabels,
  mapFilterValues,
  mapValuesByFilter,
  MessageType,
  messageTypeOptions,
  Recipient,
  recipientOptions,
  typeOptions,
} from "../helpers";
import { IInputEvent } from 'common/types/events';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { RouteComponentProps } from "react-router-dom";
import PollOptions from "./poll-options";
import Navigation from "./navigation";
import { TextField } from "@material-ui/core";
import { InsertFormFieldButton } from "./insert-form-button-field";
import { CardMessageTypes } from "components/common/card-message/types";

interface MatchParams {
  eventId: string;
}
export interface IMessageToSend {
  type: string;
  title: string;
  message: string;
  senderName: string;
  eventId: string | undefined,
  sendDatetime: string | Date;
}

export interface IRecipientDetails {
  poolIds: string[];
  teamIds: string[];
  divisionIds: string[];
  phoneNumber: string;
  email: string;
  recipient: Recipient;
  groups: string[];
}

export interface IPollOption {
  index: number,
  responseMessage: string;
  hasResponse: boolean;
  answerCode: string;
  answerText: string;
}

interface Props {
  getData: (eventId?: string) => void;
  saveMessages: (
    data: IMessageToSend,
    recipientDetails: IRecipientDetails,
    pollOptions?: IPollOption[]
  ) => void;
  events: IEventDetails[];
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeam[];
}

const CreateMessage = ({
  events,
  divisions,
  pools,
  teams,
  match,
  getData,
  saveMessages,
}: Props & RouteComponentProps<MatchParams>) => {
  const currentEventId = match.params.eventId;

  useEffect(() => {
    getData(currentEventId);
  }, []);

  useEffect(() => {
    changeFilterValues(
      applyFilters({ divisions, pools, teams }, currentEventId)
    );
  }, [divisions, pools, teams]);

  const [dataForServer, setDataForServer] = useState<IMessageToSend>({
    type: 'Text',
    title: '',
    message: '',
    senderName: '',
    sendDatetime: new Date(),
    eventId: currentEventId,
  });

  const [recipientDetails, setRecipientDetails] = useState<IRecipientDetails>({
    phoneNumber: '',
    poolIds: [],
    teamIds: [],
    divisionIds: [],
    email: '',
    recipient: Recipient.ONE,
    groups: [],
  });

  const [pollOptions, setPollOptions] = useState<IPollOption[]>([
    {
      index: 0,
      responseMessage: '',
      hasResponse: false,
      answerCode: '1',
      answerText: 'Yes',
    },
    {
      index: 1,
      responseMessage: '',
      hasResponse: false,
      answerCode: '0',
      answerText: 'No',
    },
  ]);

  const [messageType, setMessageType] = useState<string>(MessageType.ONE_WAY);
  const [isSendLater, setIsSendLater] = useState<boolean>(false);

  const messageInput = useRef<HTMLInputElement | null>(null);

  const eventOptions = events.length
    ? events.map((e: IEventDetails) => ({
        label: e.event_name,
        value: e.event_id,
      }))
    : [];

  const [eventId, setEventId] = useState(currentEventId);
  useEffect(() => {
    setDataForServer({
      ...dataForServer,
      eventId,
    });
  }, [eventId]);

  const [filterValues, changeFilterValues] = useState<IScheduleFilter>(
    applyFilters({ divisions, pools, teams })
  );

  useEffect(() => {
    if (dataForServer.type === "Email") setMessageType(MessageType.ONE_WAY);
  }, [dataForServer]);

  const onSendDatetimeChange = (e: IInputEvent) =>
    setIsSendLater(e.target.checked);

  const onCancelClick = () => {
    history.goBack();
  };

  const onDataChange = (field: string, value: string | Date) => {
    setDataForServer({ ...dataForServer, [field]: value });
  };

  const onRecipientDetailsChange = (field: string, value: string ) => {
    setRecipientDetails({ ...recipientDetails, [field]: value });
  };

  const onEventSelect = (e: IInputEvent) => {
    setEventId(e.target.value);
  };

  const onChangePollOption = (value: IPollOption[]) => {
    setPollOptions(value);
  };

  const onAddAdditionalOption = () =>
    setPollOptions([
      ...pollOptions,
      {
        index: pollOptions.length,
        responseMessage: '',
        hasResponse: false,
        answerCode: '',
        answerText: '',
      },
    ]);

  const onSave = () => {
    messageType === MessageType.TWO_WAY
      ? saveMessages(dataForServer, recipientDetails, pollOptions)
      : saveMessages(dataForServer, recipientDetails);
  };

  const onFilterChange = (value: IScheduleFilter) => {
    const newData = mapFilterValues({ teams, pools }, value);
    changeFilterValues({ ...newData });
    const { divisionIds, poolIds, teamIds, groups } = mapValuesByFilter({
      ...newData,
    });
    setRecipientDetails({
      ...recipientDetails,
      divisionIds,
      poolIds,
      teamIds,
      groups,
    });
  };

  const insertFormField = (value: string) => {
    setDataForServer({
      ...dataForServer,
      message:
        dataForServer.message.slice(0, Number(messageInput.current?.selectionStart)) +
        value +
        dataForServer.message.slice(Number(messageInput.current?.selectionStart)),
    });
  };

  const onMessageTypeChange = (e: IInputEvent) =>
    setMessageType(e.target.value);

  const renderOneRecipientInput = () => {
    return (
      <div className={styles.recipientWrapper}>
        <div className={styles.title}>
          {dataForServer.type === 'Text' ? 'Mobile Number:' : 'Email:'}{' '}
        </div>
        {dataForServer.type === 'Text' ? (
          <PhoneInput
            country={'us'}
            onlyCountries={['us','ca']}
            disableCountryCode={false}
            placeholder=""
            value={''}
            onChange={(value: string) =>
              onRecipientDetailsChange("phoneNumber", value)
            }
            containerStyle={{ marginTop: '7px' }}
            inputStyle={{
              height: '40px',
              fontSize: '18px',
              color: '#6a6a6a',
              borderRadius: '4px',
              width: '49%',
            }}
          />
        ) : (
          <Input
            width="49%"
            placeholder={'example@example.com'}
            onChange={(e: IInputEvent) =>
              onRecipientDetailsChange("email", e.target.value)
            }
            value={recipientDetails.email || ''}
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

  const CARD_MESSAGE_STYLES = {
    marginBottom: 10,
    width: "100%",
  };

  return (
    <div className={styles.container}>
      <Navigation
        onCancelClick={onCancelClick}
        onSave={onSave}
      />
      <HeadingLevelTwo margin="24px 0">Create New Message</HeadingLevelTwo>
      <div className={styles.btnsGroup}>
      <div>
          <CardMessage
            style={CARD_MESSAGE_STYLES}
            type={CardMessageTypes.EMODJI_OBJECTS}
          > Please note; SMS messaging rates are $.01 per message and invoiced monthly. "Polls" are only enabled for SMS texting right now.
          </CardMessage>
          </div>
        <div className={styles.radioBtns}>
          <Radio
            options={typeOptions}
            formLabel="Type"
            onChange={(e: IInputEvent) => onDataChange("type", e.target.value)}
            checked={dataForServer.type}
          />
          <Radio
            options={recipientOptions}
            formLabel="Recipient"
            onChange={(e: IInputEvent) =>
              onRecipientDetailsChange("recipient", e.target.value)}
            checked={recipientDetails.recipient}
          />
          <Radio
            options={messageTypeOptions}
            formLabel="Message Type"
            onChange={onMessageTypeChange}
            checked={messageType}
            disabledField={
              dataForServer.type === "Email" ? MessageType.TWO_WAY : undefined
            }
          />
          <div className={styles.dateTimeWrpp}>
            <div className={styles.label}>Timing</div>
            <Checkbox
              options={[
                {
                  label: 'Specify Send Date/Time',
                  checked: isSendLater,
                },
              ]}
              onChange={onSendDatetimeChange}
            />
            <DatePicker
              label=""
              type="date-time"
              viewType="input"
              disabled={!isSendLater}
              value={dataForServer.sendDatetime}
              onChange={(value: string | Date) =>
                onDataChange("sendDatetime", value)
              }
            />
          </div>
        </div>
        {messageType === MessageType.TWO_WAY && (
          <PollOptions
            options={pollOptions}
            onChangeValue={onChangePollOption}
            onAddAdditionalOption={onAddAdditionalOption}
          />
        )}
      </div>
      <div className={styles.recipientsWrapper}>
        {recipientDetails.recipient === 'One'
          ? renderOneRecipientInput()
          : renderRecipientFilter()}
      </div>
      <div className={styles.inputGroup}>
        <div>
          {dataForServer.type === 'Email' && (
            <div className={styles.messageTitleWrapper}>
              <Input
                label="From"
                fullWidth={true}
                onChange={(e: IInputEvent) => onDataChange("senderName", e.target.value)}
                value={dataForServer.senderName}
              />
              <Input
                label="Title"
                fullWidth={true}
                onChange={(e: IInputEvent) => onDataChange("title", e.target.value)}
                value={dataForServer.title}
              />
            </div>
          )}
          {dataForServer.type === 'Text' && (
            <div className={styles.messageTitleWrapper}>
              <Input
                label="EventLink Subject"
                placeholder = "Helps you remember what the message is"
                fullWidth={true}
                onChange={(e: IInputEvent) => onDataChange("title", e.target.value)}
                value={dataForServer.title}
              />
            </div>
          )}
          <div className={styles.messageWrapp}>
            <div className={styles.messageBody}>
              <div className={styles.label}>Body of Message:</div>
              <TextField
                inputRef={messageInput}
                placeholder="Type the contents of your message here... Do not include poll options if the message is a poll. They are included automatically."
                multiline={true}
                variant='outlined'
                size='small'
                rows="10"
                onChange={(e: IInputEvent) => onDataChange("message", e.target.value)}
                value={dataForServer.message}
              />
            </div>
            <div>
              <div className={styles.label}>Insert From Fields:</div>
              {insertFormFieldButtonsLabels.map((name: string) => (
                <InsertFormFieldButton
                  key={name}
                  formName={name}
                  insertFormField={insertFormField}
                />
              ))}
            </div>
          </div>
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
  saveMessages,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateMessage);
