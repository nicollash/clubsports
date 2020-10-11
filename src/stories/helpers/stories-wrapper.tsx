import React from 'react';
import styles from './styles.module.scss'

interface Props {
  children: React.ReactElement
}

const storiesWrapper = ({ children }: Props) => (
  <div className={styles.wrapper}>
    {children}
  </div>
)

export default storiesWrapper
