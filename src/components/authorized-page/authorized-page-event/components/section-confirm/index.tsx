import React, { useState, useEffect } from 'react';
import { Button, Input, PopupConfirm } from 'components/common';
import {
  BindingAction,
  IEventDetails,
  ISchedule,
  IFetchedBracket,
  IPublishSettings,
  BindingCbWithFour
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
  countBracketGame: number;
  countUnassignedGames: number | null;
  onClose: BindingAction;
  publishEventData: BindingCbWithFour<
    EventPublishTypes,
    EventModifyTypes,
    IPublishSettings,
    boolean
  >;
  getCountBracketGame: (bracketId: string) => void;
  checkUnassignedGames: (bracketId: string) => void;
}

const ConfirmSection = ({
  event,
  schedules,
  brackets,
  publishType,
  modifyModValue,
  countBracketGame,
  countUnassignedGames,
  onClose,
  getCountBracketGame,
  checkUnassignedGames,
  publishEventData,
}: Props) => {

  const DEFAULT_SELECTED_SCHEDULE =
    getPublishedSchedule(schedules) || schedules[0] || null;
  const DEFAULT_SELECTED_BRACKET =
    modifyModValue === EventModifyTypes.UNPUBLISH
      ? getPublishedBracket(brackets)
      : brackets[0] || null;

  const [publishSettings, changePublishSettings] = useState<
    IPublishSettings
  >({
    [PublishSettingFields.ACTIVE_SCHEDULE]: DEFAULT_SELECTED_SCHEDULE,
    [PublishSettingFields.ACTIVE_BRACKET]: DEFAULT_SELECTED_BRACKET,
  });
  const [confirmValue, changeConfirmValues] = useState('');
  const [isOpenWarningPopup, setIsOpenWarningPopup] = useState<boolean>(false);

  const trimmedEventName = event.event_name.trim();

  useEffect(()=>{
    onCheckUnassignedGames();
    if(
      publishType === EventPublishTypes.DETAILS_AND_TOURNAMENT_PLAY_AND_BRACKETS && 
      publishSettings.activeBracket
    ) {
      getCountBracketGame(publishSettings.activeBracket.bracket_id);
    }
  }, [publishSettings.activeBracket?.bracket_id]);

  const onCheckUnassignedGames = async () => {
    if(publishSettings.activeBracket) 
      await checkUnassignedGames(publishSettings.activeBracket.bracket_id);
  };

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

  const onCheckStatus = () => {
    if(modifyModValue === EventModifyTypes.PUBLISH &&
        publishType === EventPublishTypes.DETAILS_AND_TOURNAMENT_PLAY_AND_BRACKETS && (
          countBracketGame === 0 || 
          ( countUnassignedGames &&
          countUnassignedGames > 0)
        )
      ) {
      setIsOpenWarningPopup(true);
    } else {
      onPublishEvent();
    }
  };

  const onPublishEvent = () => {
    publishEventData(publishType, modifyModValue, publishSettings, false);
    onClose();
  };

  const onReturnToScheduler = () => {
    onClose();
    onCloseWarningPopup();
  };

  const onPublishEventWithUnassignedGames = () => {
    publishEventData(publishType, modifyModValue, publishSettings, true);
    onClose();
    onCloseWarningPopup();
  }

  const onCloseWarningPopup = () => setIsOpenWarningPopup(false);

  const warningMessage = countBracketGame === 0
    ? `You don't have any games. Select to either ignore or exit to fix them within the schedule.`
    : `You have ${countUnassignedGames} game(s) that are not assigned to a field or timeslot. 
      Select to either ignore these games or exit to fix them within the schedule.`

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
            onClick={onCheckStatus}
            variant={ButtonVariant.CONTAINED}
            color={ButtonColors.PRIMARY}
            btnStyles={BUTTON_STYLES}
            disabled={confirmValue !== trimmedEventName}
            label="Confirm"
          />
        </span>
      </p>
      <PopupConfirm
        type="warning"
        showNo={true}
        showYes={true}
        message={warningMessage}
        customNo="Ignore Games"
        customYes="Return to Scheduler"
        isOpen={isOpenWarningPopup}
        onClose={onCloseWarningPopup}
        onCanceClick={onPublishEventWithUnassignedGames}
        onYesClick={onReturnToScheduler}
      />
    </>
  );
};

export default ConfirmSection;
