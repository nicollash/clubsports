import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { styles } from './styles';
import { getGamesCountForDay } from "../../../helpers";

const EVEN_COLOR = '#DCDCDC';

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
  splitIdx: number;
}

const RowTeamSlot =({
  dateGames,
  teamName,
  odd,
  days,
  teamDetails,
  splitIdx
}: TeamProps) => {
  let withinPool = 0;
  let outsidePool = 0;
  let total = 0;    
  console.log(`${teamName} splitIdx =>`, splitIdx);
  const viewGames = () => {
    return dateGames.map((dateItem: any, index) => {
      let rowsView: any[] = [];
      const dateKey = Object.keys(dateItem)[0];
      const gamesCountForDay = getGamesCountForDay(teamDetails, days[index]);
      if (days[index] !== dateKey) {
        const emptyGameNames = [...Array(gamesCountForDay).keys()];
        const emptySubRow =  emptyGameNames.map(index => {
          return <View style={{flexDirection: 'column'}} key={index}>
                  <Text style={styles.teamGame} ></Text> 
                </View>
        })
        rowsView.push(emptySubRow);
      } else {
        const subRowDateGames =  dateItem[dateKey].map((timeItem: any) => {
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
        
        rowsView.push(subRowDateGames);
        const emptyLeftGameNames = [...Array(gamesCountForDay-dateItem[dateKey].length).keys()];
        const subRowLeftGames =  emptyLeftGameNames.map(index => {
          return <View style={{flexDirection: 'column'}} key={index}>
                  <Text style={styles.teamGame} ></Text> 
                </View>
        })
        rowsView.push(subRowLeftGames);
      }
      return rowsView;
    })
  }
  return (
    <View
      style={{
        ...styles.timeSlotRow,
        backgroundColor: odd? EVEN_COLOR: '#FFFFFF',
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

export {
  RowDivisionSlot,
  RowTeamSlot,
};
