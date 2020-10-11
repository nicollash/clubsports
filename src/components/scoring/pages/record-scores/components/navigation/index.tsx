import React from "react";
import { Button, Loader } from "components/common";
import FabButton from "components/common/fab-button";
import { ButtonTypes, ButtonVariant, ButtonColors } from "common/enums";
import { BindingAction, IChangedGame } from "common/models";
import styles from "./styles.module.scss";

interface Props {
  isEnterScores: boolean;
  isFullScreen: boolean;
  savingInProgress: boolean;
  onChangeView: (flag: boolean) => void;
  onLeavePage: BindingAction;
  onSaveDraft: BindingAction;
  changedGames?: IChangedGame[];
}

const Navigation = ({
  isEnterScores,
  savingInProgress,
  isFullScreen,
  onChangeView,
  onLeavePage,
  onSaveDraft,
  changedGames,
}: Props) => {
  const onFalseView = () => onChangeView(false);
  const onTrueView = () => onChangeView(true);

  return (
    <div className={styles.navWrapper}>
      <p className={styles.btnsViewWrapper}>
        <span className={styles.btnWrapper}>
          <Button
            onClick={onFalseView}
            type={
              isEnterScores ? ButtonTypes.SQUARED_OUTLINED : ButtonTypes.SQUARED
            }
            variant={ButtonVariant.CONTAINED}
            color={ButtonColors.PRIMARY}
            label="View Only"
          />
        </span>
        <Button
          onClick={onTrueView}
          type={
            isEnterScores ? ButtonTypes.SQUARED : ButtonTypes.SQUARED_OUTLINED
          }
          variant={ButtonVariant.CONTAINED}
          color={ButtonColors.PRIMARY}
          label="Enter Scores"
        />
      </p>
      {changedGames && changedGames.length > 0 && (
        <p className={styles.changedGames}>
          # of Updated Games: {changedGames.length}
        </p>
      )}
      <p className={styles.btnsSaveWrapper}>
        {savingInProgress && (
          <Loader
            size={30}
            styles={{
              padding: "6px 25px",
            }}
          />
        )}
        {!savingInProgress && !isFullScreen && (
          <span className={styles.btnWrapper}>
            <Button
              onClick={onLeavePage}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              label="Close"
            />
            <FabButton
              onClick={onLeavePage}
              sequence={1}
              label="Cancel"
              variant="outlined"
            />
          </span>
        )}
        {!savingInProgress && (
          <span className={styles.btnWrapper}>
            <Button
              onClick={onSaveDraft}
              variant={ButtonVariant.CONTAINED}
              color={ButtonColors.PRIMARY}
              label="Save"
            />
            <FabButton
              onClick={onSaveDraft}
              sequence={2}
              label="Save"
              variant="contained"
            />
          </span>
        )}
      </p>
    </div>
  );
};
export default Navigation;
