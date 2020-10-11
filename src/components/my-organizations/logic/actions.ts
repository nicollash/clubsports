import { Dispatch } from "redux";
import { Auth } from "aws-amplify";
import {
  LOAD_ORGANIZATION,
  LOAD_ORGANIZATION_SUCCESS,
  LOAD_ORGANIZATION_FAILURE,
  LOAD_STATEGROUP,
  LOAD_STATEGROUP_SUCCESS,
  LOAD_STATEGROUP_FAILURE,
} from "./action-types";
import Api from "api/api";
import { Toasts } from "components/common";
import { IMember, IUSAState, ISelectOption } from "common/models";

const getStatesGroup = () => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_STATEGROUP,
    });

    const stateGroup = await Api.get("/states").then((response) => {
      const selectStateOptions = response.map((it: IUSAState) => ({
        label: it.state_abbr,
        value: it.state_name,
      }));

      const sortedSelectStateOptions = selectStateOptions.sort(
        (a: ISelectOption, b: ISelectOption) =>
          a.label.localeCompare(b.label, undefined, { numeric: true })
      );
      return sortedSelectStateOptions;
    });

    dispatch({
      type: LOAD_STATEGROUP_SUCCESS,
      payload: {
        stateGroup,
      },
    });
  } catch {
    dispatch({
      type: LOAD_STATEGROUP_FAILURE,
    });
  }
};

const getOrgInfo = () => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_ORGANIZATION,
    });

    const currentSession = await Auth.currentSession();
    const userEmail = currentSession.getIdToken().payload.email;
    const members = await Api.get(`/members?email_address=${userEmail}`);
    const member: IMember = members.find(
      (it: IMember) => it.email_address === userEmail
    );
    const memberId = member.member_id;

    const orgMemberList = await Api.get(`/org_members?member_id=${memberId}`);
    const promises: Promise<any>[] = [];
    orgMemberList.map((el: any) =>
      promises.push(
        Api.get(`/organizations?org_id=${el.org_id}`).then((res) => {
          if (res?.length > 0) {
            const {
              org_id,
              org_name,
              city,
              state,
              stripe_connect_id,
              authdotnet_id,
              stripe_enabled_YN,
              authdotnet_enabled_YN,
            } = res[0];
            return {
              org_id,
              org_name,
              city,
              state,
              stripe_connect_id,
              authdotnet_id,
              stripe_enabled_YN,
              authdotnet_enabled_YN,
              is_default_YN: el.is_default_YN,
              org_member_id: el.org_member_id,
            };
          }
          return null;
        })
      )
    );

    const orgList = await Promise.all(promises);

    dispatch({
      type: LOAD_ORGANIZATION_SUCCESS,
      payload: {
        orgList,
      },
    });
  } catch {
    dispatch({
      type: LOAD_ORGANIZATION_FAILURE,
    });
  }
};

const save = (orgList: Array<any>) => async () => {
  try {
    const promises: Promise<any>[] = [];

    orgList.forEach((el) => {
      const { is_default_YN, org_member_id, ...others } = el;
      promises.push(Api.put(`/organizations?org_id=${others.org_id}`, others));
      promises.push(
        Api.put(`/org_members?org_member_id=${org_member_id}`, {
          is_default_YN,
          org_member_id,
        })
      );
    });

    await Promise.all(promises);

    Toasts.successToast("Saved successfully");
  } catch {
    Toasts.errorToast("Couldn't save");
  }
};

export { getOrgInfo, getStatesGroup, save };
