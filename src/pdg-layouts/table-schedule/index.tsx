import React from "react";
import { Page, Text, View, Document } from "@react-pdf/renderer";
import moment from "moment";
import TableThead from "./components/table-thead";
import TableTbody from "./components/table-tbody";
import { HeaderSchedule, PrintedDate } from "../common";
import { IEventDetails, ISchedule, IDivision, IPool, ISchedulesGame, ISchedulesDetails } from "common/models";
import { IGame } from "components/common/matrix-table/helper";
import { IField } from "common/models/schedule/fields";
import { IScheduleFacility } from "common/models/schedule/facilities";
import {
  getFieldsByFacility,
  getGamesByDays,
  getGamesByFacility,
  getGamesByDivision,
  isEmptyGames,
  getTimeslotsForDay,
} from "../helpers";
import { DEFAULT_COLUMNS_COUNT } from "./common";
import { styles } from "./styles";
import { ITeamCard } from "common/models/schedule/teams";

interface IPDFProps {
  event: IEventDetails;
  games: IGame[];
  fields: IField[];
  facilities: IScheduleFacility[];
  schedule: ISchedule;
  teamCards: ITeamCard[];
  isHeatMap?: boolean;
  byPool?: boolean;
  divisions?: IDivision[];
  pools?: IPool[];
  isEmptyListsIncluded?: boolean;
  scorerMobile: string;
  schedulesGames: ISchedulesGame[] | ISchedulesDetails[];
}

const PDFScheduleTable = ({
  event,
  fields,
  facilities,
  games,
  schedule,
  teamCards,
  isHeatMap,
  byPool,
  divisions,
  pools,
  isEmptyListsIncluded,
  scorerMobile,
  schedulesGames,
}: IPDFProps) => {
  const gamesByDays = getGamesByDays(games);

  return (
    <Document>
      {Object.keys(gamesByDays).map((day) => {
        const gamesByDay = gamesByDays[day];
        const timeslotsPerDay = getTimeslotsForDay(day, schedulesGames!);

        return facilities.map((facility) => {
          const fieldsByFacility = getFieldsByFacility(fields, facility);
          const gamesByFacility = getGamesByFacility(gamesByDay, facility);

          return fieldsByFacility.reduce((acc, field, idx) => {
            if (!isEmptyListsIncluded && isEmptyGames(gamesByFacility)) {
              return acc;
            }
            let splitIdx = 0;

            if (idx % DEFAULT_COLUMNS_COUNT === 0 || idx === 0) {
              if (idx > 0) splitIdx += idx;

              if (byPool && divisions && pools) {
                return divisions.reduce((acc, division) => {
                  const gamesByFacilityAndDivision = getGamesByDivision(
                    gamesByFacility,
                    division
                  );

                  if (
                    !isEmptyListsIncluded &&
                    isEmptyGames(gamesByFacilityAndDivision)
                  ) {
                    return acc;
                  }

                  return [
                    ...acc,
                    <Page
                      size="A4"
                      orientation="landscape"
                      style={styles.page}
                      key={field.id}
                    >
                      <HeaderSchedule
                        event={event}
                        schedule={schedule}
                        byPool={byPool}
                        divisionName={division.long_name}
                        date={moment(day).format("dddd - MMMM D, YYYY")}
                        facilitiesName={facility.name}
                        scorerMobile={scorerMobile}
                      />
                      <View style={styles.tableWrapper} key={facility.id}>
                        <View key={field.id}>
                          <TableThead
                            facility={facility}
                            fields={fieldsByFacility}
                            splitIdx={splitIdx}
                          />
                          <TableTbody
                            timeSlots={timeslotsPerDay}
                            games={gamesByFacilityAndDivision}
                            teamCards={teamCards}
                            splitIdx={splitIdx}
                            isHeatMap={isHeatMap}
                            byPool={byPool}
                            pools={pools}
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
                    </Page>,
                  ];
                }, [] as JSX.Element[]);
              } else {
                return [
                  ...acc,
                  <Page
                    size="A4"
                    orientation="landscape"
                    style={styles.page}
                    key={field.id}
                  >
                    <HeaderSchedule
                      event={event}
                      schedule={schedule}
                      scorerMobile={scorerMobile}
                    />
                    <View style={styles.tableWrapper} key={facility.id}>
                      <View style={styles.facilityTitle}>
                        <Text style={styles.scheduleDate}>
                          {moment(day).format("l")}
                        </Text>
                        <Text style={styles.scheduleFacility}>
                          {facility.name}
                        </Text>
                      </View>
                      <View key={field.id}>
                        <TableThead
                          facility={facility}
                          fields={fieldsByFacility}
                          splitIdx={splitIdx}
                        />
                        <TableTbody
                          timeSlots={timeslotsPerDay}
                          games={gamesByFacility}
                          teamCards={teamCards}
                          splitIdx={splitIdx}
                          isHeatMap={isHeatMap}
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
                  </Page>,
                ];
              }
            } else {
              return acc;
            }
          }, [] as JSX.Element[]);
        });
      })}
    </Document>
  );
};

export default PDFScheduleTable;
