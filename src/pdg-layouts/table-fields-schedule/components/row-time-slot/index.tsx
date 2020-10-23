import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { formatTimeSlot } from 'helpers';
import ITimeSlot from 'common/models/schedule/timeSlots';
import { IGame } from 'components/common/matrix-table/helper';
import { ITeamCard } from 'common/models/schedule/teams';
import { styles } from './styles';
import { getDisplayName } from 'components/common/matrix-table/dnd/seed';

const EVEN_COLOR = '#DCDCDC';

interface Props {
  timeSlot: ITimeSlot;
  games: IGame[];
  isEven: boolean;
  isRequaredSmsScoring: boolean;
  teamCards?: ITeamCard[];
}

const RowTimeSlot = ({
  timeSlot,
  games,
  isEven,
  isRequaredSmsScoring,
  teamCards,
}: Props) => {
  const formatPhoneNumber = (phoneNumberString: string) => {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      const intlCode = match[1] ? '+1 ' : '';
      return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
    }
    return phoneNumberString;
  };

  const getTeam = (team: ITeamCard) => (
    <View style={styles.team}>
      <Text style={styles.teamName}>
        {`${team.name} (${team.divisionShortName})`}
      </Text>
      <Text style={styles.coachName}>
        {team.contactFirstName
          ? `${team.contactFirstName} ${team.contactLastName || ''}`
          : ''}
      </Text>
      <Text style={styles.teamNum}>
        {team.teamPhoneNum ? `${formatPhoneNumber(team.teamPhoneNum)}` : ""}
      </Text>
    </View>
  );
  const getBracketTeam = (
    teamName?: string,
    divisionName?: string,
    round?: number,
    dependsUpon?: number,
    seedId?: number,
    displayName?: string
  ) => {
    return (
      <>
        {teamName || displayName ? (
          <>
            <Text style={styles.teamName}>
              {teamName || displayName}
            </Text>
            {divisionName && !displayName && (
              <Text style={styles.divisionNameWrapper}>
                {`(${divisionName})`}
              </Text>
            )}
          </>
        ) : seedId ? (
          <>
            <Text style={styles.teamName}>{`Seed ${seedId}`}</Text>
            {divisionName && (
              <Text style={styles.divisionNameWrapper}>
                {`(${divisionName})`}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.teamName}>
            {getDisplayName(round, dependsUpon)}
          </Text>
        )}
      </>
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
      awayDisplayName,
      homeDisplayName,
    } = game;

    const awayTeamName = teamCards?.find((item) => item.id === game.awayTeamId)
      ?.name;
    const homeTeamName = teamCards?.find((item) => item.id === game.homeTeamId)
      ?.name;

    return (
      <>
        <View style={styles.team} key={`away ${game.id}`}>
          {getBracketTeam(
            awayTeamName,
            divisionName,
            playoffRound,
            awayDependsUpon,
            awaySeedId,
            awayDisplayName
          )}
        </View>
        <View style={styles.team} key={`home ${game.id}`}>
          {getBracketTeam(
            homeTeamName,
            divisionName,
            playoffRound,
            homeDependsUpon,
            homeSeedId,
            homeDisplayName
          )}
        </View>
      </>
    );
  };

  return (
    <View
      style={{
        ...styles.rowTimeSlot,
        backgroundColor: isEven ? EVEN_COLOR : '',
      }}
    >
      <View style={styles.timeGameWrapper}>
        <Text style={styles.timeSlot}>{formatTimeSlot(timeSlot.time)}</Text>
        {isRequaredSmsScoring && (
          <Text style={styles.gameIdSlot}>{games[0]?.bracketGameId ? games[0]?.bracketGameId : games[0].varcharId}</Text>
        )}
      </View>
      {games.map(game => {
        const isBracketGame =
          !game.awayTeam &&
          (game.awaySeedId || game.awayDependsUpon || game.awaySourceType) &&
          game.bracketGameId;

        if (isBracketGame) {
          return (
            <View style={styles.gamesWrapper} key={game.id}>
              {getBracketGame(game)}
            </View>
          )
        }
        return (
          <View style={styles.gamesWrapper} key={game.id}>
            {game.awayTeam?.name && game.homeTeam?.name && (
              <>
                {getTeam(game.awayTeam)}
                {getTeam(game.homeTeam)}
              </>
            )}
          </View>
        )
      }
      )}
      <View style={styles.scoresWrapper}>
        <View style={styles.scoresContainer} >
          <Text style={styles.scores}>{games.map(game => game.awayTeamScore ? game.awayTeamScore : "")}</Text>
        </View>
        <Text style={styles.scoresColon}>:</Text>
        <View style={styles.scoresContainer}>
          <Text style={styles.scores}>{games.map(game => game.homeTeamScore ? game.homeTeamScore : "")}</Text>
        </View>
      </View>
      <View style={styles.initials} />
    </View>
  );
};

export default RowTimeSlot;
