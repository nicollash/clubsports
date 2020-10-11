import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Button } from 'components/common';
import { ButtonVariant, ButtonColors, ButtonFormTypes } from 'common/enums';
import { BindingAction } from 'common/models';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';

const Transition = React.forwardRef<unknown, TransitionProps>(
  function Transition(props, ref) {
    return (
      <Slide
        direction="up"
        ref={ref}
        {...props}
        children={props.children as React.ReactElement<any>}
      />
    );
  }
);

interface DeleteProps {
  opened: boolean;
  onNo: BindingAction;
  onYes: BindingAction;
}

interface RerunProps {
  opened: boolean;
  onNo: BindingAction;
  onYes: BindingAction;
}

export const DeleteComformBox = ({ opened, onNo, onYes }: DeleteProps) => {
  return (
    <div>
      <Dialog
        open={opened}
        TransitionComponent={Transition}
        keepMounted
        onClose={onNo}
        aria-labelledby="alert-dialog-slide-title"
        id="alert-dialog-box"
      >
        <DialogTitle id="alert-dialog-title">
          {'Do you want to delete this item?'}
        </DialogTitle>

        <DialogActions>
          <Button
            label="No"
            variant="text"
            onClick={onNo}
            color={ButtonColors.SECONDARY}
            btnType={ButtonFormTypes.SUBMIT}
          />
          <Button
            label="Yes"
            onClick={onYes}
            variant={ButtonVariant.CONTAINED}
            color={ButtonColors.PRIMARY}
            btnType={ButtonFormTypes.SUBMIT}
          />
        </DialogActions>
      </Dialog>
    </div>
  );
};

export const RerunComfirmBox = ({ opened, onNo, onYes }: RerunProps) => {
  return (
    <div>
      <Dialog
        open={opened}
        TransitionComponent={Transition}
        keepMounted
        onClose={onNo}
        aria-labelledby="alert-dialog-slide-title"
        id="alert-dialog-box"
      >
        <DialogTitle id="alert-dialog-title">
          {'Do you want to re-run this item?'}
        </DialogTitle>

        <DialogActions>
          <Button
            label="No"
            variant="text"
            onClick={onNo}
            color={ButtonColors.SECONDARY}
            btnType={ButtonFormTypes.SUBMIT}
          />
          <Button
            label="Yes"
            variant={ButtonVariant.CONTAINED}
            onClick={onYes}
            color={ButtonColors.PRIMARY}
            btnType={ButtonFormTypes.SUBMIT}
          />
        </DialogActions>
      </Dialog>
    </div>
  );
};
