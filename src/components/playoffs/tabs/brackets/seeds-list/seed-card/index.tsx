import React, { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor, XYCoord } from 'react-dnd';
import moveIcon from 'assets/moveIcon.png';
import styles from './styles.module.scss';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

interface IProps {
  id: number;
  type: string;
  index: number;
  teamName?: string;
  isReorderMode?: boolean;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

const SeedCard = (props: IProps) => {
  const { id, index, type, teamName, isReorderMode, moveCard } = props;
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: type,
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current!.getBoundingClientRect();

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();

      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveCard(dragIndex, hoverIndex);

      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { type, id, index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isReorderMode,
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`${styles.container}`}
    >
      <span className={styles.seedName}>{teamName || `Seed ${id}`}</span>
      {!!isReorderMode && (
        <div className={styles.iconWrapper}>
          <img
            src={moveIcon}
            style={{
              width: '19px',
              height: '19px',
              alignSelf: 'center',
            }}
            alt=""
          />
        </div>
      )}
    </div>
  );
};

export default SeedCard;
