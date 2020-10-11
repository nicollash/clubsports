import React, { useState } from "react";
import {
  Button,
  HeadingLevelThree,
  Paper,
  Tooltip,
  MenuButton,
  Loader,
  PopupConfirm,
} from "components/common";
import styles from "./styles.module.scss";
import { TooltipMessageTypes } from "components/common/tooltip-message/types";
import { Modal, HeadingLevelFour } from "components/common";
import CreateScheduleStepTwo from "components/scheduling/create-new-modal/create-schedule-step-two";
import { IConfigurableSchedule, ISchedule } from "common/models";
import { EventStatuses } from "common/enums";
import { getTournamentStatusColor } from "helpers";

const publishBtnStyles = {
  width: 180,
  whiteSpace: "nowrap",
  overflow: "hidden",
};

interface IProps {
  schedule: ISchedule | IConfigurableSchedule | null;
  savingInProgress?: boolean;
  schedulePublished?: boolean;
  anotherSchedulePublished?: boolean;
  isFullScreen: boolean;
  eventName: string;
  onClose: () => void;
  onSaveDraft: () => void;
  onUnpublish: () => void;
  onSaveAsDraft: (s: ISchedule) => void;
  saveAndPublish: () => void;
  saveAsPublished: (s: ISchedule) => void;
}

export default (props: IProps) => {
  const {
    schedule,
    savingInProgress,
    eventName,
    onClose,
    onUnpublish,
    onSaveDraft,
    onSaveAsDraft,
    saveAndPublish,
    saveAsPublished,
    schedulePublished,
    anotherSchedulePublished,
    isFullScreen,
  } = props;
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState<boolean>(false);
  const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);
  const [isSaveasWarningOpen, setIsSaveasWarningOpen] = useState<boolean>(false);
  const [scheduleDraft, setScheduleDraft] = useState(schedule);

  const onChangeScheduleFields = (name: string, value: string) => {
    const newSchedule = {
      ...scheduleDraft,
      [name]: value,
    };
    setScheduleDraft(newSchedule as ISchedule);
  };

  const onCreate = () => {
    setIsSaveasWarningOpen(Boolean(schedule?.is_published_YN));
    setIsCreateScheduleOpen(false);
    if(!schedule?.is_published_YN ) {
      onSaveAsDraft(scheduleDraft!);
    }
  };

  const onCancel = () => {
    setScheduleDraft(schedule);
    setIsCreateScheduleOpen(false);
  };

  const onCloseWarning = () => {
    setIsWarningOpen(false);
    onSaveDraft();
  };

  const onCloseSaveAsWarning = () => {
    setIsSaveasWarningOpen(false);
    onSaveAsDraft(scheduleDraft!);
  };

  const onConfirmWarning = async () => {
    setIsWarningOpen(false);
    saveAndPublish();
  };

  const onConfirmSaveAsWarning = async () => {
    setIsSaveasWarningOpen(false);
    saveAsPublished(scheduleDraft!)
  };

  const onSave = () => {
    schedule?.is_published_YN === 1 ? setIsWarningOpen(true) : onSaveDraft();
  };

  return (
    <div>
      <Modal isOpen={isCreateScheduleOpen} onClose={onCancel}>
        <div className={styles.wrapper}>
          <HeadingLevelFour>
            <span>Create Schedule</span>
          </HeadingLevelFour>
          {scheduleDraft && (
            <CreateScheduleStepTwo
              schedule={scheduleDraft}
              onCancelClick={onCancel}
              onChange={onChangeScheduleFields}
              chooseOnCreateFunction={onCreate}
            />
          )}
        </div>
      </Modal>
      <PopupConfirm
        type="warning"
        showYes={true}
        showNo={true}
        isOpen={isWarningOpen}
        message={"Would you like to Publish These Changes?"}
        onClose={onCloseWarning}
        onCanceClick={onCloseWarning}
        onYesClick={onConfirmWarning}
      />
      <PopupConfirm
        type="warning"
        showYes={true}
        showNo={true}
        isOpen={isSaveasWarningOpen}
        message={"You are creating a new version of a Published Schedule. Would you like this to be the new published schedule?"}
        onClose={onCloseSaveAsWarning}
        onCanceClick={onCloseSaveAsWarning}
        onYesClick={onConfirmSaveAsWarning}
      />
      <div className={styles.paperWrapper}>
        <Paper>
         
          {scheduleDraft &&
            <div className={`${styles.statusWrapp}`}>
              <span className={styles.tournamentContentTitle}>Status:</span>{" "}
              {EventStatuses[scheduleDraft.is_published_YN] || "—"}{" "}
              <span
                className={styles.tournamentStatus}
                style={{
                  ...getTournamentStatusColor(scheduleDraft.is_published_YN),
                }}
              />
            </div>
          }
          <div className={styles.paperContainer}>
            <div className={styles.leftSection}>
              <HeadingLevelThree>
                <span>{scheduleDraft?.schedule_name}</span>
              </HeadingLevelThree>
              <div className={styles.additionalName}>
                (Event: <span style={{ fontWeight: 600 }}>{eventName}</span>)
              </div>
            </div>
            <div className={styles.btnsGroup}>
              {!isFullScreen && (
                <Button
                  label="Close"
                  variant="text"
                  color="secondary"
                  onClick={onClose}
                  disabled={savingInProgress}
                />
              )}
              {savingInProgress && (
                <Loader
                  size={30}
                  styles={{
                    padding: "0 25px",
                  }}
                />
              )}
              {!savingInProgress && (
                <MenuButton
                  label="Save"
                  variant="contained"
                  color="primary"
                  menuItems={[
                    {
                      label: "Save",
                      action: onSave,
                      disabled: savingInProgress,
                    },
                    {
                      label: "Save As...",
                      action: () => setIsCreateScheduleOpen(true),
                      disabled: savingInProgress,
                    },
                  ]}
                />
              )}

              {schedulePublished && false ? (
                <Button
                  label="Unpublish"
                  variant="contained"
                  color="primary"
                  disabled={savingInProgress}
                  onClick={onUnpublish}
                />
              ) : (
                false && (
                  <Tooltip
                    disabled={!anotherSchedulePublished}
                    title="Another Schedule is already published"
                    type={TooltipMessageTypes.INFO}
                  >
                    <div
                      style={{
                        display: "inline",
                        marginLeft: "15px",
                        padding: "10px 0",
                      }}
                    >
                      <Button
                        btnStyles={publishBtnStyles}
                        label={"Save and Publish"}
                        variant="contained"
                        color="primary"
                        disabled={anotherSchedulePublished || savingInProgress}
                        onClick={saveAndPublish}
                      />
                    </div>
                  </Tooltip>
                )
              )}
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
};
