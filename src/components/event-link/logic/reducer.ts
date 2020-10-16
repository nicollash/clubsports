import {
  DATA_FETCH_SUCCESS,
  MESSAGES_FETCH_SUCCESS,
  SEND_SAVED_MESSAGES_SUCCESS,
  DELETE_MESSAGES_SUCCESS,
  RESPONSES_FETCH_SUCCESS,
  OPTIONS_FETCH_SUCCESS,
  REFRESH_MESSAGE_SUCCESS,
} from './actionTypes';
import { IDivision, IEventDetails, IPool, ITeam } from 'common/models';
import { IResponse } from "..";

export interface IState {
  data: {
    events: IEventDetails[];
    divisions: IDivision[];
    pools: IPool[];
    teams: ITeam[];
  };
  messages: any[];
  responses: IResponse[];
  messagesAreLoading: boolean;
}

const defaultState: IState = {
  data: {
    events: [],
    divisions: [],
    pools: [],
    teams: [],
  },
  messages: [],
  messagesAreLoading: true,
  responses: [],
};

export default (
  state = defaultState,
  action: { type: string; payload?: any }
) => {
  switch (action.type) {
    case DATA_FETCH_SUCCESS: {
      return { ...state, data: Object.assign(state.data, action.payload) };
    }
    case MESSAGES_FETCH_SUCCESS: {
      return { ...state, messages: action.payload, messagesAreLoading: false };
    }
    case RESPONSES_FETCH_SUCCESS: {
      return { ...state, responses: action.payload };
    }
    case SEND_SAVED_MESSAGES_SUCCESS: {
      const updatedMessagesIds = action.payload.map(
        (mes: any) => mes.message_id
      );
      return {
        ...state,
        messages: state.messages.map(message =>
          updatedMessagesIds.includes(message.message_id)
            ? { ...message, send_datetime: new Date().toISOString(), status: 1 }
            : message
        ),
      };
    }
    case DELETE_MESSAGES_SUCCESS: {
      return {
        ...state,
        messages: state.messages.filter(
          message => action.payload !== message.message_id
        ),
      };
    }
    case OPTIONS_FETCH_SUCCESS: {
      return { ...state, options: action.payload };
    }
    case REFRESH_MESSAGE_SUCCESS: {
      const updatedResponses = state.responses.map((resp: IResponse) => {
        return resp.messageId === action.payload.messageId
          ? action.payload
          : resp;
      })
      return { ...state, responses: updatedResponses };
    }
    default:
      return state;
  }
};
