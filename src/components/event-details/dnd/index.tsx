import React, { useState, useCallback } from 'react';
import update from 'immutability-helper';

import Card from './card';
import styles from './styles.module.scss';

interface ICard {
  id: number;
  text: string;
}

interface IProps {
  name: string;
  cards: ICard[];
  onUpdate: (cards: any) => void;
}

const DndContainer: React.FC<IProps> = props => {
  const [cards, setCards] = useState(props.cards);

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragCard = cards[dragIndex];
      const updatedCards = update(cards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard],
        ],
      });

      setCards(updatedCards);
      props.onUpdate(updatedCards);
    },
    // eslint-disable-next-line
    [cards]
  );

  const renderCard = (card: ICard, index: number) => (
    <Card
      key={card.id}
      index={index}
      id={card.id}
      text={card.text}
      cardName={props.name}
      moveCard={moveCard}
    />
  );

  return (
    <div className={styles.dndContainer}>
      {cards.map((card: ICard, i: number) => renderCard(card, i))}
    </div>
  );
};

export default DndContainer;
