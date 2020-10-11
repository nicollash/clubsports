import React from 'react';
import {
  SectionDropdown,
  HeadingLevelThree,
  Input,
  Button,
} from 'components/common';
import styles from './styles.module.scss';
import { BindingAction } from 'common/models';

interface Props {
  addUserToOrganization: (invCode: string) => void;
  type?: string;
  onCancel?: BindingAction;
  onSkip?: BindingAction;
  isSectionExpand: boolean;
}

const ApplyInvitation = ({
  addUserToOrganization,
  type,
  onCancel,
  onSkip,
  isSectionExpand,
}: Props) => {
  const [invCode, onChange] = React.useState('');

  const onApplyInvitation = (e: React.MouseEvent) => {
    e.stopPropagation();

    addUserToOrganization(invCode.toUpperCase());

    onChange('');
  };

  const renderBtn = () => {
    return (
      <Button
        label="Apply Invitation"
        variant="contained"
        color="primary"
        disabled={!invCode}
        onClick={onApplyInvitation}
      />
    );
  };

  return (
    <SectionDropdown
      type="section"
      useShadow={true}
      panelDetailsType="flat"
      expanded={isSectionExpand}
    >
      <div className={styles.headingContainer}>
        <HeadingLevelThree>
          <span>Apply Invitation</span>
        </HeadingLevelThree>
        {type !== 'wizard' && renderBtn()}
      </div>
      <form className={styles.section}>
        {type === 'wizard' && (
          <p className={styles.wMessage}>
            Ask your friend/coworker to give you the Organization Code and apply
            it in the form below
          </p>
        )}
        <div className={styles.sectionItem}>
          <Input
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
              onChange(evt.target.value)
            }
            value={invCode || ''}
            fullWidth={true}
            label="Organization Code"
          />
        </div>
        {type === 'wizard' && (
          <div className={styles.wBtnsWrapper}>
            <Button
              label="Skip"
              color="secondary"
              variant="text"
              onClick={onSkip}
            />
            <Button
              label="Cancel"
              variant="text"
              color="secondary"
              onClick={onCancel}
            />
            {renderBtn()}
          </div>
        )}
      </form>
    </SectionDropdown>
  );
};

export default ApplyInvitation;
