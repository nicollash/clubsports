import React, { useState, useEffect } from 'react';
import Api from 'api/api';
import { ISchedulesGame, BindingCbWithOne } from 'common/models';
import { ButtonVariant, ButtonColors } from 'common/enums';
import { IInputEvent } from 'common/types';
import { IPlayoffGame } from 'common/models/playoffs/bracket-game';
import { Button, Toasts } from 'components/common';
import { getDisplayName } from 'components/common/matrix-table/dnd/seed';
import { IMobileScoringGame } from '../common';
import styles from './styles.module.scss';

interface Props {
  gameWithNames: IMobileScoringGame;
  originGame: ISchedulesGame | IPlayoffGame;
  changeGameWithName: BindingCbWithOne<IMobileScoringGame>;
}

enum GameScoreTypes {
  AWAY_TEAM_SCORE = 'away_team_score',
  HOME_TEAM_SCORE = 'home_team_score',
}

const ItemGame = ({ gameWithNames, originGame, changeGameWithName }: Props) => {
  const [wasSaved, changeSavedState] = useState<boolean>(
    Boolean(originGame.away_team_score && originGame.home_team_score)
  );
  const [chanedOriginGame, changeOriginGame] = useState<
    ISchedulesGame | IPlayoffGame
  >(originGame);

  const onChangeOriginTeam = ({ target }: IInputEvent) => {
    const { name, value } = target;

    changeOriginGame({ ...chanedOriginGame, [name]: value });

    changeSavedState(value.toString() === originGame[name].toString());
  };

  useEffect(() => {
    changeSavedState(
      Boolean(originGame.away_team_score && originGame.home_team_score)
    );
    changeOriginGame(originGame);
  }, [gameWithNames, originGame]);

  const onSave = async () => {
    try {
      if (gameWithNames.isPlayoff) {
        if (
          !chanedOriginGame.away_team_score ||
          !chanedOriginGame.home_team_score ||
          Number(chanedOriginGame.away_team_score) ===
            Number(chanedOriginGame.home_team_score)
        ) {
          throw new Error(
            'Bracket games score must be filled and can not have tie scores'
          );
        }
      } else {
        const updatedGame = {
          ...chanedOriginGame,
          away_team_score: chanedOriginGame.away_team_score || null,
          home_team_score: chanedOriginGame.home_team_score || null,
        } as ISchedulesGame;

        await Api.put('/schedules_details', updatedGame);
      }

      const updatedGameWithName: IMobileScoringGame = {
        ...gameWithNames,
        awayTeamScore: chanedOriginGame.away_team_score,
        homeTeamScore: chanedOriginGame.home_team_score,
      };

      await changeGameWithName(updatedGameWithName);

      changeSavedState(true);

      Toasts.successToast('Changes successfully saved.');
    } catch (err) {
      Toasts.errorToast(err.message);
    }
  };

  return (
    <li className={styles.gameWrapper}>
      <b className={styles.fieldName}>
        {gameWithNames.isPlayoff ? 'Bracket ' : ''}
        {gameWithNames.facilityName
          ? `${gameWithNames.facilityName} - ${gameWithNames.fieldName}`
          : gameWithNames.fieldName}
      </b>
      <div className={styles.teamNames}>
        <p className={styles.teamNameWrapper}>
          <span className={styles.teamName}>
            {gameWithNames.isPlayoff
              ? gameWithNames.awayTeamName
                ? gameWithNames.awayTeamName
                : gameWithNames.awaySeedId
                ? `Seed ${gameWithNames.awaySeedId}`
                : getDisplayName(
                    Number(gameWithNames.round),
                    Number(gameWithNames.awayDependsUpon)
                  )
              : gameWithNames.awayTeamName}
          </span>
          <input
            onChange={onChangeOriginTeam}
            value={chanedOriginGame?.away_team_score || ''}
            name={GameScoreTypes.AWAY_TEAM_SCORE}
            type="number"
            min="0"
          />
        </p>
        <p className={styles.teamNameWrapper}>
          <span className={styles.teamName}>
            {gameWithNames.isPlayoff
              ? gameWithNames.homeTeamName
                ? gameWithNames.homeTeamName
                : gameWithNames.homeSeedId
                ? `Seed ${gameWithNames.homeSeedId}`
                : getDisplayName(
                    Number(gameWithNames.round),
                    Number(gameWithNames.homeDependsUpon)
                  )
              : gameWithNames.homeTeamName}
          </span>
          <input
            onChange={onChangeOriginTeam}
            value={chanedOriginGame?.home_team_score || ''}
            name={GameScoreTypes.HOME_TEAM_SCORE}
            type="number"
            min="0"
          />
        </p>
      </div>
      <div className={styles.updateBtnWrapper}>
        {wasSaved ? (
          <Button
            variant={ButtonVariant.TEXT}
            color={ButtonColors.PRIMARY}
            label={'Edit'}
          />
        ) : (
          <Button
            onClick={onSave}
            variant={ButtonVariant.TEXT}
            color={ButtonColors.SECONDARY}
            label={'Save'}
          />
        )}
      </div>
    </li>
  );
};

export default ItemGame;
