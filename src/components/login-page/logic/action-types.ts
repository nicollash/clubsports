export const SUCCESS = '_SUCCESS';
export const FAILURE = '_FAILURE';
export const CREATE_MEMBER = 'CREATE_MEMBER';

export interface createMemberSuccess {
  type: 'CREATE_MEMBER_SUCCESS';
}

export type MemberAction = createMemberSuccess;
