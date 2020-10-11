import React from 'react';
import styles from './styles.module.scss';
import { SectionDropdown, Button } from 'components/common';
import CreateIcon from '@material-ui/icons/Create';
import {
  BindingCbWithOne,
  IFacility,
  IField,
  IEventDetails,
  BindingCbWithTwo,
} from 'common/models';
import { IBackupPlan } from 'common/models/backup_plan';
import DeleteIcon from '@material-ui/icons/Delete';
import Modal from 'components/common/modal';
import EditBackupForm from '../edit-backup-form';
import DeletePopupConfrim from 'components/common/delete-popup-confirm';
import { IComplexityTimeslots, TypeOptionsEnum } from '../common';
import { BackUpActiveStatuses } from 'common/enums';

interface Props {
  events: IEventDetails[];
  facilities: IFacility[];
  fields: IField[];
  data: IBackupPlan;
  timeSlots: IComplexityTimeslots;
  deleteBackupPlan: BindingCbWithOne<string>;
  updateBackupPlan: BindingCbWithOne<Partial<IBackupPlan>>;
  loadTimeSlots: (eventId: string) => void;
  toggleBackUpStatus: BindingCbWithTwo<IBackupPlan, BackUpActiveStatuses>;
  isSectionExpand: boolean;
}

interface State {
  isEditOpen: boolean;
  isDeleteOpen: boolean;
}

class BackupPlan extends React.Component<Props, State> {
  state = { isEditOpen: false, isDeleteOpen: false };

  renderFacilitiesAndFields = (
    facilities: { name: string; id: string }[],
    fields: { field_id: string; field_name: string; facilities_id: string }[]
  ) => {
    return facilities.map(facility => (
      <div key={facility.id}>
        {`${facility.name} / `}
        {fields
          .filter(field => field.facilities_id === facility.id)
          .map(field => (
            <span key={field.field_id}>{`${field.field_name}, `}</span>
          ))}
      </div>
    ));
  };

  onDelete = () => {
    this.props.deleteBackupPlan(this.props.data.backup_plan_id);
    this.setState({ isDeleteOpen: false });
  };

  onEditClose = () => {
    this.setState({ isEditOpen: false });
  };

  onEditClick = () => {
    this.setState({ isEditOpen: true });
  };

  onDeleteClose = () => {
    this.setState({ isDeleteOpen: false });
  };

  onDeleteClick = () => {
    this.setState({ isDeleteOpen: true });
  };

  render() {
    const {
      backup_name,
      event_id,
      backup_type,
      fields_impacted,
      facilities_impacted,
    } = this.props.data;

    const eventName = this.props.events
      .filter(event => event.event_id === event_id)
      .map(event => event.event_name);

    const facilities = this.props.facilities
      .filter(facility =>
        JSON.parse(facilities_impacted).includes(facility.facilities_id)
      )
      .map(facility => ({
        name: facility.facilities_description,
        id: facility.facilities_id,
      }));

    const fields = this.props.fields
      .filter(field => JSON.parse(fields_impacted).includes(field.field_id))
      .map(({ field_id, field_name, facilities_id }) => ({
        field_id,
        field_name,
        facilities_id,
      }));

    const deleteMessage = `You are about to delete this backup plan and this cannot be undone.
      Please, enter the name of the backup plan to continue.`;

    const onToggleBackupStatus = () => {
      const { data } = this.props;

      this.props.toggleBackUpStatus(data, BackUpActiveStatuses.Avtive);
    };

    return (
      <div className={styles.container}>
        <SectionDropdown expanded={this.props.isSectionExpand}>
          <div className={styles.sectionTitle}>{backup_name || ''}</div>
          <div className={styles.sectionContent}>
            <div className={styles.info}>
              <div>
                <span className={styles.title}>Event:</span> {eventName || ''}
              </div>
              <div>
                <span className={styles.title}>Type:</span>{' '}
                {TypeOptionsEnum[backup_type] || ''}
              </div>
            </div>
            <div className={styles.details}>
              <div>
                <span className={styles.title}>Games Selected to Change</span>
              </div>
              <div>{this.renderFacilitiesAndFields(facilities, fields)}</div>
            </div>
            <div className={styles.buttonsContainer}>
              <div>
                <Button
                  label="Edit Backup"
                  variant="text"
                  color="secondary"
                  icon={<CreateIcon />}
                  onClick={this.onEditClick}
                />
                <Button
                  label="Delete Backup"
                  variant="text"
                  color="secondary"
                  type="dangerLink"
                  icon={<DeleteIcon style={{ fill: '#FF0F19' }} />}
                  onClick={this.onDeleteClick}
                />
              </div>
              <Button
                onClick={onToggleBackupStatus}
                label="Activate Backup Plan"
                variant="contained"
                color="primary"
              />
            </div>
          </div>
        </SectionDropdown>
        <Modal isOpen={this.state.isEditOpen} onClose={this.onEditClose}>
          <EditBackupForm
            backupPlan={this.props.data}
            events={this.props.events}
            facilities={this.props.facilities}
            fields={this.props.fields}
            timeSlots={this.props.timeSlots}
            updateBackupPlan={this.props.updateBackupPlan}
            onEditClose={this.onEditClose}
            loadTimeSlots={this.props.loadTimeSlots}
          />
        </Modal>
        <DeletePopupConfrim
          type={'backup plan'}
          message={deleteMessage}
          deleteTitle={backup_name}
          isOpen={this.state.isDeleteOpen}
          onClose={this.onDeleteClose}
          onDeleteClick={this.onDelete}
        />
      </div>
    );
  }
}

export default BackupPlan;
