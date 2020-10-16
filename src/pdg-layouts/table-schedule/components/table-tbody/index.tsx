import React from "react";
import { View } from "@react-pdf/renderer";
import RowTimeSlot from "../row-time-slot";
import ITimeSlot from "common/models/schedule/timeSlots";
import { IGame } from "components/common/matrix-table/helper";
import { selectProperGamesPerTimeSlot } from "components/common/matrix-table/helper";
import { DEFAULT_COLUMNS_COUNT } from "../../common";
import { ITeamCard } from "common/models/schedule/teams";
import { IPool } from "common/models";

interface Props {
  timeSlots: ITimeSlot[];
  games: IGame[];
  teamCards: ITeamCard[];
  splitIdx: number;
  isHeatMap?: boolean;
  byPool?: boolean;
  pools?: IPool[];
}

const TableTbody = ({
  timeSlots,
  games,
  teamCards,
  splitIdx,
  isHeatMap,
  byPool,
  pools,
}: Props) => {
  const timeSlotsWithGames = timeSlots.map((timeSlot, idx) => {
    const gamesPerTimeSlot = selectProperGamesPerTimeSlot(
      timeSlot,
      games
    ).slice(splitIdx, splitIdx + DEFAULT_COLUMNS_COUNT);

    return (
      <RowTimeSlot
        games={gamesPerTimeSlot}
        teamCards={teamCards}
        timeSlot={timeSlot}
        isEven={(idx + 1) % 2 === 0}
        isHeatMap={isHeatMap}
        key={timeSlot.id}
        byPool={byPool}
        pools={pools}
      />
    );
  });

  return <View>{timeSlotsWithGames}</View>;
};

export default TableTbody;
