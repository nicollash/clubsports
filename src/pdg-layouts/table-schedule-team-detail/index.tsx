import React from "react";
import { Page, Text, View, Document } from "@react-pdf/renderer";
// import moment from 'moment';
import TableTbody from "./components/table-tbody";
import { PrintedDate } from "../common";
import HeaderSchedule from "./components/header-schedule-team-detail";
import { IEventDetails, ISchedule, IDivision, IPool } from "common/models";
import { IScheduleTeamDetails } from "common/models/schedule/schedule-team-details";
import { IGame } from "components/common/matrix-table/helper";
import { IField } from "common/models/schedule/fields";
import { IScheduleFacility } from "common/models/schedule/facilities";
import {
  parseJsonGames,
  getUniqueKeyArray,
  sortJsonGamesList,
  getGamesCountForDay,
  getTeamCount,
} from "../helpers";
import { DEFAULT_COLUMNS_COUNT, DEFAULT_ROWS_COUNT } from "./common";
import { styles } from "./styles";
import { ITeamCard } from "common/models/schedule/teams";

interface IPDFProps {
  event: IEventDetails;
  schedule: ISchedule;
  scheduleTeamDetails?: IScheduleTeamDetails[];
  games: IGame[];
  fields: IField[];
  facilities: IScheduleFacility[];
  teamCards: ITeamCard[];
  isHeatMap?: boolean;
  byPool?: boolean;
  divisions?: IDivision[];
  pools?: IPool[];
  isEmptyListsIncluded?: boolean;
  scorerMobile: string;
}

const PDFTableScheduleTeamDetail = ({
  event,
  schedule,
  scheduleTeamDetails,
}: IPDFProps) => {
  const getTotalGameCountByDay = (sortedTeamDetails: any[], days: string[]) => {
    let totalCount = 0;
    days.forEach((date) => {
      const gamesCount = getGamesCountForDay(sortedTeamDetails, date);
      totalCount += gamesCount;
    });
    return totalCount;
  };

  const jsonTeamPlainDetails = scheduleTeamDetails
    ? parseJsonGames(scheduleTeamDetails)
    : [];
  const days = getUniqueKeyArray(jsonTeamPlainDetails, "game_date");
  const sortedJsonTeamDetails = sortJsonGamesList(jsonTeamPlainDetails);
  const totalCount = getTotalGameCountByDay(sortedJsonTeamDetails, days);
  const totalTeamCount = getTeamCount(sortedJsonTeamDetails);
  // console.log('jsonTeamPlainDetails ->', jsonTeamPlainDetails) //
  // console.log('sortedJsonTeamDetails ->', sortedJsonTeamDetails) //
  // console.log('totalCount ->', totalCount) //
  // console.log('days ->', days) //

  const makeDocument = () => {
    const pagesSideCount = Math.ceil(totalCount / DEFAULT_COLUMNS_COUNT);
    console.log("pagesSideCount ->", pagesSideCount); //
    const pagesCount = Math.ceil(
      (totalTeamCount + sortedJsonTeamDetails.length) / DEFAULT_ROWS_COUNT
    );
    const pages = [...Array(pagesCount).keys()];
    return pages.map((idx) => {
      const splitIdx = 0;
      return (
        <Page size="A4" orientation="landscape" style={styles.page} key={idx}>
          <HeaderSchedule
            days={days}
            event={event}
            schedule={schedule}
            teamDetails={sortedJsonTeamDetails}
            splitIdx={splitIdx}
          />
          <View style={styles.tableWrapper} key={idx}>
            <View key={idx}>
              <TableTbody
                days={days}
                teamDetails={sortedJsonTeamDetails}
                splitIdx={splitIdx}
                pageIdx={idx}
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
      );
    });
  };

  return <Document>{makeDocument()}</Document>;
};

export default PDFTableScheduleTeamDetail;
