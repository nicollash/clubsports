import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import api from 'api/api';
import {
  DATA_FETCH_SUCCESS,
  MESSAGES_FETCH_SUCCESS,
  SEND_SAVED_MESSAGES_SUCCESS,
  DELETE_MESSAGES_SUCCESS,
  RESPONSES_FETCH_SUCCESS,
  OPTIONS_FETCH_SUCCESS,
  MESSAGE_FETCH_SUCCESS,
  TEMPLATES_FETCH_SUCCESS,
} from './actionTypes';
import { Toasts } from 'components/common';
import { IMessageToSend, IPollOption, IRecipientDetails } from '../create-message';
import history from 'browserhistory';
import { getVarcharEight } from 'helpers';
import { Auth } from 'aws-amplify';
import { IMember, IEventDetails, IDivision, IPool, ITeam } from 'common/models';
import { chunk } from 'lodash-es';
import { IMessage, IMessageTemplate } from 'common/models/event-link';
import { getMessageTail, mapResponses, mapTemplates, sortBySendDatetime } from "../helpers";
import { IResponse } from "..";

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

export const getMessageSuccess = (
  payload: IMessage
): { type: string; payload: IMessage } => ({
  type: MESSAGE_FETCH_SUCCESS,
  payload,
});

export const getTemplatesSuccess = (
  payload: IMessageTemplate[]
): { type: string; payload: IMessageTemplate[] } => ({
  type: TEMPLATES_FETCH_SUCCESS,
  payload,
});

export const getResponsesSuccess = (
  payload: IResponse[]
): { type: string; payload: IResponse[] } => ({
  type: RESPONSES_FETCH_SUCCESS,
  payload,
});

export const getOptionsSuccess = (
  payload: any[]
): { type: string; payload: IMessage[] } => ({
  type: OPTIONS_FETCH_SUCCESS,
  payload,
});

export const sendSavedMessagesSuccess = (
  payload: IExtendedMessage[]
): { type: string; payload: IExtendedMessage[] } => ({
  type: SEND_SAVED_MESSAGES_SUCCESS,
  payload,
});

export const deleteMessagesSuccess = (
  payload: string
): { type: string; payload: string } => ({
  type: DELETE_MESSAGES_SUCCESS,
  payload,
});

export const getData: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (eventId?: string) => async (dispatch: Dispatch) => {

  const events = await api.get('/events');
  const divisions = await api.get(
    `/divisions${eventId ? `?event_id=${eventId}` : ``}`
  );
  const teams = await api.get(`/teams${eventId ? `?event_id=${eventId}` : ``}`);

  const serverPools: any[] = [];
  await Promise.all(
    divisions.map(async (div: IDivision) => {
      const response = await api.get(`/pools?division_id=${div.division_id}`);
      serverPools.push(response);
    })
  );
  const pools = serverPools.flat();

  dispatch(getDataSuccess({ events, divisions, pools, teams }));
};

export const saveMessages: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (
  data: IMessageToSend,
  recipientDetails: IRecipientDetails,
  pollOptions?: IPollOption[]
) => async () => {
  if (!data.message) {
    return Toasts.errorToast('Please, provide a message');
  }
  const currentSession = await Auth.currentSession();
  const userEmail = currentSession.getIdToken().payload.email;
  const members = await api.get(`/members?email_address=${userEmail}`);
  const member = members.find((it: IMember) => it.email_address === userEmail);
  const requestId = getVarcharEight();

  const messageToSave = {
    message_id: getVarcharEight(),
    request_id: requestId,
    member_id: member.member_id,
    message_type: data.type,
    message_title: data.title,
    message_body: data.message + getMessageTail(pollOptions),
    email_from_name: data.senderName,
    event_id: data.eventId,
    recipient_details: JSON.stringify(recipientDetails),
    send_datetime: data.sendDatetime,
    one_way_two_way: pollOptions ? 2 : 1,
    status: 'new',
  };

  try {
    await api.post('/messaging', messageToSave);
  } catch (e) {
    Toasts.errorToast("Sorry, we could not save the EventLink message.");
  }

  if (pollOptions) {
    const options = pollOptions.map((opt: IPollOption) => {
      return {
        answer_option_id: opt.id,
        message_id: messageToSave.message_id,
        response_message: opt.responseMessage,
        has_response_YN: opt.hasResponse,
        answer_code: opt.answerCode,
        answer_text: opt.answerText,
      };
    });

    const optionsChunk = chunk(options, 50);

    try {
      await Promise.all(
        optionsChunk.map(async chunkOfOptions => {
          await api.post('/messaging_response_options', chunkOfOptions);
        })
      );
    } catch (e) {
      Toasts.errorToast("Sorry, we could not save this message.");
    }
  }

  const startSending = await api.post('/services/start-sending', {});

  if (!startSending.success) {
    Toasts.errorToast(startSending.message);
  }

  history.push(`/event/event-link/${data.eventId}`);

  return Toasts.successToast('Messages are successfully saved.');
};

export const deleteMessages: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (messageId: string) => async (dispatch: Dispatch) => {
  api.delete(`/messaging?message_id=${messageId}`);

  dispatch(deleteMessagesSuccess(messageId));

  return Toasts.successToast('Messages were successfully deleted.');
};

export const getMessages: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (eventId: string) => async (dispatch: Dispatch) => {
  const messages = await api.get(
    `/messaging${eventId ? `?event_id=${eventId}` : ``}`
  );

  if (!messages) {
    return Toasts.errorToast("We are sorry, but we could not load the messages.");
  }

  const filterMesssages = sortBySendDatetime(messages);

  dispatch(getMessagesSuccess(filterMesssages));
};

export const getResponses: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (messageId: string) => async (dispatch: Dispatch) => {
  const responses = await api.get(`/messaging_recipients?message_id=${messageId}`);
  const options = await api.get(`/messaging_response_options?message_id=${messageId}`);

  if (!responses) {
    return Toasts.errorToast("Couldn't load the responses.");
  }

  const mappedResponses = mapResponses(responses, options);

  dispatch(getResponsesSuccess(mappedResponses));
};

export const updateMessage: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (messageId?: string) => async (dispatch: Dispatch) => {
  const message = await api.get(`/messaging?message_id=${messageId}`);

  if (!message) {
    return Toasts.errorToast("Couldn't load the message.");
  }

  dispatch(getMessageSuccess(message[0]));
};

export const getTemplates: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = () => async (dispatch: Dispatch) => {
  const serverTemplates = await api.get(`/messaging_templates`);

  if (!serverTemplates) {
    return Toasts.errorToast("Couldn't load the templates.");
  }

  const templates = mapTemplates(serverTemplates);

  dispatch(getTemplatesSuccess(templates));
};
