import React from 'react';
import styles from '../create-backup-modal/styles.module.scss';
import { Input, Select, Radio, CardMessage, Loader } from 'components/common';
import TableChangeTime from '../table-change-time';
import { BindingCbWithThree, IFacility, IEventDetails } from 'common/models';
import { IField } from 'common/models';
import MultipleSearch from 'components/common/multiple-search-select';
import {
  getFacilitiesOptionsForEvent,
  getFieldsOptionsForFacilities,
  getEventOptions,
  getTimeSlotOptions,
} from '../helper';
import { CardMessageTypes } from 'components/common/card-message/types';
import {
  IComplexityTimeslots,
  OptionsEnum,
  TypeOptionsEnum,
  IChangedTimeSlot,
} from '../common';

import MultiSelect, {
  IMultiSelectOption,
} from 'components/common/multi-select';
import { formatTimeSlot } from 'helpers';

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

interface Props {
  index: number;
  backupPlan: any;
  onChange: BindingCbWithThree<string, any, number>;
  loadTimeSlots: (eventId: string) => void;
  events: IEventDetails[];
  facilities: IFacility[];
  fields: IField[];
  timeSlots: IComplexityTimeslots;
}

export interface IMultipleSelectOption {
  label: string;
  value: string;
}

class CreateBackupForm extends React.Component<Props> {
  onNameChange = (e: InputTargetValue) =>
    this.props.onChange('backup_name', e.target.value, this.props.index);

  onTournamentChange = (e: InputTargetValue) => {
    this.props.onChange('event_id', e.target.value, this.props.index);
    this.props.onChange('facilities_impacted', '', this.props.index);
    this.props.onChange('fields_impacted', '', this.props.index);
    this.props.onChange('timeslots_impacted', undefined, this.props.index);
    this.props.onChange('change_value', undefined, this.props.index);
    this.props.onChange('event_date_impacted', undefined, this.props.index);
  };

  onTypeChange = (e: InputTargetValue) => {
    this.props.onChange(
      'backup_type',
      OptionsEnum[e.target.value],
      this.props.index
    );
    this.props.onChange('timeslots_impacted', '', this.props.index);
    this.props.onChange('change_value', undefined, this.props.index);
    this.props.onChange('event_date_impacted', undefined, this.props.index);
  };

  onFacilitiesChange = (
    _event: InputTargetValue,
    values: IMultipleSelectOption[]
  ) => {
    this.props.onChange('facilities_impacted', values, this.props.index);
  };

  onFieldsChange = (_name: string, values: IMultiSelectOption[]) => {
    const { backupPlan, timeSlots } = this.props;
    const { event_id } = backupPlan;
    const eventTimeSlots = timeSlots[event_id];
    const checkedField = values.filter(it => Boolean(it.checked));

    if (event_id && !eventTimeSlots) {
      this.props.loadTimeSlots(event_id);
    }

    this.props.onChange('fields_impacted', checkedField, this.props.index);
  };

  onTimeslotsChange = (
    _event: InputTargetValue,
    values: IMultipleSelectOption[]
  ) => {
    this.props.onChange('timeslots_impacted', values, this.props.index);
  };

  onChangeToChange = (timeSlot: IChangedTimeSlot, flag: boolean) => {
    const { backupPlan } = this.props;
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

    this.props.onChange('change_value', newChangedTimeSlots, this.props.index);

    this.props.onChange(
      'timeslots_impacted',
      timeSlotOptions,
      this.props.index
    );
  };

  onChangeChangedTimeSlot = (timeSlot: IChangedTimeSlot) => {
    const { backupPlan } = this.props;
    const { change_value } = backupPlan;

    const updatedTimeSlots = change_value.map((it: IChangedTimeSlot) =>
      it.timeSlotTime === timeSlot.timeSlotTime ? timeSlot : it
    );

    this.props.onChange('change_value', updatedTimeSlots, this.props.index);
  };

  onChangeEventDateImpacted = (e: InputTargetValue) => {
    this.props.onChange(
      'event_date_impacted',
      e.target.value,
      this.props.index
    );
  };

  renderTimeslots = (renderTimeslots: any, event_date_impacted: any) => {
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
            value={renderTimeslots || []}
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
      backupPlan,
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
    } = backupPlan;

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
      <div className={styles.formContainer}>
        <div style={{ paddingTop: '15px' }}>
          <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
            Creating/Modifying Backup Plans Only Apply to Schedules that are Currently Published!
          </CardMessage>
        </div>
        <div className={styles.row}>
          <div className={styles.item}>
            <Input
              fullWidth={true}
              label="Name"
              placeholder = "E.g., Possible Nor'easter @ Event"
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
    );
  }
}

export default CreateBackupForm;
