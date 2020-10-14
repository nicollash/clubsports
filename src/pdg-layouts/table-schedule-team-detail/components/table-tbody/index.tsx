import React from 'react';
import { View } from '@react-pdf/renderer';
import { RowDivisionSlot, RowTeamSlot } from '../row-slot';
import ITimeSlot from 'common/models/schedule/timeSlots';
// import { IScheduleTeamDetails } from 'common/models/schedule/schedule-team-details';
import { DEFAULT_ROWS_COUNT } from '../../common';


interface Props {
  teamDetails: any[],
  // scheduleTeamDetails?: IScheduleTeamDetails[];
  timeSlots: ITimeSlot[];
  splitIdx: number;
  pageIdx: number;
  days: string[];
}

const TableTbody = ({
  teamDetails,
  // scheduleTeamDetails,
  timeSlots,
  splitIdx,
  pageIdx,
  days,
}: Props) => {
  console.log('timeSlots ->', timeSlots) // 
  let rowCount = 0;
  const timeSlotsWithGames = teamDetails.map((division) => {    
    let colsView: any[] = [];
    const divisionKey = Object.keys(division)[0];
    if (rowCount >= pageIdx * DEFAULT_ROWS_COUNT
    && rowCount < (pageIdx + 1) * DEFAULT_ROWS_COUNT) {
      rowCount ++;
      colsView.push(   
        <RowDivisionSlot 
          divisionName={divisionKey} 
        />)
      }

      const teamRows = division[divisionKey].map((teamItem: any, index: number) => {
        rowCount ++;
        const teamKey = Object.keys(teamItem)[0];
        if (rowCount >= pageIdx * DEFAULT_ROWS_COUNT
            && rowCount < (pageIdx + 1) * DEFAULT_ROWS_COUNT) {
          return <RowTeamSlot 
                    days={days}
                    teamDetails={teamDetails}
                    teamName={teamKey}
                    dateGames={teamItem[teamKey]} 
                    odd={index % 2 === 0} 
                    splitIdx={splitIdx}
                  />
        } else return null;
      })
      colsView.push(teamRows);
      return colsView;
  });

  return (
  <>
    {teamDetails &&
    <View>{timeSlotsWithGames}</View>
    }
  </>
  );
};

export default TableTbody;
