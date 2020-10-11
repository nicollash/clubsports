import React from 'react';
import { Button, Paper, CardMessage, HeadingLevelTwo } from 'components/common';
import styles from './styles.module.scss';
import rain from '../../assets/rain.svg';
import Modal from 'components/common/modal';
import { CardMessageTypes } from 'components/common/card-message/types';
import CreateBackupModal from './create-backup-modal';
import { connect } from 'react-redux';
import {
  getEvents,
  getFacilities,
  getFields,
  getBackupPlans,
  saveBackupPlans,
  deleteBackupPlan,
  updateBackupPlan,
  loadTimeSlots,
  toggleBackUpStatus,
} from './logic/actions';
import { IAppState } from 'reducers/root-reducer.types';
import {
  BindingAction,
  IFacility,
  BindingCbWithOne,
  IEventDetails,
  BindingCbWithTwo,
} from 'common/models';
import { IField } from 'common/models';
import BackupPlan from './backup-plan';
import { IBackupPlan } from 'common/models/backup_plan';
import { Loader } from 'components/common';
import { IComplexityTimeslots } from './common';
import { BackUpActiveStatuses } from 'common/enums';

interface Props {
  getEvents: BindingAction;
  getFacilities: BindingAction;
  getFields: BindingAction;
  getBackupPlans: BindingAction;
  saveBackupPlans: BindingCbWithOne<Partial<IBackupPlan>[]>;
  deleteBackupPlan: BindingCbWithOne<string>;
  updateBackupPlan: BindingCbWithOne<Partial<IBackupPlan>>;
  loadTimeSlots: (eventId: string) => void;
  toggleBackUpStatus: BindingCbWithTwo<IBackupPlan, BackUpActiveStatuses>;
  events: IEventDetails[];
  facilities: IFacility[];
  fields: IField[];
  backupPlans: IBackupPlan[];
  timeSlots: IComplexityTimeslots;
  isLoading: boolean;
}

interface State {
  isModalOpen: boolean;
  isSectionsExpand: boolean;
}

class GamedayComplexities extends React.Component<Props, State> {
  state = {
    isModalOpen: false,
    isSectionsExpand: true,
  };

  componentDidMount() {
    this.props.getEvents();
    this.props.getFacilities();
    this.props.getFields();
    this.props.getBackupPlans();
  }

  toggleSectionCollapse = () => {
    this.setState({ isSectionsExpand: !this.state.isSectionsExpand });
  };

  onCreatePlan = () => {
    this.setState({ isModalOpen: true });
  };

  onModalClose = () => {
    this.setState({ isModalOpen: false });
  };

  renderEmpty = () => {
    return (
      <div className={styles.sectionContainer}>
        <p className={styles.infoMessage}>
          <span>Shit happens.</span> Create contingency plans here so that your
          event runs smoothly when it needs to
        </p>
        <img src={rain} className={styles.image} alt="rain" />
        <div className={styles.cardMessageContainer}>
          <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
            Click “Create Backup Plan” in the Utility Bar to get started
          </CardMessage>
        </div>
      </div>
    );
  };

  render() {
    const { backupPlans, isLoading } = this.props;
    return (
      <>
        <Paper sticky={true}>
          <div className={styles.mainMenu}>
            <div />
            <Button
              label="Create Backup Plan"
              variant="contained"
              color="primary"
              onClick={this.onCreatePlan}
            />
          </div>
        </Paper>
        <div className={styles.headingContainer}>
          <HeadingLevelTwo>Event Day Complexities</HeadingLevelTwo>
          <Button
            label={this.state.isSectionsExpand ? 'Collapse All' : 'Expand All'}
            variant="text"
            color="secondary"
            onClick={this.toggleSectionCollapse}
          />
        </div>
        {isLoading && <Loader />}
        {backupPlans.length && !isLoading
          ? backupPlans.map((plan, index) => {
              return (
                plan.backup_plan_id && (
                  <BackupPlan
                    key={index}
                    events={this.props.events}
                    facilities={this.props.facilities}
                    fields={this.props.fields}
                    data={plan}
                    deleteBackupPlan={this.props.deleteBackupPlan}
                    updateBackupPlan={this.props.updateBackupPlan}
                    toggleBackUpStatus={this.props.toggleBackUpStatus}
                    timeSlots={this.props.timeSlots}
                    loadTimeSlots={this.props.loadTimeSlots}
                    isSectionExpand={this.state.isSectionsExpand}
                  />
                )
              );
            })
          : !isLoading && this.renderEmpty()}
        <Modal isOpen={this.state.isModalOpen} onClose={this.onModalClose}>
          <CreateBackupModal
            onCancel={this.onModalClose}
            events={this.props.events}
            facilities={this.props.facilities}
            fields={this.props.fields}
            timeSlots={this.props.timeSlots}
            saveBackupPlans={this.props.saveBackupPlans}
            loadTimeSlots={this.props.loadTimeSlots}
          />
        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state: IAppState) => ({
  events: state.complexities.data,
  facilities: state.complexities.facilities,
  fields: state.complexities.fields,
  backupPlans: state.complexities.backupPlans,
  timeSlots: state.complexities.timeSlots,
  isLoading: state.complexities.isLoading,
});

const mapDispatchToProps = {
  getEvents,
  getFacilities,
  getFields,
  getBackupPlans,
  saveBackupPlans,
  deleteBackupPlan,
  updateBackupPlan,
  loadTimeSlots,
  toggleBackUpStatus,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GamedayComplexities);
