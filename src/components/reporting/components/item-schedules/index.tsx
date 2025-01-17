import React from "react";
import { CSVLink } from "react-csv";
import PDFTableSchedule from "pdg-layouts/table-schedule";
import PDFTableScheduleTeamDetail from "pdg-layouts/table-schedule-team-detail";
import PDFTableFieldsSchedule from "pdg-layouts/table-fields-schedule";
import {
  HeadingLevelThree,
  ButtonLoad,
  SelectMultiple,
  CardMessage,
} from "components/common";
import { CardMessageTypes } from "components/common/card-message/types";
import {
  onPDFSave,
  onXLSXSave,
  getAllTeamCardGames,
  getSelectDayOptions,
  getGamesByDays,
} from "helpers";
import { ButtonVariant, ButtonColors, DefaultSelectValues } from "common/enums";
import {
  IEventDetails,
  ISchedule,
  IPool,
  IDivision,
  ISchedulesGame,
  INormalizedGame,
} from "common/models";
import { IScheduleTeamDetails } from "common/models/schedule/schedule-team-details";
import { getScheduleTableXLSX, TableType } from "../../helpers";
import { IGame, calculateDays } from "components/common/matrix-table/helper";
import { IField } from "common/models/schedule/fields";
import ITimeSlot from "common/models/schedule/timeSlots";
import { IScheduleFacility } from "common/models/schedule/facilities";
import { ITeamCard } from "common/models/schedule/teams";
import styles from "./styles.module.scss";
import { IBracketGame } from "components/playoffs/bracketGames";
import { mapGamesWithSchedulesGames } from "components/scoring/helpers";
import { getScorers } from "pdg-layouts/helpers";

const STYLES_ICOM_WARNING = {
  fill: "#FFCB00",
  height: "25px",
  width: "30px",
};

export enum PDFReportType {
  MASTER_SCHEDULE = "Master Schedule - PDF",
  MASTER_SCHEDULE_HEATMAP = "Master Schedule (with Heatmap) - PDF",
  MASTER_SCHEDULE_FIELD_BY_FIELD = "Master Schedule (Field by Field) - PDF",
  POOLS_SCHEDULE_HEATMAP = "Printed Pools Schedule (with Heatmap) - PDF",
  TEAM_DETAILS_SCHEDULE = "Schedule - Team Details - PDF",
}

interface Props {
  event: IEventDetails;
  timeSlots: ITimeSlot[];
  facilities: IScheduleFacility[];
  games: IGame[];
  fields: IField[];
  schedule: ISchedule;
  scheduleTeamDetails?: IScheduleTeamDetails[];
  normalizedGames?: INormalizedGame[];
  teamCards: ITeamCard[];
  bracketGames: IBracketGame[];
  pools: IPool[];
  playoffTimeSlots?: ITimeSlot[];
  divisions: IDivision[];
  schedulesGames: ISchedulesGame[];
  isEmptyListsIncluded?: boolean;
}

const ItemSchedules = (props: Props) => {
  const {
    event,
    facilities,
    timeSlots,
    games,
    fields,
    schedule,
    scheduleTeamDetails,
    normalizedGames,
    teamCards,
    pools,
    bracketGames,
    playoffTimeSlots,
    divisions,
    schedulesGames,
    isEmptyListsIncluded,
  } = props;
  const [isAllowDownload, changeAllowDownload] = React.useState<boolean>(true);
  const [activeDay, changeActiveDay] = React.useState<string[]>([
    DefaultSelectValues.ALL,
  ]);
  let scorerMobile = "";
  getScorers(event.event_id).then((res) => (scorerMobile = res));

  React.useEffect(() => {
    changeAllowDownload(activeDay.length > 0);
  }, [activeDay]);

  const csvData = normalizedGames ? normalizedGames : [];
  const eventDays = calculateDays(teamCards);
  const allTeamCardGames = getAllTeamCardGames(
    teamCards,
    games,
    eventDays,
    bracketGames,
    playoffTimeSlots,
    divisions
  );
  const mappedGames = mapGamesWithSchedulesGames(
    allTeamCardGames,
    schedulesGames
  );
  const gamesByDay = getGamesByDays(mappedGames, activeDay);
  const selectDayOptions = getSelectDayOptions(eventDays);

  const onChangeActiveDay = (avtiveDay: string[] | null) => {
    if (activeDay) {
      changeActiveDay(avtiveDay as string[]);
    }
  };

  const onScheduleTableSave = () => {
    onPDFSave(
      <PDFTableSchedule
        event={event}
        games={gamesByDay}
        fields={fields}
        facilities={facilities}
        schedule={schedule}
        teamCards={teamCards}
        scorerMobile={scorerMobile}
        schedulesGames={schedulesGames}
        isEmptyListsIncluded={isEmptyListsIncluded}
      />,
      event.event_name
        ? `${event.event_name} Master Schedule - PDF`
        : "Schedule"
    );
  };

  const onHeatmapScheduleTableSave = () =>
    onPDFSave(
      <PDFTableSchedule
        event={event}
        games={gamesByDay}
        fields={fields}
        facilities={facilities}
        schedule={schedule}
        teamCards={teamCards}
        isHeatMap={true}
        scorerMobile={scorerMobile}
        schedulesGames={schedulesGames}
        isEmptyListsIncluded={isEmptyListsIncluded}
      />,
      event.event_name
        ? `${event.event_name} Master Schedule (HeatMap) - PDF`
        : "Schedule"
    );

  const onSchedulePoolsPDFSave = () =>
    onPDFSave(
      <PDFTableSchedule
        event={event}
        games={gamesByDay}
        fields={fields}
        facilities={facilities}
        schedule={schedule}
        teamCards={teamCards}
        isHeatMap={true}
        byPool={true}
        divisions={divisions}
        pools={pools}
        scorerMobile={scorerMobile}
        schedulesGames={schedulesGames}
        isEmptyListsIncluded={isEmptyListsIncluded}
      />,
      event.event_name
        ? `${event.event_name} Printed Pools Schedule (with Heatmap) - PDF`
        : "Schedule"
    );

  const onScheduleTeamDetailsPDFSave = () =>
    onPDFSave(
      <PDFTableScheduleTeamDetail
        event={event}
        schedule={schedule}
        scheduleTeamDetails={scheduleTeamDetails}
        games={gamesByDay}
        fields={fields}
        facilities={facilities}
        teamCards={teamCards}
        isHeatMap={true}
        // byPool={true}
        divisions={divisions}
        pools={pools}
        scorerMobile={scorerMobile}
        isEmptyListsIncluded={isEmptyListsIncluded}
      />,
      event.event_name
        ? `${event.event_name} Schedule Team Detail`
        : "TeamDetail"
    );

  const onScheduleFieldsSave = () => {
    onPDFSave(
      <PDFTableFieldsSchedule
        event={event}
        games={gamesByDay}
        fields={fields}
        pdfType={PDFReportType.MASTER_SCHEDULE_FIELD_BY_FIELD}
        timeSlots={timeSlots}
        teamCards={teamCards}
        facilities={facilities}
        schedule={schedule}
        schedulesGames={schedulesGames}
        scorerMobile={scorerMobile}
      />,
      event.event_name
        ? `${event.event_name} Master Fields Schedule`
        : "FieldsSchedule"
    );
  };

  const onScheduleTableXLSXSave = async () => {
    const { header, body } = await getScheduleTableXLSX(
      event,
      schedule,
      games,
      teamCards,
      facilities,
      fields,
      pools,
      TableType.SCHEDULE
    );

    onXLSXSave(header, body, "Master Schedule");
  };

  return (
    <li>
      <section>
        <header className={styles.headerWrapper}>
          <HeadingLevelThree>
            <span>Schedules</span>
          </HeadingLevelThree>
          <SelectMultiple
            options={selectDayOptions}
            value={activeDay}
            onChange={onChangeActiveDay}
            primaryValue={DefaultSelectValues.ALL}
            isFormControlRow={true}
            label="Day Selection: "
          />
        </header>
        <ul className={styles.scheduleList}>
          <li>
            <ButtonLoad
              loadFunc={onScheduleTableSave}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              isDisabled={!isAllowDownload}
              label={PDFReportType.MASTER_SCHEDULE}
            />
          </li>
          <li>
            <ButtonLoad
              loadFunc={onHeatmapScheduleTableSave}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              isDisabled={!isAllowDownload}
              label={PDFReportType.MASTER_SCHEDULE_HEATMAP}
            />
          </li>
          <li>
            <ButtonLoad
              loadFunc={onScheduleFieldsSave}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              isDisabled={!isAllowDownload}
              label={PDFReportType.MASTER_SCHEDULE_FIELD_BY_FIELD}
            />
          </li>
          <li>
            <ButtonLoad
              loadFunc={onScheduleTableXLSXSave}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              label="Master Schedule - XLSX"
            />
          </li>
          <li>
            <ButtonLoad
              loadFunc={onSchedulePoolsPDFSave}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              label={PDFReportType.POOLS_SCHEDULE_HEATMAP}
            />
          </li>
          <li>
            <ButtonLoad
              loadFunc={onScheduleTeamDetailsPDFSave}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              label={PDFReportType.TEAM_DETAILS_SCHEDULE}
            />
          </li>
          <li style={{ display: "flex" }}>
            <CSVLink
              style={{ color: "#00A3EA", padding: "6px 8px" }}
              data={csvData}
              filename={"Divisions Games List.csv"}
              asyncOnClick={true}
            >
              Schedule - Team Details Raw Data - CSV
            </CSVLink>
          </li>
        </ul>
        {!isAllowDownload && (
          <CardMessage
            type={CardMessageTypes.WARNING}
            iconStyle={STYLES_ICOM_WARNING}
          >
            Select day to download PDF-files
          </CardMessage>
        )}
      </section>
    </li>
  );
};

export default ItemSchedules;
