import React from 'react';
import styles from './styles.module.scss';
import logo from 'assets/logo.png';
import history from '../../browserhistory';
import PlaceIcon from '@material-ui/icons/Place';
import EmailIcon from '@material-ui/icons/Email';
import PhoneIcon from '@material-ui/icons/Phone';

const Footer: React.FC = () => {
  const onLogoClick = () => {
    history.push('/');
  };

  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerCenter}>
        <div className={styles.logoContainer}>
          <ul className={styles.footerLinks}>
            <li>
              <a href="https://www.tourneymaster.org/privacy-policy/">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="https://www.tourneymaster.org/terms-of-service/">
                Terms of Service
              </a>
            </li>
          </ul>
          <img
            src={logo}
            onClick={onLogoClick}
            className={styles.logo}
            alt="logo"
          />
          <ul className={styles.footerLinksRight}>
            <li>
              <a href="https://www.tourneymaster.org/support/">Support</a>
            </li>
            <li>
              <a href="https://www.tourneymaster.org/about/">About</a>
            </li>
          </ul>
        </div>
        <div className={styles.line} />
        <div className={styles.addressInfoContainer}>
          <div className={styles.footerWithIcon}>
            <PlaceIcon />
            <p style={{ textAlign: 'center' }}>
              One World Trade Center, Suite 8500, New York NY 10007
            </p>
          </div>

          <div className={styles.footerWithIcon}>
            <PhoneIcon />
            <p>+1.212.377.7020</p>
          </div>

          <div className={styles.footerWithIcon}>
            <EmailIcon />
            <p>info@tourneymaster.com</p>
          </div>
        </div>
        <p className={styles.footerCopyright}>Tourney Master &copy; 2020</p>
      </div>
    </footer>
  );
};

export default Footer;
