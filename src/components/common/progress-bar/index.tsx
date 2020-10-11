import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles, withStyles } from '@material-ui/core/styles';

interface Props {
  completed?: number | null;
  type?: string;
}

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

const LinearProgressWrapped = withStyles({
  root: {
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  bar: {
    borderRadius: 20,
    backgroundColor: '#00CC47',
  },
})(LinearProgress);

const LinearProgressWrappedLoader = withStyles({
  root: {
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  bar: {
    borderRadius: 20,
    backgroundColor: '#1c315f',
  },
})(LinearProgress);
const ProgressBar = ({ completed, type }: Props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {type === 'loader' ? (
        <LinearProgressWrappedLoader
          variant="determinate"
          value={completed || 0}
        />
      ) : (
        <LinearProgressWrapped variant="determinate" value={completed || 0} />
      )}
    </div>
  );
};

export default ProgressBar;
