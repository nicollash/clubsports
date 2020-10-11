/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { AppState } from './logic/reducer';
import {
  loadOrganizations,
  createOrganization,
  addUserToOrganization,
  deleteOrganization,
} from './logic/actions';
import { HeadingLevelTwo, Loader } from 'components/common';
import OrganizationsList from './components/organizations-list';
import CreateOrganization from './components/create-organization';
import ApplyInvitation from './components/apply-invitation';
import {
  IOrganization,
  BindingAction,
  IConfigurableOrganization,
} from 'common/models';
import styles from './styles.module.scss';
import Button from 'components/common/buttons/button';

interface Props {
  isLoading: boolean;
  isLoaded: boolean;
  organizations: IOrganization[];
  loadOrganizations: BindingAction;
  createOrganization: (organization: IConfigurableOrganization) => void;
  addUserToOrganization: (invCode: string) => void;
  deleteOrganization: (organization: IOrganization) => void;
}

const OrganizationsManagement = ({
  organizations,
  isLoading,
  addUserToOrganization,
  createOrganization,
  deleteOrganization,
  loadOrganizations,
}: Props) => {
  const [isSectionsExpand, toggleSectionCollapse] = React.useState<boolean>(
    true
  );

  React.useEffect(() => {
    loadOrganizations();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  const onToggleSectionCollapse = () => {
    toggleSectionCollapse(!isSectionsExpand);
  };

  return (
    <section className={styles.container}>
      <div className={styles.heading}>
        <HeadingLevelTwo>Collaboration</HeadingLevelTwo>
        <Button
          label={isSectionsExpand ? 'Collapse All' : 'Expand All'}
          variant="text"
          color="secondary"
          onClick={onToggleSectionCollapse}
        />
      </div>
      <OrganizationsList
        organizations={organizations}
        deleteOrganization={deleteOrganization}
        isSectionExpand={isSectionsExpand}
      />
      <CreateOrganization
        createOrganization={createOrganization}
        isSectionExpand={isSectionsExpand}
      />
      <ApplyInvitation
        addUserToOrganization={addUserToOrganization}
        isSectionExpand={isSectionsExpand}
      />
    </section>
  );
};

interface IRootState {
  organizationsManagement: AppState;
}

export default connect(
  ({ organizationsManagement }: IRootState) => ({
    isLoading: organizationsManagement.isLoading,
    isLoaded: organizationsManagement.isLoaded,
    organizations: organizationsManagement.organizations,
  }),
  (dispatch: Dispatch) =>
    bindActionCreators(
      {
        loadOrganizations,
        createOrganization,
        addUserToOrganization,
        deleteOrganization,
      },
      dispatch
    )
)(OrganizationsManagement);
