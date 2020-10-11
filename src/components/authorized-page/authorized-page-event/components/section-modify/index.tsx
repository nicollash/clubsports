import React from 'react';
import { EventModifyTypes, EventPublishTypes } from 'common/enums';
import { Radio } from 'components/common';
import { IInputEvent } from 'common/types';
import {
  BindingCbWithOne,
  IEventDetails,
  ISchedule,
  IFetchedBracket,
} from 'common/models';
import { getModifyPublishValues, getModifyUnpublishValues } from './helpers';

interface Props {
  event: IEventDetails;
  schedules: ISchedule[];
  brackets: IFetchedBracket[];
  modifyModValue: EventModifyTypes;
  publishType: EventPublishTypes | null;
  changePublishValue: BindingCbWithOne<EventPublishTypes>;
}

const SectionModify = ({
  event,
  schedules,
  brackets,
  modifyModValue,
  publishType,
  changePublishValue,
}: Props) => {
  const getModifyOptions =
    modifyModValue === EventModifyTypes.PUBLISH
      ? getModifyPublishValues(event, schedules, brackets)
      : getModifyUnpublishValues(event, schedules, brackets);

  const onChangePublishValue = ({ target }: IInputEvent) => {
    changePublishValue(target.value as EventPublishTypes);
  };

  return (
    <Radio
      onChange={onChangePublishValue}
      options={getModifyOptions}
      checked={publishType || ''}
    />
  );
};

export default SectionModify;
