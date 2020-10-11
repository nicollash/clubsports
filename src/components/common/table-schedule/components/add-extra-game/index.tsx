import React from 'react';
import Button from 'components/common/buttons/button';
import { useDrag } from 'react-dnd';
import { GameType } from 'components/common/matrix-table/dnd/drop';
import { MatrixTableDropEnum } from 'components/common/matrix-table/dnd/drop';

interface IProps {
    extraGameType: GameType.allstar | GameType.practice;
}

const AddExtraGame = (props: IProps) => {
  const [,drag] = useDrag({
    item: {
      type: MatrixTableDropEnum.ExtraGameDrop,
      extraGameType: props.extraGameType,
    },
    // canDrag: true,
    // collect: monitor => ({
    //     isDragging: !!monitor.isDragging(),
    //   }),
  });

  const getGameTypeLabel = () => {
    switch(props.extraGameType) {
      case GameType.allstar:
        return "Add All-Stars Games";
      case GameType.practice:
        return "Add Practice Games";
    };
  };

  return (
      <div ref={drag}>
        <Button 
        btnStyles={{
          backgroundColor: '#1C315F',
          color: '#fff',
          maxHeight: '50px',
          fontSize: '14px',
        }}
        label={getGameTypeLabel()}
        color="primary"
        variant="text"
        />
      </div>
  );
}

export default AddExtraGame;