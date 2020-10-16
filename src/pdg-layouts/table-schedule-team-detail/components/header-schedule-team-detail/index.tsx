import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import TMLogo from 'assets/logo.png';
import moment from 'moment';
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

  let idx = splitIdx * 0
  const currentPageStartGameIdx = idx * DEFAULT_COLUMNS_COUNT;
  const currentPageEndGameIdx = (idx + 1) * DEFAULT_COLUMNS_COUNT;

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
          const gameWidth = gameCellCount * 80 + (gameCellCount - 1) * 3;
          const gameNames = [...Array(gameCellCount).keys()];
          retView.push(
            <View style={styles.mainHeaderGameDate}>
              <View 
                style={{
                  ...styles.mainHeaderDateWrapper,
                  width: gameWidth
                }}
                >
                <Text style={styles.mainHeaderCell}>{moment(date).format('MMMM D')}</Text>
              </View> 
              <View style={styles.mainHeaderGameWrapper}>
                { 
                  gameNames.map((index) =>{                    
                    return (
                    <View style={styles.mainHeaderGameCellWrapper}>
                      <Text style={styles.mainHeaderNameCell}>{`Game ${index + 1}`}</Text>
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
          Division and Team Game Detail:{`${event.event_name}`}
        </Text>
        <Text style={styles.scheduleName}>
          Start Date : {moment(event.event_startdate).format('MMMM D, YYYY')}&nbsp;&nbsp;
          Schedule : {`${schedule.schedule_name}`}
        </Text>

        <View style={styles.mainHeaderWrapper}>
          <View style={styles.mainHeaderDivisionWrapper}>
            <Text style={styles.mainHeaderCell}>Division</Text>
          </View>
          <View style={styles.mainHeaderCountsWrapper}>
            <Text style={styles.mainHeaderCell}>Game Counts:</Text>
            <View style={styles.mainHeaderCountsIndividualWrapper}>              
              <Text style={styles.mainHeaderCountCell}>Within Pool</Text>
              <Text style={styles.mainHeaderCountCell}>Outside Pool</Text>
              <Text style={styles.mainHeaderCountCell}>Total</Text>
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
