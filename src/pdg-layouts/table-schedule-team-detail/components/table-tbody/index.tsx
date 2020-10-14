import React from 'react';
import { View } from '@react-pdf/renderer';
import { RowDivisionSlot, RowTeamSlot } from '../row-slot';
import ITimeSlot from 'common/models/schedule/timeSlots';
import { IScheduleTeamDetails } from 'common/models/schedule/schedule-team-details';


interface Props {
  teamDetails: any[],
  scheduleTeamDetails?: IScheduleTeamDetails[];
  timeSlots: ITimeSlot[];
  splitIdx: number;
  days: string[];
}

const TableTbody = ({
  teamDetails,
  scheduleTeamDetails,
  timeSlots,
  splitIdx,
  days,
}: Props) => {

console.log('scheduleTeamDetails ->', scheduleTeamDetails ? scheduleTeamDetails.length : 0) // 
console.log('teamDetails ->', teamDetails) // 
console.log('timeSlots ->', timeSlots) // 
console.log('splitIdx ->', splitIdx) //
console.log('days ->', days) //

  const timeSlotsWithGames = teamDetails.map((division) => {
    const divisionKey = Object.keys(division)[0];
    return (
      <>
        <RowDivisionSlot 
          divisionName={divisionKey} 
        />
        {
          division[divisionKey].map((teamItem: any, index: number) => {
            const teamKey = Object.keys(teamItem)[0];
            return <RowTeamSlot 
                      days={days}
                      teamDetails={teamDetails}
                      teamName={teamKey}
                      dateGames={teamItem[teamKey]} 
                      odd={index % 2 === 0} 
                    />
          })
        }
      </>
    );
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
