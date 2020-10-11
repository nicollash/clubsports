/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { AppState } from './logic/reducer';
import { loadUserData, saveUserData, changeUser } from './logic/actions';
import { Navigation } from './components/navigation';
import UserProfile from './components/user-profile';
import { HeadingLevelTwo, Loader, Button } from 'components/common';
import { BindingAction, BindingCbWithOne, IMember } from 'common/models';
import { IUtilitiesMember } from './types';
import styles from './styles.module.scss';
import TourneyImportWizard from "./components/tourney-import";
interface Props {
  isLoading: boolean;
  isLoaded: boolean;
  userData: IMember | IUtilitiesMember | null;
  loadUserData: BindingAction;
  saveUserData: BindingAction;
  changeUser: BindingCbWithOne<Partial<IUtilitiesMember>>;
}

const Utilities = ({
  isLoading,
  userData,
  loadUserData,
  saveUserData,
  changeUser,
}: Props) => {
  const [isSectionsExpand, toggleSectionCollapse] = useState<boolean>(true);

  const onToggleSectionCollapse = () => {
    toggleSectionCollapse(!isSectionsExpand);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (isLoading || !userData) {
    return <Loader />;
  }

  return (
    <section className={styles.container}>
      <Navigation onSaveUser={saveUserData} />

      <div className={styles.headingContainer}>
        <HeadingLevelTwo>Utilities</HeadingLevelTwo>
        <Button
          onClick={onToggleSectionCollapse}
          variant="text"
          color="secondary"
          label={isSectionsExpand ? 'Collapse All' : 'Expand All'}
        />
      </div>

      <UserProfile isSectionsExpand={isSectionsExpand} userData={userData} changeUser={changeUser} />
      <TourneyImportWizard isSectionsExpand={isSectionsExpand}/>

    </section>
  );
};

interface IRootState {
  utilities: AppState;
}

export default connect(
  ({ utilities }: IRootState) => ({
    isLoading: utilities.isLoading,
    isLoaded: utilities.isLoaded,
    userData: utilities.userData,
  }),
  (dispatch: Dispatch) =>
    bindActionCreators(
      {
        loadUserData,
        changeUser,
        saveUserData,
      },
      dispatch
    )
)(Utilities);
