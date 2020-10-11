import React from 'react';
import { Button, Input } from 'components/common';
import {
  BindingAction,
  IEventDetails,
  ISchedule,
  IFetchedBracket,
  IPublishSettings,
  BindingCbWithThree,
} from 'common/models';
import {
  ButtonColors,
  ButtonVariant,
  EventPublishTypes,
  EventModifyTypes,
} from 'common/enums';
import { IInputEvent } from 'common/types';
import { getSettingsComponents, getSettingItemById } from '../../helpers';
import { getPublishedSchedule, getPublishedBracket } from './helpers';
import { PublishSettingFields } from '../../common';
import styles from './styles.module.scss';

const BUTTON_STYLES = {
  width: '115px',
};

interface Props {
  event: IEventDetails;
  schedules: ISchedule[];
  brackets: IFetchedBracket[];
  publishType: EventPublishTypes;
  modifyModValue: EventModifyTypes;
  onClose: BindingAction;
  publishEventData: BindingCbWithThree<
    EventPublishTypes,
    EventModifyTypes,
    IPublishSettings
  >;
}

const ConfirmSection = ({
  event,
  schedules,
  brackets,
  publishType,
  modifyModValue,
  onClose,
  publishEventData,
}: Props) => {
  const DEFAULT_SELECTED_SCHEDULE =
    getPublishedSchedule(schedules) || schedules[0] || null;
  const DEFAULT_SELECTED_BRACKET =
    modifyModValue === EventModifyTypes.UNPUBLISH
      ? getPublishedBracket(brackets)
      : brackets[0] || null;

  const [publishSettings, changePublishSettings] = React.useState<
    IPublishSettings
  >({
    [PublishSettingFields.ACTIVE_SCHEDULE]: DEFAULT_SELECTED_SCHEDULE,
    [PublishSettingFields.ACTIVE_BRACKET]: DEFAULT_SELECTED_BRACKET,
  });
  const [confirmValue, changeConfirmValues] = React.useState('');

  const trimmedEventName = event.event_name.trim();

  const onChangeConfirmValue = ({ target }: IInputEvent) => {
    changeConfirmValues(target.value);
  };

  const onChangeSettings = ({ target: { name, value } }: IInputEvent) => {
    const settingItem = getSettingItemById(
      name as PublishSettingFields,
      value,
      schedules,
      brackets
    );

    changePublishSettings({
      ...publishSettings,
      [name]: settingItem,
    });
  };

  const onPublishEvent = () => {
    publishEventData(publishType, modifyModValue, publishSettings);

    onClose();
  };

  return (
    <>
      <form className={styles.selectsWrapper}>
        {getSettingsComponents(
          publishType,
          modifyModValue,
          publishSettings,
          schedules,
          brackets,
          onChangeSettings
        )}
      </form>
      <div className={styles.inputWrapper}>
        <p className={styles.inputDesc}>Please type event name to confirm.</p>
        <Input
          value={confirmValue}
          onChange={onChangeConfirmValue}
          placeholder="Event name"
        />
      </div>
      <p className={styles.btnsWrapper}>
        <Button
          onClick={onClose}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          btnStyles={BUTTON_STYLES}
          label="Cancel"
        />
        <span className={styles.btnWrapper}>
          <Button
            onClick={onPublishEvent}
            variant={ButtonVariant.CONTAINED}
            color={ButtonColors.PRIMARY}
            btnStyles={BUTTON_STYLES}
            disabled={confirmValue !== trimmedEventName}
            label="Confirm"
          />
        </span>
      </p>
    </>
  );
};

export default ConfirmSection;
