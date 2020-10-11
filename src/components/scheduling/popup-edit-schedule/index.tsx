import React, { useState, useEffect } from "react";
import {
  Modal,
  HeadingLevelTwo,
  Input,
  Button,
  Tooltip,
} from "components/common";
import { BindingAction, BindingCbWithOne, IEventDetails } from "common/models";
import { getIcon } from "helpers";
import {
  Icons,
  ButtonColors,
  ButtonVariant,
  ButtonFormTypes,
} from "common/enums";
import Api from "api/api";
import { ISchedulingSchedule, ArchitectFormFields } from "../types";
import styles from "./styles.module.scss";
import DeletePopupConfrim from "components/common/delete-popup-confirm";

const DELETE_ICON_STYLES = {
  marginRight: "5px",
  fill: "#FF0F19",
};

interface Props {
  schedule: ISchedulingSchedule | null;
  onClose: BindingAction;
  onSubmit: BindingCbWithOne<ISchedulingSchedule>;
  onDelete: BindingCbWithOne<ISchedulingSchedule>;
}

const PopupEditSchedule = ({
  schedule,
  onClose,
  onSubmit,
  onDelete,
}: Props) => {
  const [editedSchedule, onChange] = React.useState<ISchedulingSchedule>(
    schedule!
  );
  const [eventDetails, setEventDetails] = useState<IEventDetails>();
  const [isDeleteModalOpen, onDeleteModal] = useState(false);
  const [deleteScheduleDisabled, setDeleteScheduleState] = useState(false);

  useEffect(() => {
    setDeleteScheduleState(Boolean(schedule?.is_published_YN));
    if (schedule) {
      getEventDetail();
    }
  }, [schedule]);

  const getEventDetail = async () => {
    const eventDetail = await Api.get("/events", {
      event_id: schedule?.event_id,
    });
    setEventDetails(
      eventDetail && eventDetail.length > 0 ? eventDetail[0] : null
    );
  };

  const onModalClose = () => {
    onDeleteModal(false);
  };

  const onDeleteClick = () => {
    onDeleteModal(true);
  };

  const localChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...editedSchedule, [name]: value });

  const localSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    onSubmit(editedSchedule);

    if (editedSchedule.schedule_name) {
      onClose();
    }
  };

  const localDelete = () => {
    onDelete(editedSchedule);
    onClose();
  };

  const deleteMessage = `You are about to delete this schedule and this cannot be undone. Deleting this schedule will also delete any brackets that use it.
  Please, enter the name of the schedule to continue.`;

  return (
    <Modal isOpen={Boolean(schedule)} onClose={onClose}>
      <section className={styles.popupWrapper}>
        <div className={styles.titleWrapper}>
          <HeadingLevelTwo>Edit Schedule</HeadingLevelTwo>
        </div>
        <form onSubmit={localSubmit}>
          <div className={styles.inputWrapper}>
            <Input
              onChange={localChange}
              value={editedSchedule.schedule_name || ""}
              name={ArchitectFormFields.SCHEDULE_NAME}
              label="Name"
              autofocus={true}
              width="220px"
            />
            <Input
              onChange={localChange}
              value={editedSchedule.schedule_tag || ""}
              name={ArchitectFormFields.SCHEDULT_TAG}
              label="Tag"
              width="220px"
              startAdornment="@"
            />
          </div>
          <table className={styles.infoTable}>
            <tbody>
              <tr>
                <td>
                  <b>Divisions: </b>
                  {editedSchedule.num_divisions}
                </td>
                <td>
                  <b>Teams: </b>
                  {editedSchedule.num_teams}
                </td>
              </tr>
              <tr>
                <td>
                  <b>Playoffs: </b>
                  {eventDetails && eventDetails.playoffs_exist ? "Yes" : "No"}
                </td>
                <td>
                  <b>Bracket Type: </b>
                  {eventDetails &&
                    eventDetails.bracket_type === "1" &&
                    "Single Elimination"}
                  {eventDetails &&
                    eventDetails.bracket_type === "2" &&
                    "Double Elimination"}
                  {eventDetails &&
                    eventDetails.bracket_type === "3" &&
                    "3 Game Guarantee"}
                  {(!eventDetails || !eventDetails.bracket_type) && "-"}
                </td>
              </tr>
            </tbody>
          </table>
          <div className={styles.btnsWrapper}>
            <Tooltip
              disabled={!deleteScheduleDisabled}
              title="This schedule has been published and therefore cannot be deleted."
              type="info"
            >
              <p className={styles.dellBtnWrapper}>
                <Button
                  onClick={onDeleteClick}
                  icon={getIcon(Icons.DELETE, DELETE_ICON_STYLES)}
                  variant={ButtonVariant.TEXT}
                  color={ButtonColors.INHERIT}
                  btnType={ButtonFormTypes.BUTTON}
                  btnStyles={{ color: "#ff0f19" }}
                  disabled={deleteScheduleDisabled}
                  label="Delete Schedule &amp; Associated Brackets"
                />
              </p>
            </Tooltip>
            <div className={styles.navBtnWrapper}>
              <p className={styles.cancelBtnWrapper}>
                <Button
                  onClick={onClose}
                  variant={ButtonVariant.TEXT}
                  color={ButtonColors.SECONDARY}
                  btnType={ButtonFormTypes.BUTTON}
                  label="Cancel"
                />
              </p>
              <Button
                variant={ButtonVariant.CONTAINED}
                color={ButtonColors.PRIMARY}
                btnType={ButtonFormTypes.SUBMIT}
                label="Save"
              />
            </div>
          </div>
        </form>
        <DeletePopupConfrim
          type={"schedule"}
          message={deleteMessage}
          deleteTitle={schedule?.schedule_name!}
          isOpen={isDeleteModalOpen}
          onClose={onModalClose}
          onDeleteClick={localDelete}
        />
      </section>
    </Modal>
  );
};

export default PopupEditSchedule;
