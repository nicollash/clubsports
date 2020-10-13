import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import TMLogo from 'assets/logo.png';
import { IEventDetails, ISchedule } from 'common/models';
import { styles } from './styles';

interface Props {
  event: IEventDetails;
  schedule: ISchedule;
  teamDetails: any[];
  splitIdx: number;
}

const HeaderSchedule = ({
  event,
  schedule,
  teamDetails,
  splitIdx,
}: Props) => {
  console.log('splitIdx ->', splitIdx) // react.dev216
  console.log('teamDetails ->', teamDetails) // react.dev216

  const getGameDate = (colIdx: number) => {
    let countGames = 0;
    teamDetails.forEach((division) => {
      const divisionKey =  Object.keys(division)[0];
        division[divisionKey].forEach((date: string) => {
          const dateKey =  Object.keys(date)[0];
          const preCountGames = countGames;
          countGames += date[dateKey].length;
          if(countGames > colIdx && colIdx >= preCountGames ) {
            // const date={moment(Date(dateKey)).format('dddd - MMMM D')}
            return dateKey;
          }
        })

    })
  };
  const date =  getGameDate(splitIdx);
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
          </View>
          <View style={styles.mainHeaderCountsWrapper}>
            <Text style={styles.mainHeaderCell}>Game Counts:</Text>
          </View>              
          <View 
            style={{
              ...styles.mainHeaderDate1Wrapper,
              backgroundColor: '#DCDCDC',
            }}
            >
            <Text style={styles.mainHeaderCell}>{`${date}`}</Text>
          </View>    
          <View style={styles.mainHeaderDate2Wrapper}>
            <Text style={styles.mainHeaderCell}>{`<<game_date2>> DateFormat =  Mmm DD (same sort)`}</Text>
          </View> 
        </View>

        <View style={styles.mainHeaderWrapper}>
          <View style={styles.mainHeaderDivisionNameWrapper}>
            <Text style={styles.mainHeaderNameCell}>Division Name</Text>
          </View>
          <View style={styles.mainHeaderCountsIndividualWrapper}>
            <Text style={styles.mainHeaderNameCell}>Within Pool</Text>
          </View>         
          <View style={styles.mainHeaderCountsIndividualWrapper}>
            <Text style={styles.mainHeaderNameCell}>Outside Pool</Text>
          </View>         
          <View style={styles.mainHeaderCountsIndividualWrapper}>
            <Text style={styles.mainHeaderNameCell}>Total</Text>
          </View>         
          <View style={styles.mainHeaderGameWrapper}>
            <Text style={styles.mainHeaderNameCell}>{`Game 1`}</Text>
          </View>         
          <View style={styles.mainHeaderGameWrapper}>
            <Text style={styles.mainHeaderNameCell}>{`Game 2`}</Text>
          </View>         
          <View style={styles.mainHeaderGameWrapper}>
            <Text style={styles.mainHeaderNameCell}>{`Game 3`}</Text>
          </View>         
          <View style={styles.mainHeaderGameWrapper}>
            <Text style={styles.mainHeaderNameCell}>{`Game 4`}</Text>
          </View>         
          <View style={styles.mainHeaderGameWrapper}>
            <Text style={styles.mainHeaderNameCell}>{`Game N`}</Text>
          </View>         
          <View style={styles.mainHeaderGameWrapper}>
            <Text style={styles.mainHeaderNameCell}>{`Game 1`}</Text>
          </View>         
          <View style={styles.mainHeaderGameWrapper}>
            <Text style={styles.mainHeaderNameCell}>{`Game 2`}</Text>
          </View>         
          <View style={styles.mainHeaderGameWrapper}>
            <Text style={styles.mainHeaderNameCell}>{`Game N`}</Text>
          </View>         
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
