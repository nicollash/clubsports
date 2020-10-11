import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import { TooltipMessageTypes } from './types';

interface Props {
  disabled?: boolean;
  children: React.ReactElement;
  title: string;
  type: string;
}

const TooltipWrapped = withStyles({
  arrow: {
    color: '#F4F4F4',
  },
  tooltip: {
    maxWidth: 325,
    padding: '18px',
    color: '#6A6A6A',
    fontSize: 16,
    lineHeight: '22px',
    border: '1px solid #dadde9',
    backgroundColor: '#F4F4F4',
    boxShadow: '0 1px 10px 0 rgba(0,0,0,0.2)',
  },
})(Tooltip);

const getTooltipColor = (type: string) => {
  switch (type) {
    case TooltipMessageTypes.INFO:
      return 'inherit';
    case TooltipMessageTypes.WARNING:
      return '#FF0F19';
  }

  return 'inherit';
};

const TooltipMessage = ({ disabled, children, title, type }: Props) => (
  <TooltipWrapped
    disableHoverListener={disabled}
    title={<span style={{ color: getTooltipColor(type) }}>{title}</span>}
    arrow
  >
    {children}
  </TooltipWrapped>
);

export default TooltipMessage;
