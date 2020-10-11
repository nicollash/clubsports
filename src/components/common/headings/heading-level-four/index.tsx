import React from 'react';
import { Typography } from '@material-ui/core';
import styles from './styles.module.scss';

interface Props {
  children: React.ReactElement | string;
}

const HeadeingLevelThree = ({ children }: Props) => (
  <Typography className={styles.heading} component='h4'>
    {children}
  </Typography>
);

export default HeadeingLevelThree;
