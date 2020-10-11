import React from 'react';
import { Typography } from '@material-ui/core';
import styles from './styles.module.scss';

interface Props {
  children?: string;
  margin?: string;
}

const HeadeingLevelTwo = ({ children, margin }: Props) => (
  <Typography className={styles.heading} style={{ margin }} component='h2'>
    {children}
  </Typography>
);

export default HeadeingLevelTwo;
