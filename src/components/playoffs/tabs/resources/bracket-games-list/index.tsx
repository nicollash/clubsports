import React from "react";
import { useDrop } from "react-dnd";
import { IBracketGame } from "components/playoffs/bracketGames";
import { orderBy } from "lodash-es";
import { MatrixTableDropEnum } from "components/common/matrix-table/dnd/drop";
import BracketGameCard from "components/playoffs/dnd/bracket-game";
import CustomBracketGameCard from "components/playoffs/dnd/custom-bracket-game";
import { IDivision, IPool } from "common/models";
import { IGame } from "components/common/matrix-table/helper";
import styles from "./styles.module.scss";
import { ITeamCard } from "../../../../../common/models/schedule/teams";

interface IProps {
  isCustomMode: number | null;
  acceptType: string;
  bracketGames: IBracketGame[];
  divisions: IDivision[];
  pools?: IPool[];
  teamCards?: ITeamCard[];
  filteredGames: IGame[];
  onDrop: (dropParams: any) => void;
  setHighlightedGame: (gameId: number) => void;
}

export default (props: IProps) => {
  const { isCustomMode, bracketGames, acceptType, pools, teamCards } = props;
  const [{ isOver }, drop] = useDrop({
    accept: acceptType,
    drop: (item: any) => {
      props.onDrop({
        teamId: item.id,
        gameId: undefined,
      });
    },
    collect: (mon) => ({
      isOver: !!mon.isOver(),
    }),
  });

  const mapPoolsToBracketGames = () => {
    return bracketGames?.map((bg: IBracketGame) =>
      bg.poolId
        ? {
            ...bg,
            poolName: pools?.find((p: IPool) => p.pool_id === bg.poolId)
              ?.pool_name,
          }
        : bg
    );
  };

  const unassignedBracketGames = mapPoolsToBracketGames()?.filter(
    (item: IBracketGame) => !item.hidden && !item.fieldId && !item.startTime
  );

  const currentBracketGames = mapPoolsToBracketGames()?.filter(
    (item: IBracketGame) => !item.hidden && item.fieldId && item.startTime
  );

  const params = ["divisionName", "poolName", "round", "index"];
  const orderedUnassignedBracketGames = orderBy(unassignedBracketGames, params);

  const orderedBracketGames = orderBy(currentBracketGames, params);

  const renderGame = (bracketGame: IBracketGame, index: number) => {
    const divisionHex = props.divisions.find(
      (item: IDivision) => item.division_id === bracketGame.divisionId
    )?.division_hex;
    const poolHex = props.pools?.find(
      (item: IPool) => item.pool_id === bracketGame.poolId
    )?.pool_hex;
    const poolName = props.pools?.find(
      (item: IPool) => item.pool_id === bracketGame.poolId
    )?.pool_name;
    const game = props.filteredGames.find(
      (item) =>
        item.fieldId === bracketGame.fieldId &&
        item.startTime === bracketGame.startTime
    );

    if (isCustomMode) {
      return (
        <CustomBracketGameCard
          key={`${index}-renderGame`}
          game={bracketGame}
          gameSlotId={game?.id}
          divisionHex={divisionHex!}
          poolHex={poolHex!}
          poolName={poolName!}
          teamCards={teamCards!}
          type={MatrixTableDropEnum.BracketDrop}
          setHighlightedGame={props.setHighlightedGame}
        />
      );
    }

    return (
      <BracketGameCard
        key={`${index}-renderGame`}
        game={bracketGame}
        gameSlotId={game?.id}
        divisionHex={divisionHex!}
        poolHex={poolHex!}
        poolName={poolName!}
        type={MatrixTableDropEnum.BracketDrop}
        setHighlightedGame={props.setHighlightedGame}
      />
    );
  };

  return (
    <div ref={drop} style={{ opacity: isOver ? 0.8 : 1 }}>
      {!!orderedUnassignedBracketGames?.length && (
        <>
          <div className={styles.gamesTitle}>Unassigned Games</div>
          {orderedUnassignedBracketGames?.map((v, i) => renderGame(v, i))}
        </>
      )}
      {!!orderedBracketGames?.length && (
        <>
          <div className={styles.separationLine}>Assigned Games</div>
          {orderedBracketGames?.map((v, i) => renderGame(v, i))}
        </>
      )}
    </div>
  );
};
