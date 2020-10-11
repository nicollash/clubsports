import React from 'react';
import { Select } from 'components/common';
import { getSelectOptions, CheckEventDrafts } from 'helpers';
import {
  BindingCbWithOne,
  ISchedule,
  IFetchedBracket,
  IPublishSettings,
  ISelectOption,
} from 'common/models';
import {
  IScheduleFields,
  IBracketFields,
  EventPublishTypes,
  EventModifyTypes,
} from 'common/enums';
import { IInputEvent } from 'common/types';
import { PublishSettingFields } from './common';

const getModifyStatuOptions = (): ISelectOption[] => {
  const modifyStatuOptions = Object.values(EventModifyTypes).map(it => ({
    value: it,
    label: it,
  }));

  return modifyStatuOptions;
};

const getSettingsComponents = (
  publishType: EventPublishTypes,
  modifyModValue: EventModifyTypes,
  publishSettings: IPublishSettings,
  schedules: ISchedule[],
  brackets: IFetchedBracket[],
  onChangeSettings: BindingCbWithOne<IInputEvent>
) => {
  const { activeSchedule, activeBracket } = publishSettings;

  switch (publishType) {
    case EventPublishTypes.DETAILS:
    case EventPublishTypes.BRACKETS:
    case EventPublishTypes.TOURNAMENT_PLAY: {
      return null;
    }
    case EventPublishTypes.DETAILS_AND_TOURNAMENT_PLAY: {
      const scheduleOptions = getSelectOptions(
        schedules,
        IScheduleFields.SCHEDULE_ID,
        IScheduleFields.SCHEDULE_NAME
      );

      return (
        <Select
          onChange={onChangeSettings}
          name={PublishSettingFields.ACTIVE_SCHEDULE}
          options={scheduleOptions}
          value={activeSchedule?.schedule_id || ''}
          disabled={modifyModValue === EventModifyTypes.UNPUBLISH}
          label="Schedules:"
        />
      );
    }
    case EventPublishTypes.DETAILS_AND_TOURNAMENT_PLAY_AND_BRACKETS: {
      const scheduleOptions = getSelectOptions(
        schedules,
        IScheduleFields.SCHEDULE_ID,
        IScheduleFields.SCHEDULE_NAME
      );

      const bracketsOptions = getSelectOptions(
        brackets,
        IBracketFields.BRACKET_ID,
        IBracketFields.BRACKET_NAME
      );

      return (
        <>
          <Select
            onChange={onChangeSettings}
            name={PublishSettingFields.ACTIVE_SCHEDULE}
            options={scheduleOptions}
            value={activeSchedule?.schedule_id || ''}
            disabled={!CheckEventDrafts.checkDraftSchedule(schedules)}
            label="Schedules:"
          />
          <Select
            onChange={onChangeSettings}
            name={PublishSettingFields.ACTIVE_BRACKET}
            options={bracketsOptions}
            value={activeBracket?.bracket_id || ''}
            label="Brackets:"
          />
        </>
      );
    }
  }

  return null;
};

const getSettingItemById = (
  formField: PublishSettingFields,
  id: string,
  schedules: ISchedule[],
  brackets: IFetchedBracket[]
) => {
  switch (formField) {
    case PublishSettingFields.ACTIVE_SCHEDULE: {
      const activeSchedule = schedules.find(it => it.schedule_id === id);

      return activeSchedule;
    }
    case PublishSettingFields.ACTIVE_BRACKET: {
      const activeBracket = brackets.find(it => it.bracket_id === id);

      return activeBracket;
    }
  }
};

export { getModifyStatuOptions, getSettingsComponents, getSettingItemById };
