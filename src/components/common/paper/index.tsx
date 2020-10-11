import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(() => ({
  root: {
    padding: '12px',
    height: "100%",
    backgroundColor: '#F4F4F4',
    boxShadow: '0 1px 10px 0 rgba(0,0,0,0.5)',
  },
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
}));

interface IProps {
  children: any;
  sticky?: boolean;
  padding?: number;
}

const LightPaper = ({ children, sticky, padding }: IProps) => {
  const classes = useStyles();

  return (
    <Paper
      elevation={3}
      className={`${classes.root} ${sticky && classes.sticky}`}
      style={{ padding }}
    >
      {children}
    </Paper>
  );
};

export default LightPaper;
