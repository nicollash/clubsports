import React, { useState } from 'react';
import { Modal, Button } from 'components/common';
import { getIcon } from 'helpers';
import { Icons } from 'common/enums';
import styles from './styles.module.scss';

export interface IModalItem {
  type: string; // 'INFO' | 'WARN';
  title: string;
}

interface IProps {
  items: IModalItem[];
  title: string;
}

export default (props: IProps) => {
  const { items, title } = props;

  const [open, setOpen] = useState(false);

  const renderItem = (item: IModalItem, index: number) => (
    <div
      key={index}
      className={`${styles.itemWrapper} ${item.type === 'INFO' &&
        styles.infoWrapper}`}
    >
      <span>{getIcon(item.type === 'INFO' ? Icons.INFO : Icons.WARNING)}</span>
      {item.title}
    </div>
  );

  return (
    <div className={styles.container}>
      <Button
        btnStyles={{ color: '#dc4f4f', marginTop: '-4px' }}
        label={getIcon(Icons.ERROR)}
        variant="text"
        color="default"
        onClick={() => setOpen(open => !open)}
      />
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <div className={styles.modalContainer}>
          <div>
            <h4 className={styles.title}>{title}</h4>
          </div>
          {items.map((item, index) => renderItem(item, index))}

          <div className={styles.btnsWrapper}>
            <Button
              label="Ok"
              variant="contained"
              color="primary"
              onClick={() => setOpen(false)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
