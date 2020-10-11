import React from 'react';
import { ISchedulesGame, BindingCbWithOne } from 'common/models';
import ItemGame from '../item-game';
import styles from './styles.module.scss';
import { IMobileScoringGame } from '../common';
import { IPlayoffGame } from 'common/models/playoffs/bracket-game';

interface Props {
  gamesWithName: IMobileScoringGame[];
  originGames: ISchedulesGame[];
  originBracktGames: IPlayoffGame[];
  changeGameWithName: BindingCbWithOne<IMobileScoringGame>;
}

const TabGame = ({
  gamesWithName,
  originGames,
  originBracktGames,
  changeGameWithName,
}: Props) => {
  const sortedTeamWithNames = gamesWithName.sort(
    (a, b) =>
      (a.facilityName || '').localeCompare(b.facilityName || '', undefined, {
        numeric: true,
      }) || a.fieldName.localeCompare(b.fieldName, undefined, { numeric: true })
  );

  return (
    <ul className={styles.teamList}>
      {!sortedTeamWithNames || sortedTeamWithNames.length === 0 ? (
        <span style={{ display: 'flex', justifyContent: 'center' }}>
          {'All Games Within This Timeslot Have Scores'}
        </span>
      ) : null}
      {sortedTeamWithNames.map(gameWithName => {
        const originGame = gameWithName.isPlayoff
          ? originBracktGames.find(
              originBracktGame => originBracktGame.game_id === gameWithName.id
            )
          : originGames.find(
              originGame => originGame.game_id === gameWithName.id
            )!;

        return (
          <ItemGame
            gameWithNames={gameWithName}
            originGame={originGame!}
            changeGameWithName={changeGameWithName}
            key={gameWithName.id}
          />
        );
      })}
    </ul>
  );
};

export default TabGame;
