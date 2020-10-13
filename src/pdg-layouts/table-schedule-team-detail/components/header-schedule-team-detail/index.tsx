import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import TMLogo from 'assets/logo.png';
import { IEventDetails, ISchedule } from 'common/models';
import { styles } from './styles';
import { DEFAULT_COLUMNS_COUNT } from '../../common';
import { getGamesCountForDay } from '../../../helpers';

interface Props {
  event: IEventDetails;
  schedule: ISchedule;
  teamDetails: any[];
  splitIdx: number;
  days: string[];
}

const HeaderSchedule = ({
  days,
  event,
  schedule,
  teamDetails,
  splitIdx,
}: Props) => {
  console.log('splitIdx ->', splitIdx) // 
  console.log('teamDetails ->', teamDetails) // 

  const currentPageStartGameIdx = splitIdx * DEFAULT_COLUMNS_COUNT;
  const currentPageEndGameIdx = (splitIdx + 1) * DEFAULT_COLUMNS_COUNT;

  const getHeaderDate = () => {
    const retView: any[] = [];
    let startGameIdx = 0;

    days.forEach((date) => {
      const gamesCount = getGamesCountForDay(teamDetails, date)
      const endGameIdx = startGameIdx + gamesCount; 
      if( startGameIdx >= currentPageStartGameIdx 
        && startGameIdx < currentPageEndGameIdx) {
          let gameCellCount = endGameIdx - startGameIdx;

          if (gameCellCount > DEFAULT_COLUMNS_COUNT) gameCellCount = DEFAULT_COLUMNS_COUNT;
          startGameIdx += gameCellCount;
          const gameWidth = gameCellCount * 80 + gameCellCount;
          const gameNames = [...Array(gameCellCount).keys()];
          retView.push(
            <View style={styles.mainHeaderGameDate}>
              <View 
                style={{
                  ...styles.mainHeaderDateWrapper,
                  width: gameWidth
                }}
                >
                <Text style={styles.mainHeaderCell}>{`${date}`}</Text>
              </View> 
              <View style={styles.mainHeaderGameWrapper}>
                { 
                  gameNames.map((index) =>{                    
                    return (
                    <View style={styles.mainHeaderGameCellWrapper}>
                      <Text style={styles.mainHeaderNameCell}>{`Game ${index}`}</Text>
                    </View>
                    )
                  })
                }
              </View> 
          </View> 
          ) 
      }
    })
    return retView;
  }
  return (
  <View style={styles.header} fixed>
    <View style={styles.headerWrapper}>
      <>
        <Text style={styles.eventName}>
            {`<<Title>>`} Team Game List.
        </Text>
        <Text style={styles.scheduleName}>
          Event : {`${event.event_name}`},
          Start Date : {`${event.event_startdate}`},
          Schedule : {`${schedule.schedule_name}`}
        </Text>

        <View style={styles.mainHeaderWrapper}>
          <View style={styles.mainHeaderDivisionWrapper}>
            <Text style={styles.mainHeaderCell}>Division</Text>
            <Text style={styles.mainHeaderNameCell}>Division Name</Text>
          </View>
          <View style={styles.mainHeaderCountsWrapper}>
            <Text style={styles.mainHeaderCell}>Game Counts:</Text>
            <View style={styles.mainHeaderCountsIndividualWrapper}>              
              <Text style={styles.mainHeaderNameCell}>Within Pool</Text>
              <Text style={styles.mainHeaderNameCell}>Outside Pool</Text>
              <Text style={styles.mainHeaderNameCell}>Total</Text>
            </View>                  
          </View>              
          {getHeaderDate()}
        </View>        
      </>
    </View>
    <View style={styles.logoWrapper}>
      <Image
        src={
          event.desktop_icon_URL
            ? `https://tourneymaster.s3.amazonaws.com/public/${event.desktop_icon_URL}`
            : TMLogo
        }
        style={styles.logo}
      />
    </View>
  </View>
)};

export default HeaderSchedule;
