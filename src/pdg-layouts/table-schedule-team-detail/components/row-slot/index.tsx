import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { formatTimeSlot } from 'helpers';
import ITimeSlot from 'common/models/schedule/timeSlots';
import { IGame } from 'components/common/matrix-table/helper';
import { ITeamCard } from 'common/models/schedule/teams';
import { getContrastingColor } from 'components/common/matrix-table/helper';
import { styles } from './styles';
import { getDisplayName } from 'components/common/matrix-table/dnd/seed';
import { IPool } from "common/models";
import { getGamesCountForDay } from "../../../helpers";

const EVEN_COLOR = '#DCDCDC';

interface Props {
  timeSlot: ITimeSlot;
  games: IGame[];
  teamCards: ITeamCard[];
  isEven: boolean;
  isHeatMap?: boolean;
  byPool?: boolean;
  pools?: IPool[];
}

const RowTimeSlot = ({
  timeSlot,
  games,
  teamCards,
  isEven,
  isHeatMap,
  byPool,
  pools,
}: Props) => {
  const getTeamColorStyles = (hex?: string) => ({
    backgroundColor: isHeatMap ? (hex ? hex : '') : '',
    color: isHeatMap ? (hex ? getContrastingColor(hex) : "") : "#000000",
  });

  const getPoolHex = (team: ITeamCard, difTeamPoolId: string | null) => {
    const currentHex = pools && pools.find((pool) => pool.pool_id === team.poolId)?.pool_hex;
    return team.poolId === difTeamPoolId
      ? currentHex
        ? "#" + currentHex
        : "#1c315f"
      : "#ffffff";
  };

  const getTeam = (team: ITeamCard, difTeamPoolId: string | null, score: number | undefined) => (
    <View
      style={{
        ...styles.gameTeamName,
        ...getTeamColorStyles(
          byPool && pools ? getPoolHex(team, difTeamPoolId) : team.divisionHex
        ),
      }}
    >
      <View style={styles.nameWrapper}>
        <Text style={styles.teamNameWrapper}>{team.name}</Text>
        {!byPool && (
          <Text style={styles.divisionNameWrapper}>
            {`(${team.divisionShortName!})`}
          </Text>
        )}
      </View>
      <Text style={styles.score}>{score ? score : ""}</Text>
    </View>
  );

  const getBracketTeam = (
    teamName?: string,
    divisionName?: string,
    round?: number,
    dependsUpon?: number,
    seedId?: number
  ) => {
    return (
      <View
        style={{
          ...styles.gameTeamName,
          backgroundColor: isHeatMap ? '#D9D9D9' : '',
        }}
      >
        {teamName ? (
          <>
            <Text style={styles.teamNameWrapper}>{teamName}</Text>
            {divisionName && (
              <Text style={styles.divisionNameWrapper}>
                {`(${divisionName})`}
              </Text>
            )}
          </>
        ) : seedId ? (
          <>
            <Text style={styles.teamNameWrapper}>{`Seed ${seedId}`}</Text>
            {divisionName && (
              <Text style={styles.divisionNameWrapper}>
                {`(${divisionName})`}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.teamNameWrapper}>
            {getDisplayName(round, dependsUpon)}
          </Text>
        )}
      </View>
    );
  };

  const getBracketGame = (game: IGame) => {
    const {
      awaySeedId,
      homeSeedId,
      playoffRound,
      divisionName,
      awayDependsUpon,
      homeDependsUpon,
    } = game;

    const awayTeamName = teamCards.find(item => item.id === game.awayTeamId)
      ?.name;
    const homeTeamName = teamCards.find(item => item.id === game.homeTeamId)
      ?.name;

    return (
      <View style={styles.wrapper}>
        <View style={styles.gameWrapper} key={game.id}>
          {getBracketTeam(
            awayTeamName,
            divisionName,
            playoffRound,
            awayDependsUpon,
            awaySeedId
          )}
          {getBracketTeam(
            homeTeamName,
            divisionName,
            playoffRound,
            homeDependsUpon,
            homeSeedId
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        ...styles.timeSlotRow,
        backgroundColor: !isHeatMap && isEven ? EVEN_COLOR : '',
      }}
      wrap={false}
    >
      <Text style={styles.timeSlot}>{formatTimeSlot(timeSlot.time)}</Text>
      {games.map((game, idx) => {
        const isBracketGame =
          !game.awayTeam &&
          (game.awaySeedId || game.awayDependsUpon) &&
          game.bracketGameId;

        if (isBracketGame) {
          return getBracketGame(game);
        }
        return (
          <View style={styles.wrapper} key={idx}>
            <View style={styles.gameWrapper} key={game.id}>
              {game.awayTeam && game.homeTeam ? (
                <>
                  {getTeam(game.awayTeam, game.homeTeam.poolId, game.awayTeamScore)}
                  {getTeam(game.homeTeam, game.awayTeam.poolId, game.homeTeamScore)}
                </>
              ) : (
                <Text />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

interface DivisionProps {
  divisionName: string;
}
const RowDivisionSlot =({
  divisionName,
}: DivisionProps) => {
  return (
    <View
      style={{
        ...styles.timeSlotRow,
        
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
}

const RowTeamSlot =({
  dateGames,
  teamName,
  odd,
  days,
  teamDetails,
}: TeamProps) => {
  let withinPool = 0;
  let outsidePool = 0;
  let total = 0;    
  const viewGames = () => {
    let count = 0
    return dateGames.map((dateItem: any) => {
      // console.log(`${teamName} dateItem =>`, dateItem);
      const dateKey = Object.keys(dateItem)[0];
      if (days[count] !== dateKey) {
        const gamesCountForDay = getGamesCountForDay(teamDetails, dateKey);
        const emptyGameNames = [...Array(gamesCountForDay).keys()];
        return emptyGameNames.map(index => {
          return <View style={{flexDirection: 'column'}} key={index}>
                  <Text style={styles.teamGame} ></Text> 
                </View>
        })
      }
      return dateItem[dateKey].map((timeItem: any) => {
        const timeKey = Object.keys(timeItem)[0];
        const fieldKey = Object.keys(timeItem[timeKey])[0];
        return timeItem[timeKey][fieldKey].map((detail: any) => {
          
          withinPool = detail.within_pool_game_count;
          outsidePool = detail.outside_pool_game_count;
          if(withinPool !== null && withinPool !== null) total = withinPool + outsidePool;
          return (
            <View style={{flexDirection: 'column'}}>
              <Text style={styles.teamGame} > {detail.opponent_team_name} {detail.field} {detail.facility}</Text> 
            </View>
          )
        })
      })
      count ++;
    })
  }
  return (
    <View
      style={{
        ...styles.timeSlotRow,
        backgroundColor: odd? '#DCDCDC': '#FFFFFF',
      }}
      wrap={false}
    >
      <Text style={styles.teamSlot}>{teamName}</Text>
      <View style={styles.teamCountSlot}>  
        <Text style={styles.teamCountCell}>{withinPool}</Text>
        <Text style={styles.teamCountCell}>{outsidePool}</Text>
        <Text style={styles.teamCountCell}>{total}</Text>
      </View>  
      {viewGames()}    
    </View>
  );
};

export default RowTimeSlot;
export {
  RowDivisionSlot,
  RowTeamSlot,
};
