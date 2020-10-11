import React from 'react';
import { CircularProgress } from '@material-ui/core';

const LOADER_DEFAULT_STYLES = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  padding: '15px',
};

const LOADER_BUTTON_STYLES = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

interface Props {
  styles?: object;
  value?: number;
  size?: number;
}

const Loader = ({ styles, value, size }: Props) => (
  <div style={{ ...LOADER_DEFAULT_STYLES, ...styles }}>
    <CircularProgress
      variant={value ? "static" : "indeterminate"}
      value={value}
      size={size}
    />
  </div>
);

export const LoaderButton = ({ styles, value, size }: Props) => (
  <div style={{ ...LOADER_BUTTON_STYLES, ...styles }}>
    <CircularProgress
      variant={value ? "static" : "indeterminate"}
      value={value}
      size={size}
    />
  </div>
);

export default Loader;
