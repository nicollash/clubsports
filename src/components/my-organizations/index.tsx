﻿import React, { useState, useEffect } from 'react';
import styles from "./styles.module.scss";
import { Navigation } from "./components/navigation";
import { HeadingLevelTwo, Button } from "components/common";
import { AppState } from "./logic/reducer";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { BindingAction, BindingCbWithOne } from "common/models";
import OrganizationInfo from "./components/organization-info";
import { getOrgInfo, getStatesGroup, save } from "./logic/actions";

export interface IOrganization {
  authdotnet_enabled_YN: 0 | 1 | null;
  authdotnet_id: string | null;
  city: string | null;
  is_default_YN: 0 | 1 | null;
  org_id: string;
  org_member_id: string | null;
  org_name: string | null;
  state: string | null;
  stripe_connect_id: string | null;
  stripe_enabled_YN: 0 | 1 | null;
}
interface StateGroup {
  label: string;
  value: string;
}
interface Props {
  orgList: IOrganization[];
  isLoading: boolean;
  stateGroup: StateGroup[];
  getOrgInfo: BindingAction;
  save: BindingCbWithOne<any>;
  getStatesGroup: BindingAction;
}

const MyOrganizations = ({
  orgList,
  isLoading,
  stateGroup,
  getOrgInfo,
  save,
  getStatesGroup,
}: Props) => {
  const [isSectionsExpand, toggleSectionCollapse] = useState<boolean>(true);
  const [currentOrgList, setOrgList] = useState<IOrganization[]>();

  useEffect(() => {
    getOrgInfo();
    getStatesGroup();
  }, []);

  const onToggleSectionCollapse = () => {
    toggleSectionCollapse(!isSectionsExpand);
  };

  const handleSave = () => {
    save(currentOrgList);
  };

  const onChangeOrgList = (newOrgList: any) => {
    setOrgList(newOrgList);
  };

  return (
    <section className={styles.container}>
      <Navigation onSave={handleSave} />
      <div className={styles.headingContainer}>
        <HeadingLevelTwo>My Organizations</HeadingLevelTwo>
        <Button
          onClick={onToggleSectionCollapse}
          variant="text"
          color="secondary"
          label={isSectionsExpand ? 'Collapse All' : 'Expand All'}
        />
      </div>
      <OrganizationInfo
        orgList={currentOrgList ? currentOrgList : orgList}
        isLoading={isLoading}
        stateGroup={stateGroup}
        onChangeOrgList={onChangeOrgList}
        expanded={isSectionsExpand}
      />
    </section>
  );
};

interface IRootState {
  orgInfo: AppState;
}

export default connect(
  ({ orgInfo }: IRootState) => ({
    isLoading: orgInfo.isLoading,
    orgList: orgInfo.orgList,
    stateGroup: orgInfo.stateGroup,
  }),
  (dispatch: Dispatch) =>
    bindActionCreators(
      {
        getOrgInfo,
        getStatesGroup,
        save,
      },
      dispatch
    )
)(MyOrganizations);
