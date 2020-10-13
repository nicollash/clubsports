import React from 'react';
import { Page, Text, View, Document } from '@react-pdf/renderer';
// import moment from 'moment';
import TableTbody from './components/table-tbody';
import { PrintedDate } from '../common';
import HeaderSchedule from './components/header-schedule-team-detail';
import { IEventDetails, ISchedule, IDivision, IPool } from 'common/models';
import { IScheduleTeamDetails } from 'common/models/schedule/schedule-team-details';
import { IGame } from 'components/common/matrix-table/helper';
import { IField } from 'common/models/schedule/fields';
import ITimeSlot from 'common/models/schedule/timeSlots';
import { IScheduleFacility } from 'common/models/schedule/facilities';
import {
  parseJsonGames,
  getUniqueKeyArray,
  sortJsonGames,
  getGamesCountForDay,
} from '../helpers';
import { DEFAULT_COLUMNS_COUNT } from './common';
import { styles } from './styles';
import { ITeamCard } from 'common/models/schedule/teams';

interface IPDFProps {
  event: IEventDetails;
  schedule: ISchedule;
  scheduleTeamDetails?: IScheduleTeamDetails[];
  games: IGame[];
  fields: IField[];
  timeSlots: ITimeSlot[];
  facilities: IScheduleFacility[];
  teamCards: ITeamCard[];
  isHeatMap?: boolean;
  byPool?: boolean;
  divisions?: IDivision[];
  pools?: IPool[];
  isEmptyListsIncluded?: boolean;
  scorerMobile: string;
};

const PDFTableScheduleTeamDetail = ({
  event,
  timeSlots,
  schedule,
  scheduleTeamDetails,
}: IPDFProps) => {

  const getTotalGameCountByDay = (sortedTeamDetails: any[], days: string[] ) => {
    let totalCount = 0;
    days.forEach((date) => {
      const gamesCount = getGamesCountForDay(sortedTeamDetails, date);
      totalCount += gamesCount;
    })
    return totalCount;
  }

  const jsonTeamPlainDetails = scheduleTeamDetails ? parseJsonGames(scheduleTeamDetails) : [];
  const days = getUniqueKeyArray(jsonTeamPlainDetails,'game_date');
  const jsonTeamDetails = sortJsonGames(jsonTeamPlainDetails);
  const totalCount = getTotalGameCountByDay(jsonTeamDetails, days);
  console.log('jsonTeamPlainDetails ->', jsonTeamPlainDetails) // 
  console.log('sorted jsonTeamDetails ->', jsonTeamDetails) // 
  console.log('totalCount ->', totalCount) // 
  console.log('days ->', days) // 

  const makeDocument = () => {
    const pagesCount = Math.ceil(totalCount/DEFAULT_COLUMNS_COUNT);
    const pages = [...Array(pagesCount).keys()];
    return pages.map((idx) => {
      const splitIdx = idx;
      return (
        <Page
          size="A4"
          orientation="landscape"
          style={styles.page}
          key={idx}
        >
          <HeaderSchedule 
            days={days}
            event={event} 
            schedule={schedule}
            teamDetails={jsonTeamDetails}
            splitIdx={splitIdx}              
            />
          <View style={styles.tableWrapper} key={idx}>
            <View key={idx}>
              <TableTbody
                days={days}
                teamDetails={jsonTeamDetails}
                scheduleTeamDetails={scheduleTeamDetails}
                timeSlots={timeSlots}
                splitIdx={splitIdx}
              />
            </View>
          </View>
          <PrintedDate />
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
            fixed
          />
        </Page>  
      )                   
    });
  }

  return (
    <Document>
      { makeDocument() }
      
    </Document>
  );
};

export default PDFTableScheduleTeamDetail;
