import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { formatTimeSlot } from "helpers";
import { styles } from "./styles";
import { getGamesCountForDay } from "../../../helpers";

const EVEN_COLOR = "#DCDCDC";

interface DivisionProps {
  divisionName: string;
}
const RowDivisionSlot = ({ divisionName }: DivisionProps) => {
  return (
    <View
      style={{
        ...styles.gameSlotRow,
      }}
      wrap={false}
    >
      <Text style={styles.divisionSlot}>{divisionName}</Text>
    </View>
  );
};

interface TeamProps {
  dateGames: any[];
  teamName: string;
  odd: boolean;
  days: string[];
  teamDetails: any[];
  splitIdx: number;
}

const RowTeamSlot = ({
  dateGames,
  teamName,
  odd,
  days,
  teamDetails,
  splitIdx,
}: TeamProps) => {
  let withinPool = 0;
  let outsidePool = 0;
  let total = 0;

  const viewGames = () => {
    const gamesRow = dateGames.map((dateItem: any) => {
      let rowsView: any[] = [];
      const dateKey = Object.keys(dateItem)[0];
      const dateIdx = days.find((day) => day === dateKey);
      if (dateIdx === null) {
        const gamesCountForDay = getGamesCountForDay(teamDetails, dateKey);
        const emptyGameNames = [...Array(gamesCountForDay).keys()];
        const emptySubRow = emptyGameNames.map((index) => {
          return (
            <View style={{ flexDirection: "column" }} key={index}>
              <Text style={styles.teamGame}></Text>
            </View>
          );
        });
        rowsView.push(emptySubRow);
      } else {
        const gamesCountForDay = getGamesCountForDay(teamDetails, dateKey);
        const subRowDateGames = dateItem[dateKey].map((timeItem: any) => {
          const timeKey = Object.keys(timeItem)[0];
          const fieldKey = Object.keys(timeItem[timeKey])[0];
          return timeItem[timeKey][fieldKey].map((detail: any) => {
            if (detail.within_pool_game_count !== null)
              withinPool = detail.within_pool_game_count;
            if (detail.outside_pool_game_count !== null)
              outsidePool = detail.outside_pool_game_count;
            return (
              <View style={{ flexDirection: "column" }}>
                <Text style={styles.teamGame}>{detail.opponent_team_name}</Text>

                <Text style={styles.teamGame}>
                  {formatTimeSlot(detail.game_time)} {detail.field}
                </Text>
              </View>
            );
          });
        });

        rowsView.push(subRowDateGames);
        const emptyLeftGameNames = [
          ...Array(gamesCountForDay - dateItem[dateKey].length).keys(),
        ];
        const subRowLeftGames = emptyLeftGameNames.map((index) => {
          return (
            <View style={{ flexDirection: "column" }} key={index}>
              <Text style={styles.teamGame}></Text>
            </View>
          );
        });
        rowsView.push(subRowLeftGames);
      }
      return rowsView;
    });
    total = withinPool + outsidePool;
    return gamesRow;
  };
  const games = viewGames();
  return (
    <View
      style={{
        ...styles.gameSlotRow,
        backgroundColor: odd ? EVEN_COLOR : "#FFFFFF",
      }}
      wrap={false}
      key={splitIdx}
    >
      <Text style={styles.teamSlot}>{teamName}</Text>
      <View style={styles.teamCountSlot}>
        <Text style={styles.teamCountCell}>{withinPool}</Text>
        <Text style={styles.teamCountCell}>{outsidePool}</Text>
        <Text style={styles.teamCountCell}>{total}</Text>
      </View>
      {games}
    </View>
  );
};

export { RowDivisionSlot, RowTeamSlot };
