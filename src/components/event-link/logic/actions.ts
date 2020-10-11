import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import api from 'api/api';
import {
  DATA_FETCH_SUCCESS,
  MESSAGES_FETCH_SUCCESS,
  SEND_SAVED_MESSAGES_SUCCESS,
  DELETE_MESSAGES_SUCCESS,
} from './actionTypes';
import { Toasts } from 'components/common';
import { IMessageToSend } from '../create-message';
import history from 'browserhistory';
import { getVarcharEight } from 'helpers';
import { Auth } from 'aws-amplify';
import { IMember, IEventDetails, IDivision, IPool, ITeam } from 'common/models';
import { chunk } from 'lodash-es';
import { IMessage } from 'common/models/event-link';
import { IGroupedMessages } from '..';

interface IExtendedMessage extends IMessageToSend {
  unique_id: string;
  recipient: string;
  send_datetime: string;
  status: number;
}
interface IFilterData {
  events: IEventDetails[];
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeam[];
}

export const getDataSuccess = (
  payload: IFilterData
): { type: string; payload: IFilterData } => ({
  type: DATA_FETCH_SUCCESS,
  payload,
});

export const getMessagesSuccess = (
  payload: IMessage[]
): { type: string; payload: IMessage[] } => ({
  type: MESSAGES_FETCH_SUCCESS,
  payload,
});

export const sendSavedMessagesSuccess = (
  payload: IExtendedMessage[]
): { type: string; payload: IExtendedMessage[] } => ({
  type: SEND_SAVED_MESSAGES_SUCCESS,
  payload,
});

export const deleteMessagesSuccess = (
  payload: string[]
): { type: string; payload: string[] } => ({
  type: DELETE_MESSAGES_SUCCESS,
  payload,
});

export const getData: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = () => async (dispatch: Dispatch) => {
  const events = await api.get('/events');
  const divisions = await api.get('/divisions');
  const pools = await api.get('/pools');
  const teams = await api.get('/teams');

  dispatch(getDataSuccess({ events, divisions, pools, teams }));
};

export const sendMessages: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (data: IMessageToSend) => async () => {
  if (!data.message) {
    return Toasts.errorToast('Please, provide a message');
  } else if (!data.recipients.length) {
    return Toasts.errorToast('Please, provide recipients');
  }

  let response;
  try {
    response = await api.post('/messages', data);

    if (!response.success) {
      throw new Error(response.message);
    }
  } catch (err) {
    return Toasts.errorToast(err.message);
  }

  // Save messages

  const currentSession = await Auth.currentSession();
  const userEmail = currentSession.getIdToken().payload.email;
  const members = await api.get(`/members?email_address=${userEmail}`);
  const member = members.find((it: IMember) => it.email_address === userEmail);
  const requestId = getVarcharEight();

  const messagesToSave = response.results.map((message: IExtendedMessage) => ({
    message_id: getVarcharEight(),
    request_id: requestId,
    sns_unique_id: message.unique_id,
    member_id: member.member_id,
    message_type: message.type,
    recipient_details: message.recipient,
    message_title: message.title,
    message_body: message.message,
    send_datetime: message.send_datetime,
    status: message.status,
    email_from_name: data.senderName,
  }));

  const messagesToSaveChunk = chunk(messagesToSave, 50);

  try {
    await Promise.all(
      messagesToSaveChunk.map(async chunkOfMessages => {
        await api.post('/messaging', chunkOfMessages);
      })
    );
  } catch (e) {
    Toasts.errorToast("Couldn't save messages");
  }

  history.push('/event-link');
  return Toasts.successToast('Messages are successfully sent');
};

export const saveMessages: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (data: IMessageToSend) => async () => {
  if (!data.message) {
    return Toasts.errorToast('Please, provide a message');
  }
  const currentSession = await Auth.currentSession();
  const userEmail = currentSession.getIdToken().payload.email;
  const members = await api.get(`/members?email_address=${userEmail}`);
  const member = members.find((it: IMember) => it.email_address === userEmail);
  const requestId = getVarcharEight();

  const messagesToSave = data.recipients.map(recipient => ({
    message_id: getVarcharEight(),
    request_id: requestId,
    member_id: member.member_id,
    message_type: data.type,
    recipient_details: recipient,
    message_title: data.title,
    message_body: data.message,
    status: 0,
    email_from_name: data.senderName,
    event_id: data.eventId,
  }));

  const messagesToSaveChunk = chunk(messagesToSave, 50);

  try {
    await Promise.all(
      messagesToSaveChunk.map(async chunkOfMessages => {
        await api.post('/messaging', chunkOfMessages);
      })
    );
  } catch (e) {
    Toasts.errorToast("Couldn't save messages");
  }

  history.push('/event-link');

  return Toasts.successToast('Messages are successfully saved');
};

export const sendSavedMessages: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (data: IGroupedMessages) => async (dispatch: Dispatch) => {
  const message = {
    type: data.message_type,
    title: data.message_title,
    message: data.message_body,
    recipients: data.recipients,
    senderName: data.senderName,
  };

  const response = await api.post('/event-link', message);

  if (!response || response.status === 500) {
    return Toasts.errorToast(response.message);
  }

  // update messages in db

  const currentSession = await Auth.currentSession();
  const userEmail = currentSession.getIdToken().payload.email;
  const members = await api.get(`/members?email_address=${userEmail}`);
  const member = members.find((it: IMember) => it.email_address === userEmail);

  const messagesToUpdate = response.results.map(
    (message: IExtendedMessage, index: number) => ({
      message_id: data.message_ids[index],
      sns_unique_id: message.unique_id,
      member_id: member.member_id,
      recipient_details: message.recipient,
      send_datetime: message.send_datetime,
      status: message.status,
    })
  );

  const messagesToUpdateChunk = chunk(messagesToUpdate, 50);

  try {
    await Promise.all(
      messagesToUpdateChunk.map(async chunkOfMessages => {
        await api.put('/messaging', chunkOfMessages);
      })
    );
  } catch (e) {
    Toasts.errorToast("Couldn't save messages");
  }

  dispatch(sendSavedMessagesSuccess(messagesToUpdate));

  history.push('/event-link');
  return Toasts.successToast('Messages are successfully sent');
};

export const deleteMessages: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (messagesIds: string[]) => async (dispatch: Dispatch) => {
  messagesIds.forEach(messageId =>
    api.delete(`/messaging?message_id=${messageId}`)
  );

  dispatch(deleteMessagesSuccess(messagesIds));

  return Toasts.successToast('Messages are successfully deleted');
};

export const getMessages: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (eventId: string) => async (dispatch: Dispatch) => {
  const messages = await api.get(`/messaging`);

  if (!messages) {
    return Toasts.errorToast("Couldn't load the messages.");
  }

  const filterMesssages = eventId
    ? messages.filter((mes: IMessage) => mes.event_id === eventId)
    : messages;

  dispatch(getMessagesSuccess(filterMesssages));
};
