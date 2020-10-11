import React from 'react';
import styles from './style.module.scss';
import { BindingCbWithOne } from 'common/models';

interface IInfoCard {
  icon: JSX.Element;
  info: string;
  order: number;
  changeOrder: BindingCbWithOne<number>;
}

const InfoCard = ({ icon, info, order, changeOrder }: IInfoCard) => {
  const onCardClick = () => {
    changeOrder(order);
  };

  return (
    <div className={styles.dashboardCard} onClick={onCardClick}>
      {icon}
      <p className={styles.cardContent}>{info}</p>
    </div>
  );
};

export default InfoCard;
