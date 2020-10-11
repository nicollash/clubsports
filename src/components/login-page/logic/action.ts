import { ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { EMPTY_MEMBER } from './constants';
import { MemberAction } from './action-types';
import Api from '../../../api/api';
import { getVarcharEight } from '../../../helpers';
import { IMember } from '../../../common/models/member';
import { Toasts } from '../../common';

const createMemeber: ActionCreator<ThunkAction<
  void,
  {},
  null,
  MemberAction
>> = (fullName: string, email: string, sub: string) => async () => {
  try {
    const members = await Api.get(`/members?email_address=${email}`);
    const memberFullName = fullName?.split(' ') || ['', ''];
    const memberId = getVarcharEight();
    const member = members.find((it: IMember) => it.email_address === email);

    if (!member) {
      await Api.post('/members', {
        ...EMPTY_MEMBER,
        member_id: memberId,
        first_name: memberFullName[0],
        last_name: memberFullName[1],
        email_address: email,
        cognito_sub: sub,
      });
    }

    if (member) {
      const members = await Api.get(`/members?email_address=${email}`);
      const member = members.find((it: IMember) => it.email_address === email);

      if (!member.cognito_sub) {
        await Api.put(`/members?member_id=${member.member_id}`, {
          ...member,
          cognito_sub: sub,
        });
      }
    }
  } catch (err) {
    Toasts.errorToast(`${err}`);
  }
};

export { createMemeber };
