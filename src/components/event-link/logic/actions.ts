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
} from './actionTypes';
import { Toasts } from 'components/common';
import { IMessageToSend, IPollOption, IRecipientDetails } from '../create-message';
import history from 'browserhistory';
import { getVarcharEight } from 'helpers';
import { Auth } from 'aws-amplify';
import { IMember, IEventDetails, IDivision, IPool, ITeam } from 'common/models';
import { chunk } from 'lodash-es';
import { IMessage } from 'common/models/event-link';
import { getAnswerText } from "../helpers";

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

export const getResponsesSuccess = (
  payload: any[]
): { type: string; payload: IMessage[] } => ({
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
>> = () => async (dispatch: Dispatch) => {
  const events = await api.get('/events');
  const divisions = await api.get('/divisions');
  const pools = await api.get('/pools');
  const teams = await api.get('/teams');

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
    message_body: data.message,
    status: 0,
    email_from_name: data.senderName,
    event_id: data.eventId,
    recipient_details: JSON.stringify(recipientDetails),
    send_datetime: data.sendDatetime,
  };

  try {
    await api.post('/messaging', messageToSave);
  } catch (e) {
    Toasts.errorToast("Couldn't save messages");
  }

  if (pollOptions) {
    const options = pollOptions.map((opt: IPollOption) => {
      return {
        answer_option_id: getVarcharEight(),
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
      Toasts.errorToast("Couldn't save messages");
    }
  }

  history.push(`/event/event-link/${data.eventId}`);

  return Toasts.successToast('Messages are successfully saved');
};

export const deleteMessages: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (messageId: string) => async (dispatch: Dispatch) => {
  api.delete(`/messaging?message_id=${messageId}`);

  dispatch(deleteMessagesSuccess(messageId));

  return Toasts.successToast('Messages are successfully deleted');
};

export const getMessages: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (eventId: string) => async (dispatch: Dispatch) => {
  const messages = await api.get(`/messaging`);
  const responses = await api.get(`/messaging_recipients`);
  const options = await api.get(`/messaging_response_options`);

  if (!messages) {
    return Toasts.errorToast("Couldn't load the messages.");
  }

  const filterMesssages = eventId
    ? messages.filter((mes: IMessage) => mes.event_id === eventId)
    : messages;

  const mappedResponses = await Promise.all(
    responses.map(async (mess: any) => {
      return {
        recipientTarget: mess.recipient_target,
        sendDatetime: mess.send_datetime,
        receivedDatetime: mess.received_datetime,
        answerText: getAnswerText(mess.answer_option_id, options),
        messageStatus: mess.message_status,
        messageId: mess.message_id,
      };
    })
  );

  dispatch(getMessagesSuccess(filterMesssages));
  dispatch(getResponsesSuccess(mappedResponses));
};
