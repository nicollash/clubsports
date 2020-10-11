import React from 'react';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { getLinkByApp } from 'helpers';
import UserInfo from './user-info';
import logo from 'assets/logo.png';
import styles from './style.module.scss';

const Header: React.FC<RouteComponentProps> = ({ history }) => {
  const menuItems = [
    { title: 'Home', link: '/' },
    { title: 'Event Search', link: 'https://results.tourneymaster.com' },
    {
      title: 'Registrations',
      link: getLinkByApp('register'),
    },
    { title: 'Mobile Scoring', link: getLinkByApp('mob-scoring') },
    { title: 'Support', link: 'https://www.tourneymaster.org/support/' },
    { title: 'Contact', link: 'https://www.tourneymaster.org/contact/' },
  ];

  const onLogoClick = () => {
    history.push('/');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <img
          src={logo}
          onClick={onLogoClick}
          className={styles.logo}
          alt="logo"
        />
        <div className={styles.listWrapper}>
          <ul className={styles.list}>
            {menuItems.map((item: any, index: number) => (
              <li className={styles.listItem} key={index}>
                {!item.link.includes('http') ? (
                  <Link to={item.link}>{item.title}</Link>
                ) : (
                  <a
                    href={item.link}
                    target={'_blank'}
                    rel="noopener noreferrer"
                  >
                    {item.title}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
        <UserInfo />
      </div>
    </div>
  );
};

export default withRouter(Header);
