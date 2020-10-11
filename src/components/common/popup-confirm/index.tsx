import React from "react";
import { Button, Modal } from "components/common";
import { BindingAction } from "common/models";
import styles from "./styles.module.scss";
import WarningIcon from "@material-ui/icons/Warning";

interface Props {
  message: string;
  isOpen: boolean;
  onClose: BindingAction;
  onCanceClick: BindingAction;
  onYesClick: BindingAction;
  type?: string;
  showYes?: boolean;
  showNo?: boolean;
  showCancelByLeft?: boolean;
}

const PopupConfirm = ({
  message,
  isOpen,
  onClose,
  onCanceClick,
  onYesClick,
  type,
  showYes,
  showNo,
  showCancelByLeft,
}: Props) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <section className={styles.popupWrapper}>
      {showCancelByLeft && (
        <div className={styles.cancelOnTheTop}>
          <Button
            onClick={onClose}
            label="Cancel"
            variant="text"
            color="secondary"
          />
        </div>
      )}
      <h2 className="visually-hidden">Warning</h2>
      <div className={styles.sectionItemWarning}>
        {type === "warning" ? (
          <div className={styles.iconContainer}>
            <WarningIcon style={{ fill: "#FFCB00" }} />
          </div>
        ) : null}
        <p className={styles.popupText}>{message}</p>
      </div>
      <p className={styles.btnsWrapper}>
        <span className={styles.exitBtnWrapper}>
          <Button
            onClick={onCanceClick}
            label={showNo || showCancelByLeft ? "No" : "Cancel"}
            variant="text"
            color="secondary"
          />
        </span>
        {showYes && (
          <Button
            onClick={onYesClick}
            label="Yes"
            variant="contained"
            color="primary"
          />
        )}
      </p>
    </section>
  </Modal>
);

export default PopupConfirm;
