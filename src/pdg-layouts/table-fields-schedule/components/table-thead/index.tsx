import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { IField } from 'common/models/schedule/fields';
import { styles } from './styles';

interface Props {
  field: IField;
}

const TableThead = ({ field }: Props) => (
  <>
    <View style={styles.thead}>
      <Text style={styles.theadName}>{field.name}</Text>
      <View style={styles.theadWrapper}>
        <View style={styles.gameDetailsWrapper}>
          <View style={styles.gameDetails}>
            <Text>Game Details</Text>
          </View>
          <View style={styles.teamsWrapper}>
            <Text style={styles.team}>Away Team</Text>
            <Text style={styles.team}>Home Team</Text>
          </View>
        </View>
        <View style={styles.scoresWrapper}>
          <View style={styles.scores}>
            <Text>Final Scores</Text>
          </View>
          <View style={styles.scoresTeamsWrapper}>
            <Text style={styles.scoresTeam}>Away</Text>
            <Text style={styles.scoresTeam}>Home</Text>
          </View>
        </View>
        <Text style={styles.initials}>Initials</Text>
      </View>
    </View>
  </>
);

export default TableThead;
