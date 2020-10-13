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
        backgroundColor: '#DCDCDC',
      }}
      wrap={false}
    >
      <Text style={styles.timeSlot}>{divisionName}</Text>      
    </View>
  );
};


interface TeamProps {
  divisionName: string;
}

const RowTeamSlot =({
  divisionName,
}: TeamProps) => {
  return (
    <View
      style={{
        ...styles.timeSlotRow,
        backgroundColor: '#DCDCDC',
      }}
      wrap={false}
    >
      <Text style={styles.timeSlot}>{divisionName}</Text>      
    </View>
  );
};

export default RowTimeSlot;
export {
  RowDivisionSlot,
  RowTeamSlot,
};
