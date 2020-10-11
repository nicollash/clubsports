import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { formatTimeSlot } from 'helpers';
import ITimeSlot from 'common/models/schedule/timeSlots';
import { IGame } from 'components/common/matrix-table/helper';
import { ITeamCard } from 'common/models/schedule/teams';
import { styles } from './styles';

const EVEN_COLOR = '#DCDCDC';

interface Props {
  timeSlot: ITimeSlot;
  games: IGame[];
  isEven: boolean;
  isRequaredSmsScoring: boolean;
}

const RowTimeSlot = ({
  timeSlot,
  games,
  isEven,
  isRequaredSmsScoring,
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
          <Text style={styles.gameIdSlot}>{games[0]?.varcharId}</Text>
        )}
      </View>
      {games.map(game => (
        <View style={styles.gamesWrapper} key={game.id}>
          {game.awayTeam?.name && game.homeTeam?.name && (
            <>
              {getTeam(game.awayTeam)}
              {getTeam(game.homeTeam)}
            </>
          )}
        </View>
      ))}
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
