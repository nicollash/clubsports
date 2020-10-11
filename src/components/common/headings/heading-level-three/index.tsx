import React from 'react';
import { Typography } from '@material-ui/core';
import styles from './styles.module.scss';

interface Props {
  children: React.ReactElement | string;
  color?: string;
}

const HeadeingLevelThree = ({ children, color }: Props) => (
  <Typography
    className={styles.heading}
    style={{ color: color }}
    component='span'
  >
    {children}
  </Typography>
);

export default HeadeingLevelThree;
