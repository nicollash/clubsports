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
}

const TableTbody = ({
  teamDetails,
  scheduleTeamDetails,
  timeSlots,
  splitIdx,
}: Props) => {

console.log('scheduleTeamDetails ->', scheduleTeamDetails ? scheduleTeamDetails.length : 0) // react.dev216
console.log('teamDetails ->', teamDetails) // react.dev216
console.log('timeSlots ->', timeSlots) // react.dev216
console.log('splitIdx ->', splitIdx) // react.dev216

  const timeSlotsWithGames = teamDetails.map((division) => {
    const divisionKey = Object.keys(division)[0];
    return (
      <>
        <RowDivisionSlot divisionName={divisionKey} />
        {
          division[divisionKey].map((dateItem: any) => {
            const dateKey = Object.keys(dateItem)[0];
            return <RowTeamSlot divisionName={dateKey} />
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
