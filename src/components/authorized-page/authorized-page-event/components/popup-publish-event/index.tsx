/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { Modal, HeadingLevelTwo, Button, Select } from "components/common";
import moment from "moment";
import SectionConfirm from "../section-confirm";
import SectionModify from "../section-modify";
import {
  BindingAction,
  IEventDetails,
  ISchedule,
  IFetchedBracket,
  IPublishSettings,
  BindingCbWithThree,
} from "common/models";
import {
  ButtonVariant,
  ButtonColors,
  EventPublishTypes,
  EventModifyTypes,
} from "common/enums";
import { IInputEvent } from "common/types";
import { getModifyStatuOptions } from "../../helpers";
import styles from "./styles.module.scss";

const modifyStatuOptions = getModifyStatuOptions();

const BUTTON_STYLES = {
  width: "115px",
};

interface Props {
  event: IEventDetails;
  schedules: ISchedule[];
  brackets: IFetchedBracket[];
  isOpen: boolean;
  gameCount: {
    poolLength: number;
    bracketLength: number;
  };
  teamCount: number;
  onClose: BindingAction;
  publishEventData: BindingCbWithThree<
    EventPublishTypes,
    EventModifyTypes,
    IPublishSettings
  >;
}

const PopupPublishEvent = ({
  event,
  schedules,
  brackets,
  isOpen,
  gameCount,
  teamCount,
  onClose,
  publishEventData,
}: Props) => {
  const [isConfrimOpen, toggleConfrim] = React.useState<boolean>(false);
  const [
    publishType,
    changePublishValue,
  ] = React.useState<EventPublishTypes | null>(null);

  const [modifyModValue, changeModifyModeValue] = React.useState<
    EventModifyTypes
  >(EventModifyTypes.PUBLISH);

  const onChangeModifyModeValue = ({ target }: IInputEvent) => {
    changePublishValue(null);

    changeModifyModeValue(target.value as EventModifyTypes);
  };

  React.useEffect(() => {
    changeModifyModeValue(EventModifyTypes.PUBLISH);
    toggleConfrim(false);
    changePublishValue(null);
  }, [isOpen]);

  const onToggleConfrim = () => {
    toggleConfrim(!isConfrimOpen);
  };

  const sortByDate = (arr: any[]) => {
    return arr?.sort((a, b) => {
      return +new Date(
        a.updated_datetime ? a.updated_datetime : a.created_datetime
      ) >
        +new Date(b.updated_datetime ? b.updated_datetime : b.created_datetime)
        ? -1
        : 1;
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className={styles.section}>
        <div className={styles.titleWrapper}>
          <HeadingLevelTwo>Modify Published Status</HeadingLevelTwo>
          <p className={styles.eventName}>Event: {event.event_name}</p>
          <div className={styles.gameInfo}>
            <div className={styles.gameCount}>
              <p>Teams: {teamCount}</p>
              <p>Games Being Published (Pool): {gameCount.poolLength}</p>
              <p>Games Being Published (Bracket): {gameCount.bracketLength}</p>
            </div>
            <div className={styles.gameCount}>
              <p>
                Start Date: {moment.utc(event.event_startdate).format("MM/DD/YYYY")}
              </p>
              <p>
                End Date: {moment.utc(event.event_enddate).format("MM/DD/YYYY")}
              </p>
              <p>Gender: {event.sport_id === 1 ? "Boys" : "Girls"}</p>
            </div>
          </div>
        </div>
        {isConfrimOpen && publishType ? (
          <SectionConfirm
            event={event}
            schedules={sortByDate(schedules)}
            brackets={sortByDate(brackets)}
            publishType={publishType}
            modifyModValue={modifyModValue}
            onClose={onClose}
            publishEventData={publishEventData}
          />
        ) : (
          <>
            <div className={styles.modifyWrapper}>
              <div className={styles.selectWrapper}>
                <Select
                  value={modifyModValue}
                  options={modifyStatuOptions}
                  onChange={onChangeModifyModeValue}
                  label="Modify Mode:"
                />
              </div>
              <SectionModify
                event={event}
                schedules={sortByDate(schedules)}
                brackets={sortByDate(brackets)}
                modifyModValue={modifyModValue}
                publishType={publishType}
                changePublishValue={changePublishValue}
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
                  onClick={onToggleConfrim}
                  variant={ButtonVariant.CONTAINED}
                  color={ButtonColors.PRIMARY}
                  btnStyles={BUTTON_STYLES}
                  disabled={!Boolean(publishType)}
                  label="Save"
                />
              </span>
            </p>
          </>
        )}
      </section>
    </Modal>
  );
};

export default PopupPublishEvent;
