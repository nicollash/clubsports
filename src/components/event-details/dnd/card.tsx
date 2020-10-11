import React, { useRef } from 'react';
import { DropTargetMonitor, useDrop, XYCoord, useDrag } from 'react-dnd';
import styles from './styles.module.scss';

interface Props {
  cardName: string;
  index: number;
  id: number;
  text: string;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const DndCard: React.FC<Props> = ({ cardName, index, id, text, moveCard }) => {
  const ref = useRef<HTMLDivElement>(null);
  const CARD = cardName;

  const [, drop] = useDrop({
    accept: CARD,
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
    item: { type: CARD, id, index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  drag(drop(ref));

  return (
    <div ref={ref} className={styles.cardContainer} style={{ opacity }}>
      <span className={styles.cardIndex}>{index + 1}.</span>
      {text}
    </div>
  );
};

export default DndCard;
