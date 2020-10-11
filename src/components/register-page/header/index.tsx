import React from 'react';
import { Link } from 'react-router-dom';
import logo from 'assets/logo.png';
import styles from './styles.module.scss';

const Header = () => (
  <header className={styles.header}>
    <div className={styles.headerWrapper}>
      <p className={styles.headerLogoWrapper}>
        <Link to="/register">
          <img src={logo} width="157" height="122" alt="Tourneymaster logo" />
        </Link>
      </p>
    </div>
  </header>
);

export default Header;
