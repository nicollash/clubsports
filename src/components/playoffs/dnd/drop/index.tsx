import React from 'react';
import { useDrop } from 'react-dnd';
import styles from './styles.module.scss';

export interface IBracketDrop {
  id: number;
  seedId: number;
  position: number;
}

interface IProps {
  id: number;
  type: string;
  position: 1 | 2;
  placeholder?: string;
  children?: React.ReactElement;
  onDrop: (dropParams: IBracketDrop) => void;
}

const SeedDrop = (props: IProps) => {
  const { id, type, onDrop, position, children, placeholder } = props;

  const [{ isOver }, drop] = useDrop({
    accept: type,
    drop: (item: any) => {
      onDrop({
        id,
        position,
        seedId: item.id,
      });
    },
    collect: mon => ({
      isOver: !!mon.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{ opacity: isOver ? 0.5 : 1 }}
      className={styles.container}
    >
      {children ||
        (placeholder && <p className={styles.placeholder}>{placeholder}</p>)}
    </div>
  );
};

export default SeedDrop;
