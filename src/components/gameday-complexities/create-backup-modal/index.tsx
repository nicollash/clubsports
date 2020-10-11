import React from 'react';
import styles from './styles.module.scss';
import {
  BindingAction,
  IFacility,
  BindingCbWithOne,
  IEventDetails,
} from 'common/models';
import CreateBackupForm from '../create-backup-form';
import Button from 'components/common/buttons/button';
import { IField } from 'common/models';
import { PopupExposure } from 'components/common';
import { IBackupPlan } from 'common/models/backup_plan';
import { IComplexityTimeslots, OptionsEnum } from '../common';

interface Props {
  loadTimeSlots: (eventId: string) => void;
  onCancel: BindingAction;
  events: IEventDetails[];
  facilities: IFacility[];
  fields: IField[];
  timeSlots: IComplexityTimeslots;
  saveBackupPlans: BindingCbWithOne<Partial<IBackupPlan>[]>;
}

interface State {
  backupPlans: Partial<IBackupPlan>[];
  isConfirmModalOpen: boolean;
}

class CreateBackupModal extends React.Component<Props, State> {
  state = {
    backupPlans: [{ backup_type: OptionsEnum['Cancel Games'] }],
    isConfirmModalOpen: false,
  };

  onChange = (name: string, value: any, index: number) => {
    this.setState(({ backupPlans }) => ({
      backupPlans: backupPlans.map(plan =>
        plan === backupPlans[index] ? { ...plan, [name]: value } : plan
      ),
    }));
  };

  onModalClose = () => {
    this.setState({ isConfirmModalOpen: false });
  };

  onExit = () => {
    this.setState({ isConfirmModalOpen: false });
    this.props.onCancel();
  };

  onCancelClick = () => {
    this.setState({ isConfirmModalOpen: true });
  };

  onAddAdditionalPlan = () => {
    this.setState({
      backupPlans: [
        ...this.state.backupPlans,
        { backup_type: OptionsEnum['Cancel Games'] },
      ],
    });
  };

  onSave = () => {
    this.props.saveBackupPlans(this.state.backupPlans);
    this.setState({ isConfirmModalOpen: false });
    this.props.onCancel();
  };

  onSaveToLibrary = () => {
    this.props.saveBackupPlans(this.state.backupPlans);
    this.props.onCancel();
  };

  render() {
    const { backupPlans } = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.title}>Backup Plan</div>
        {backupPlans.map((plan, index) => (
          <CreateBackupForm
            key={index}
            index={index}
            backupPlan={plan}
            onChange={this.onChange}
            events={this.props.events}
            facilities={this.props.facilities}
            fields={this.props.fields}
            timeSlots={this.props.timeSlots}
            loadTimeSlots={this.props.loadTimeSlots}
          />
        ))}
        {/* <Button
          label="+ Add Additional Game Impacted"
          variant="text"
          color="secondary"
          onClick={this.onAddAdditionalPlan}
        /> */}
        <div className={styles.buttonsGroup}>
          <Button
            label="Cancel"
            variant="text"
            color="secondary"
            onClick={this.onCancelClick}
          />
          <Button
            label="Save Backup Plan to Library"
            variant="contained"
            color="primary"
            onClick={this.onSaveToLibrary}
          />
          {/* <Button
            label="Activate and Publish Backup Plan"
            variant="contained"
            color="primary"
          /> */}
        </div>
        <PopupExposure
          isOpen={this.state.isConfirmModalOpen}
          onClose={this.onModalClose}
          onExitClick={this.onExit}
          onSaveClick={this.onSave}
        />
      </div>
    );
  }
}

export default CreateBackupModal;
