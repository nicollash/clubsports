import React from 'react';

import {
  SectionDropdown,
  Button,
  Input,
  CardMessage,
  HeadingLevelThree,
  PopupConfirm,
  PopupExposure,
} from 'components/common';
import { CardMessageTypes } from 'components/common/card-message/types';
import { IConfigurableOrganization, BindingAction } from 'common/models';
import styles from './styles.module.scss';
import history from 'browserhistory';

const CONFIRM_POPUP_MESSAGE =
  'You are about to create a new organization. Are you sure?';

const CARD_MESSAGE_STYLES = {
  marginBottom: '20px',
};

const EMPTY_ORGANIZATION = {
  org_name: '',
  org_tag: null,
  city: null,
  state: null,
};

interface Props {
  createOrganization: (organizationData: IConfigurableOrganization) => void;
  type?: string;
  onCancelBtn?: BindingAction;
  onSkipBtn?: BindingAction;
  isSectionExpand: boolean;
}

const CreateOrganization = ({
  createOrganization,
  type,
  onCancelBtn,
  onSkipBtn,
  isSectionExpand,
}: Props) => {
  const [organization, onChange] = React.useState<IConfigurableOrganization>(
    EMPTY_ORGANIZATION
  );
  const [isOpenConfirmPopup, onConfirmPopup] = React.useState(false);
  const [isModalOpen, onModalChange] = React.useState(false);

  const onCreateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirmPopup(true);
  };

  const onCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCancelBtn) {
      return onCancelBtn();
    }
    if (organization !== EMPTY_ORGANIZATION) {
      onModalChange(true);
    } else {
      onCancel();
    }
  };

  const onSkipClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onSkipBtn) {
      return onSkipBtn();
    }
  };

  const onModalClose = () => {
    onModalChange(false);
  };

  const onCancel = () => {
    history.push('/');
  };

  const onCreateOrganization = () => {
    createOrganization(organization);
    onConfirmPopup(false);
    onModalChange(false);
  };

  const renderBtns = () => {
    return (
      <div className={styles.btnsGroup}>
        <Button
          label="Skip"
          color="secondary"
          variant="text"
          onClick={onSkipClick}
        />
        <Button
          label="Cancel"
          variant="text"
          color="secondary"
          onClick={onCancelClick}
        />
        <Button
          label="Create"
          variant="contained"
          color="primary"
          onClick={onCreateClick}
        />
      </div>
    );
  };

  return (
    <>
      <SectionDropdown
        type="section"
        useShadow={true}
        panelDetailsType="flat"
        expanded={isSectionExpand}
      >
        <div className={styles.headingContainer}>
          <HeadingLevelThree>
            <span>Create Organization</span>
          </HeadingLevelThree>
          {type !== 'wizard' && renderBtns()}
        </div>

        <div className={styles.section}>
          <CardMessage
            type={CardMessageTypes.EMODJI_OBJECTS}
            style={CARD_MESSAGE_STYLES}
          >
            Create a common calendar where you and your organization’s
            collaborators can see each others notes, requests, tasks, and
            reminders.
          </CardMessage>
          <form className={styles.formContainer}>
            <div className={styles.inputGroup}>
              <div className={styles.sectionItem}>
                <Input
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                    onChange({ ...organization, org_name: evt.target.value })
                  }
                  value={organization.org_name || ''}
                  fullWidth={true}
                  label="Organization Name"
                />
              </div>
              <div className={styles.sectionItem}>
                <Input
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                    onChange({ ...organization, org_tag: evt.target.value })
                  }
                  value={organization.org_tag || ''}
                  label="Organization Tag"
                  fullWidth={true}
                  startAdornment="@"
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.sectionItem}>
                <Input
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                    onChange({ ...organization, city: evt.target.value })
                  }
                  value={organization.city || ''}
                  label="City"
                  fullWidth={true}
                />
              </div>
              <div className={styles.sectionItem}>
                <Input
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                    onChange({ ...organization, state: evt.target.value })
                  }
                  value={organization.state || ''}
                  label="State"
                  fullWidth={true}
                />
              </div>
            </div>
          </form>
          {type === 'wizard' && (
            <div className={styles.btnsWrapper}>{renderBtns()} </div>
          )}
        </div>
      </SectionDropdown>
      <PopupConfirm
        message={CONFIRM_POPUP_MESSAGE}
        isOpen={isOpenConfirmPopup}
        onClose={() => onConfirmPopup(false)}
        onCanceClick={() => onConfirmPopup(false)}
        onYesClick={onCreateOrganization}
        showYes={true}
      />
      <PopupExposure
        isOpen={isModalOpen}
        onClose={onModalClose}
        onExitClick={onCancel}
        onSaveClick={onCreateOrganization}
      />
    </>
  );
};

export default CreateOrganization;
