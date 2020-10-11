import React from "react";
import { Button, Modal, Input } from "components/common";
import { BindingAction } from "common/models";
import styles from "./styles.module.scss";
import { capitalize } from "lodash";
import { IInputEvent } from "common/types";

interface Props {
  type: string;
  deleteTitle: string;
  isOpen: boolean;
  onClose: BindingAction;
  onDeleteClick: BindingAction;
  message?: string;
}

const PopupDeleteConfirm = ({
  type,
  deleteTitle,
  isOpen,
  onClose,
  onDeleteClick,
  message,
}: Props) => {
  const trimmedDeleteTitle = deleteTitle?.trim();

  const [inputValue, changeInputValue] = React.useState("");

  const onChangeInputValue = (evt: IInputEvent) => {
    changeInputValue(evt.target.value);
  };

  React.useEffect(() => {
    changeInputValue("");
  }, [trimmedDeleteTitle]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className={styles.popupWrapper}>
        <h2 className={styles.title}>
          {type === "player"
            ? deleteTitle
            : !type
            ? `Delete ${trimmedDeleteTitle}?`
            : `Delete '${trimmedDeleteTitle}' ${type}?`}
        </h2>
        <div className={styles.confirmWrapper}>
          <p className={styles.confirmDesc}>{message}</p>
          <Input
            onChange={onChangeInputValue}
            value={inputValue}
            placeholder={
              type === "player" ? "DELETE" : `${capitalize(type)} name`
            }
            autofocus
          />
        </div>
        <p className={styles.btnsWrapper}>
          <span className={styles.cancelBtnWrapper}>
            <Button
              onClick={onClose}
              label="Cancel"
              variant="text"
              color="secondary"
            />
          </span>
          <Button
            onClick={onDeleteClick}
            label="Delete"
            variant="contained"
            type="danger"
            color="primary"
            disabled={
              type === "player"
                ? inputValue.toLowerCase() !== "delete"
                : trimmedDeleteTitle !== inputValue
            }
          />
        </p>
      </section>
    </Modal>
  );
};

export default PopupDeleteConfirm;
