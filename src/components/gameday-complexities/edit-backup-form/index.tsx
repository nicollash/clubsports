import React from 'react';
import { Input, Select, Radio, Button, Loader } from 'components/common';
import {
  IFacility,
  BindingCbWithOne,
  BindingAction,
  IEventDetails,
} from 'common/models';
import TableChangeTime from '../table-change-time';
import MultiSelect, {
  IMultiSelectOption,
} from 'components/common/multi-select';
import { IField } from 'common/models';
import MultipleSearch from 'components/common/multiple-search-select';
import styles from '../create-backup-modal/styles.module.scss';
import {
  mapFacilitiesToOptions,
  mapFieldsToOptions,
  mapTimeslotsToOptions,
  getFacilitiesOptionsForEvent,
  getFieldsOptionsForFacilities,
  getEventOptions,
  getTimeSlotOptions,
  mapChangeValueOptions,
} from '../helper';
import { IBackupPlan } from 'common/models/backup_plan';
import { IMultipleSelectOption } from '../create-backup-form';
import { PopupExposure } from 'components/common';
import {
  IComplexityTimeslots,
  OptionsEnum,
  TypeOptionsEnum,
  IChangedTimeSlot,
} from '../common';
import { formatTimeSlot } from 'helpers';

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

interface Props {
  backupPlan: IBackupPlan;
  events: IEventDetails[];
  facilities: IFacility[];
  fields: IField[];
  timeSlots: IComplexityTimeslots;
  updateBackupPlan: BindingCbWithOne<Partial<IBackupPlan>>;
  loadTimeSlots: (eventId: string) => void;
  onEditClose: BindingAction;
}

interface State {
  backupPlan: any;
  isModalConfirmOpen: boolean;
}

class CreateBackupForm extends React.Component<Props, State> {
  state = { backupPlan: {}, isModalConfirmOpen: false };

  componentDidMount() {
    const { backupPlan, timeSlots } = this.props;
    const { event_id } = backupPlan;
    const eventTimeSlots = timeSlots[event_id];

    if (event_id && !eventTimeSlots) {
      this.props.loadTimeSlots(event_id);
    }

    this.setState({
      backupPlan: {
        ...this.props.backupPlan,
        facilities_impacted: mapFacilitiesToOptions(
          this.props.facilities,
          this.props.backupPlan.facilities_impacted
        ),
        fields_impacted: mapFieldsToOptions(
          this.props.fields,
          this.props.backupPlan.fields_impacted
        ),
        timeslots_impacted:
          this.props.backupPlan.timeslots_impacted &&
          mapTimeslotsToOptions(
            this.props.backupPlan.timeslots_impacted,
            this.props.backupPlan.backup_type
          ),
        change_value:
          this.props.backupPlan.change_value &&
          mapChangeValueOptions(this.props.backupPlan.change_value),
      },
    });
  }

  onChange = (name: string, value: any) => {
    this.setState(({ backupPlan }) => ({
      backupPlan: { ...backupPlan, [name]: value },
    }));
  };

  onNameChange = (e: InputTargetValue) =>
    this.onChange('backup_name', e.target.value);

  onTournamentChange = (e: InputTargetValue) => {
    this.onChange('event_id', e.target.value);
    this.onChange('facilities_impacted', '');
    this.onChange('fields_impacted', '');
    this.onChange('timeslots_impacted', undefined);
    this.onChange('change_value', undefined);
    this.onChange('event_date_impacted', undefined);
  };

  onTypeChange = (e: InputTargetValue) => {
    this.onChange('backup_type', OptionsEnum[e.target.value]);
    this.onChange('timeslots_impacted', '');
    this.onChange('change_value', undefined);
    this.onChange('event_date_impacted', undefined);
  };

  onFacilitiesChange = (
    _event: InputTargetValue,
    values: IMultipleSelectOption[]
  ) => {
    this.onChange('facilities_impacted', values);
  };

  onFieldsChange = (name: string, values: IMultiSelectOption[]) => {
    const checkedField = values.filter(it => Boolean(it.checked));

    this.onChange(name, checkedField);
  };

  onTimeslotsChange = (
    _event: InputTargetValue,
    values: IMultipleSelectOption[]
  ) => {
    this.onChange('timeslots_impacted', values);
  };

  onTimeslotChange = (e: InputTargetValue) =>
    this.onChange('timeslots_impacted', e.target.value);

  onChangeEventDateImpacted = (e: InputTargetValue) => {
    this.onChange('event_date_impacted', e.target.value);
  };

  onChangeToChange = (timeSlot: IChangedTimeSlot, flag: boolean) => {
    const { backupPlan }: any = this.state;
    const { change_value } = backupPlan;

    const changedTimeSlots = change_value
      ? [...change_value, timeSlot]
      : [timeSlot];

    const newChangedTimeSlots = flag
      ? changedTimeSlots
      : change_value.filter(
          (it: IChangedTimeSlot) => it.timeSlotTime !== timeSlot.timeSlotTime
        );

    const timeSlotOptions = newChangedTimeSlots.map((it: IChangedTimeSlot) => ({
      label: formatTimeSlot(it.timeSlotTime),
      value: it.timeSlotTime,
    }));

    this.onChange('change_value', newChangedTimeSlots);

    this.onChange('timeslots_impacted', timeSlotOptions);
  };

  onChangeChangedTimeSlot = (timeSlot: IChangedTimeSlot) => {
    const { backupPlan }: any = this.state;

    const updatedTimeSlots = backupPlan.change_value.map(
      (it: IChangedTimeSlot) =>
        it.timeSlotTime === timeSlot.timeSlotTime ? timeSlot : it
    );

    this.onChange('change_value', updatedTimeSlots);
  };

  onSave = () => {
    if (this.state.isModalConfirmOpen) {
      this.setState({ isModalConfirmOpen: false });
    }
    this.props.updateBackupPlan(this.state.backupPlan);
    this.props.onEditClose();
  };

  onCancelClick = () => {
    this.setState({ isModalConfirmOpen: true });
  };

  onModalConfirmClose = () => {
    this.setState({ isModalConfirmOpen: false });
  };

  onExit = () => {
    this.setState({ isModalConfirmOpen: false });
    this.props.onEditClose();
  };

  renderTimeslots = (timeslots: any, event_date_impacted: any) => {
    const { backupPlan, timeSlots } = this.props;
    const { event_id } = backupPlan;
    const eventTimeSlots = timeSlots[event_id];

    if (
      eventTimeSlots &&
      !eventTimeSlots.isLoaded &&
      eventTimeSlots.eventTimeSlots.length === 0
    ) {
      return null;
    }

    const timeSlotOptions = getTimeSlotOptions(eventTimeSlots);

    return (
      <div className={styles.itemTimeSlotsWrapper}>
        <div className={styles.itemTimeSlots}>
          <MultipleSearch
            label="Timeslots"
            width={'282px'}
            options={timeSlotOptions}
            onChange={this.onTimeslotsChange}
            value={timeslots || []}
          />
        </div>
        <Select
          onChange={this.onChangeEventDateImpacted}
          value={event_date_impacted || ''}
          options={eventTimeSlots.eventDays.map((day, idx) => ({
            label: `Day ${idx + 1}`,
            value: day,
          }))}
          width="282px"
          label="Event Day"
        />
      </div>
    );
  };

  render() {
    const {
      events,
      facilities: allFacilities,
      fields: allFields,
      timeSlots,
    } = this.props;

    const {
      backup_name,
      event_id,
      backup_type,
      facilities_impacted,
      fields_impacted,
      timeslots_impacted,
      change_value,
      event_date_impacted,
    }: any = this.state.backupPlan;

    const eventsOptions = getEventOptions(events);

    const facilitiesOptions = getFacilitiesOptionsForEvent(
      allFacilities,
      event_id
    );

    const fieldsOptions =
      facilities_impacted &&
      getFieldsOptionsForFacilities(
        allFields,
        facilities_impacted,
        fields_impacted
      );

    const eventTimeSlots = timeSlots[event_id];

    return (
      <div className={styles.container}>
        <div className={styles.title}>Edit Backup</div>
        <div className={styles.formContainer}>
          <div className={styles.row}>
            <div className={styles.item}>
              <Input
                fullWidth={true}
                label="Name"
                onChange={this.onNameChange}
                value={backup_name || ''}
                autofocus={true}
              />
            </div>
            <div className={styles.item}>
              <Select
                label="Event Impacted"
                options={eventsOptions}
                onChange={this.onTournamentChange}
                value={event_id || ''}
              />
            </div>
            <div className={styles.itemLarge}>
              <Radio
                row={true}
                options={Object.values(TypeOptionsEnum)}
                formLabel="Type"
                onChange={this.onTypeChange}
                checked={
                  TypeOptionsEnum[backup_type] || OptionsEnum['Cancel Game']
                }
              />
            </div>
          </div>
          <div className={styles.row}>
            {event_id && (
              <div className={styles.item}>
                <MultipleSearch
                  label="Facilities Impacted"
                  width={'282px'}
                  options={facilitiesOptions}
                  onChange={this.onFacilitiesChange}
                  value={facilities_impacted || []}
                />
              </div>
            )}

            {facilities_impacted?.length ? (
              <div className={styles.item}>
                <MultiSelect
                  label="Fields Impacted"
                  name="fields_impacted"
                  width="282px"
                  selectOptions={fieldsOptions}
                  onChange={this.onFieldsChange}
                />
              </div>
            ) : null}

            {backup_type === OptionsEnum['Cancel Games'] &&
            eventTimeSlots &&
            eventTimeSlots.isLoading ? (
              <Loader />
            ) : backup_type === OptionsEnum['Cancel Games'] &&
              fields_impacted?.length ? (
              this.renderTimeslots(timeslots_impacted, event_date_impacted)
            ) : null}
          </div>
          <div className={styles.row}>
            {backup_type ===
              OptionsEnum['Weather Interruption: Modify Game Timeslots'] &&
            eventTimeSlots &&
            eventTimeSlots.isLoading ? (
              <Loader />
            ) : backup_type ===
                OptionsEnum['Weather Interruption: Modify Game Timeslots'] &&
              fields_impacted?.length ? (
              <TableChangeTime
                timeSlots={eventTimeSlots.eventTimeSlots}
                changedTimeSlots={change_value || []}
                onChangeToChange={this.onChangeToChange}
                onChangeChangedTimeSlot={this.onChangeChangedTimeSlot}
              />
            ) : null}
          </div>
        </div>
        <div className={styles.buttonsGroup}>
          <Button
            label="Cancel"
            variant="text"
            color="secondary"
            onClick={this.onCancelClick}
          />
          <Button
            label="Save"
            variant="contained"
            color="primary"
            onClick={this.onSave}
          />
        </div>
        <PopupExposure
          isOpen={this.state.isModalConfirmOpen}
          onClose={this.onModalConfirmClose}
          onExitClick={this.onExit}
          onSaveClick={this.onSave}
        />
      </div>
    );
  }
}

export default CreateBackupForm;
