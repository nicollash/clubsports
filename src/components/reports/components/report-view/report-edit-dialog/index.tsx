import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export interface ReportEditDialogProps {
  title: string;
  open: boolean;
  initialReportName?: string;
  initialGroupName?: string;
  handleSave: (reportName?: string, groupName?: string) => void;
  handleCancel: () => void;
}

const ReportEditDialog: React.SFC<ReportEditDialogProps> = ({
  open,
  title,
  initialReportName,
  initialGroupName,
  handleSave,
  handleCancel,
}) => {
  const [reportName, setReportName] = useState(initialReportName);
  const [groupName, setGroupName] = useState(initialGroupName);

  const saveHanlder = () => {
    handleSave(reportName, groupName);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleCancel}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>{title}</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            Enter a name for a new report below.
          </DialogContentText> */}
          <TextField
            autoFocus
            margin='dense'
            label='Alternative Division Name'
            fullWidth
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
          <TextField
            autoFocus
            margin='dense'
            label='Report Name'
            fullWidth
            value={reportName}
            onChange={e => setReportName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color='primary'>
            Cancel
          </Button>
          <Button onClick={saveHanlder} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ReportEditDialog;
