import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const ExpansionPanelWrapped = withStyles({
  root: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 0,
    boxShadow: 'none',
    marginBottom: '2px!important',
    '&:not(:last-child)': {
      borderBottom: 2,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {
    marginBottom: 2,
  },
})(ExpansionPanel);

const ExpansionPanelSummaryWrapped = withStyles({
  root: {
    padding: 0,
    marginBottom: -1,
    minHeight: 48,
    '&$expanded': {
      minHeight: 48,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(ExpansionPanelSummary);

const ExpansionPanelDetailsWrapper = withStyles({
  root: {
    padding: '5px 0 10px 24px',
  },
})(ExpansionPanelDetails);

export {
  ExpansionPanelWrapped,
  ExpansionPanelSummaryWrapped,
  ExpansionPanelDetailsWrapper,
};
