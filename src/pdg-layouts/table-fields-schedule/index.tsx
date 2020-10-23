import React from "react";
import { Page, Document, View, Text } from "@react-pdf/renderer";
import moment from "moment";
import TableThead from "./components/table-thead";
import TableTbody from "./components/table-tbody";
import { HeaderSchedule, PrintedDate } from "../common";
import {
  IEventDetails,
  ISchedule,
  ISchedulesDetails,
  ISchedulesGame,
} from "common/models";
import { IGame } from "components/common/matrix-table/helper";
import { IField } from "common/models/schedule/fields";
import ITimeSlot from "common/models/schedule/timeSlots";
import { IScheduleFacility } from "common/models/schedule/facilities";
import {
  getFieldsByFacility,
  getGamesByField,
  getGamesByDays,
  getTimeslotsForDay,
} from "../helpers";
import { styles } from "./styles";
import { PDFReportType } from "components/reporting/components/item-schedules";
import { ITeamCard } from "common/models/schedule/teams";

interface Props {
  event: IEventDetails;
  games: IGame[];
  fields: IField[];
  pdfType?: PDFReportType;
  timeSlots: ITimeSlot[];
  teamCards?: ITeamCard[];
  facilities: IScheduleFacility[];
  schedule: ISchedule;
  scorerMobile: string;
  schedulesGames: ISchedulesGame[] | ISchedulesDetails[];
}

const PDFScheduleTable = ({
  event,
  facilities,
  fields,
  pdfType,
  games,
  teamCards,
  schedule,
  scorerMobile,
  schedulesGames,
}: Props) => {
  const gamesByDays = getGamesByDays(games);

  return (
    <Document>
      {Object.keys(gamesByDays).map((day) => {
        const gamesByDay = gamesByDays[day];
        const timeslotsPerDay = getTimeslotsForDay(day, schedulesGames!);

        return facilities.map((facility) => {
          const fieldsByFacility = getFieldsByFacility(fields, facility);

          return fieldsByFacility.map((field) => (
            <Page
              size="A4"
              orientation="portrait"
              style={styles.page}
              key={field.id}
            >
              <HeaderSchedule
                event={event}
                pdfType={pdfType}
                schedule={schedule}
                scorerMobile={scorerMobile}
              />
              {/* <PrintedDate /> */}
              <View style={styles.tableWrapper}>
                <View style={styles.facilityWrapper}>
                  <Text style={styles.scheduleDate}>
                    {moment(day).format("l")}
                  </Text>
                  <Text style={styles.facilityName}>{facility.name}</Text>
                </View>
                <TableThead field={field} />
                <TableTbody
                  timeSlots={timeslotsPerDay}
                  games={getGamesByField(gamesByDay, field)}
                  teamCards={teamCards}
                  isRequaredSmsScoring={Boolean(event.sms_scoring_YN)}
                />
              </View>
              <PrintedDate />
              <Text
                style={styles.pageNumber}
                render={({ pageNumber, totalPages }) =>
                  `${pageNumber} / ${totalPages}`
                }
                fixed={true}
              />
            </Page>
          ));
        });
      })}
    </Document>
  );
};

export default PDFScheduleTable;
