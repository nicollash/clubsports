import React from 'react';
import { CircularProgress } from '@material-ui/core';
import styles from './style.module.scss';

const LoadingWrapper = () => (
  <div className={styles.wrapper}>
    <h2 className="visually-hidden">Loading...</h2>
    <CircularProgress />
  </div>
);

export default LoadingWrapper;
