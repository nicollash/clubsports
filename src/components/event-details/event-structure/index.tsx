/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";

import {
  SectionDropdown,
  HeadingLevelThree,
  Input,
  Radio,
  Checkbox,
  Button,
} from "components/common";
import { EventMenuTitles } from "common/enums";

import styles from "../styles.module.scss";
import { dateToShortString, getTimeFromString, timeToString } from "helpers";
import { IEventDetails } from "common/models";
import MultipleDatesPicker from "@randex/material-ui-multiple-dates-picker";
import { CardMessageTypes } from "components/common/card-message/types";
import { CardMessage } from "components/common";
import moment from "moment";

const CARD_MESSAGE_STYLES = {
  marginBottom: 0,
  width: "100%",
};

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

enum esDetailsEnum {
  "Back to Back Game Warning" = "back_to_back_warning",
  "Same coach, same timeslot warning" = "same_coach_timeslot_YN",
  "Show same state warning on Schedule" = "same_state_warn_YN",
}

enum showCaseExtraGameTypes {
  "Add All-Star Games" = "allstar_games_YN",
  "Add Practice Games" = "practice_games_YN",
}

enum discontinuousDatesYN {
  "Not Continuous Dates" = "discontinuous_dates_YN",
}

enum timeDivisionEnum {
  "Halves (2)" = 2,
  "Periods (3)" = 3,
  "Quarters (4)" = 4,
  "Non-stop (1)" = 1,
}

enum timerEnum {
  "Central Horn/Timer" = 1,
  "Refs/On Field" = 2,
  "Not Applicable" = 3,
}
enum ResultsDisplayEnum {
  "Show Goals Scored" = "show_goals_scored",
  "Show Goals Allowed" = "show_goals_allowed",
  "Show Goals Differential" = "show_goals_diff",
  "Allow Ties (No OT)" = "tie_breaker_format_id",
}

export enum eventTypeOptions {
  "Tournament" = 0,
  "Showcase" = 1,
  "League" = 3,
}

const eventTypeRadioOptions = [
  eventTypeOptions[0],
  eventTypeOptions[1],
  eventTypeOptions[3],
];

interface Props {
  eventData: Partial<IEventDetails>;
  onChange: (name: string, value: string | number, ignore?: boolean) => void;
  isSectionExpand: boolean;
}

const EventStructureSection: React.FC<Props> = ({
  eventData,
  onChange,
  isSectionExpand,
}: Props) => {
  const {
    show_goals_scored,
    show_goals_allowed,
    show_goals_diff,
    back_to_back_warning,
    same_coach_timeslot_YN,
    same_state_warn_YN,
    tie_breaker_format_id,
    period_duration,
    time_btwn_periods,
    pre_game_warmup,
    periods_per_game,
    timer_owner,
    event_type,
    min_num_of_games,
    discontinuous_dates_YN,
    league_dates,
    allstar_games_YN,
    practice_games_YN,
  } = eventData;

  useEffect(() => {
    if (!event_type) onChange("event_type", eventTypeOptions[0], true);

    if (!timer_owner) onChange("timer_owner", 1);
    if (!periods_per_game) onChange("periods_per_game", 2, true);
    if (!time_btwn_periods) onChange("time_btwn_periods", "00:00:00", true);
  });

  const [isDatePickerOpen, setDatePickerOpen] = useState(false);

  const onEventTypeChange = (e: InputTargetValue) => {
    onChange("event_type", e.target.value);
  };

  const onGameNumChange = (e: InputTargetValue) =>
    onChange("min_num_of_games", Number(e.target.value));

  const onResultsChange = (e: InputTargetValue) =>
    onChange(
      ResultsDisplayEnum[e.target.value],
      eventData[ResultsDisplayEnum[e.target.value]] ? 0 : 1
    );

  const onChangePeriod = (e: InputTargetValue) =>
    onChange("periods_per_game", timeDivisionEnum[e.target.value]);

  const onChangeTimer = (e: InputTargetValue) =>
    onChange("timer_owner", timerEnum[e.target.value]);

  const onBackToBackChange = (e: InputTargetValue) =>
    onChange(
      esDetailsEnum[e.target.value],
      eventData[esDetailsEnum[e.target.value]] ? 0 : 1
    );

  const onSameCoachTimeslot = (e: InputTargetValue) =>
    onChange(
      esDetailsEnum[e.target.value],
      eventData[esDetailsEnum[e.target.value]] ? 0 : 1
    );

  const onSameState = (e: InputTargetValue) =>
    onChange(
      esDetailsEnum[e.target.value],
      eventData[esDetailsEnum[e.target.value]] ? 0 : 1
    );

  const onChangeContinuousDate = (e: InputTargetValue) =>
    onChange(
      discontinuousDatesYN[e.target.value],
      eventData[discontinuousDatesYN[e.target.value]] ? 0 : 1
    );

  const onPregameWarmupChange = (e: InputTargetValue) => {
    const value = e.target.value;
    const timeInString: string = timeToString(Number(value));
    return onChange("pre_game_warmup", timeInString);
  };

  const onTimeDivisionDuration = (e: InputTargetValue) => {
    const value = e.target.value;
    const timeInString: string = timeToString(Number(value));
    return onChange("period_duration", timeInString);
  };

  const onTimeBtwnPeriodsDuration = (e: InputTargetValue) => {
    const value = e.target.value;
    const timeInString: string = timeToString(Number(value));
    return onChange("time_btwn_periods", timeInString);
  };

  const onChangeShowcase = (e: InputTargetValue) => {
    const value = e.target.value;
    onChange(
      showCaseExtraGameTypes[value],
      eventData[showCaseExtraGameTypes[value]] ? 0 : 1
    );
  };

  const resultsDisplayOptions = [
    { label: "Show Goals Scored", checked: Boolean(show_goals_scored) },
    { label: "Show Goals Allowed", checked: Boolean(show_goals_allowed) },
    { label: "Show Goals Differential", checked: Boolean(show_goals_diff) },
    { label: "Allow Ties (No OT)", checked: Boolean(tie_breaker_format_id) },
  ];

  const timeDivisionOptions = ["Halves (2)", "Periods (3)", "Quarters (4)", "Non-stop (1)"];

  const timerOptions = [
    "Central Horn/Timer",
    "Refs/On Field",
    "Not Applicable",
  ];

  const onDatesSubmit = (dates: Date[]) => {
    const parsedDates = JSON.stringify(
      dates.map((date: Date) => dateToShortString(date, true))
    );
    onChange("league_dates", parsedDates);
    setDatePickerOpen(false);
  };

  const leagueDates = league_dates
    ? JSON.parse(league_dates).map(
        (date: Date) => new Date(moment(date).utc(false).toDate())
      )
    : [];

  const countBtwnPeriod = periods_per_game ? periods_per_game - 1 : 1;

  return (
    <SectionDropdown
      id={EventMenuTitles.EVENT_STRUCTURE}
      type="section"
      panelDetailsType="flat"
      useShadow={true}
      expanded={isSectionExpand}
    >
      <HeadingLevelThree>
        <span className={styles.blockHeading}>Event Structure</span>
      </HeadingLevelThree>
      <div>
        <CardMessage
          style={CARD_MESSAGE_STYLES}
          type={CardMessageTypes.EMODJI_OBJECTS}
        >
          Define the structure of your event here.
        </CardMessage>
        <div className={styles.esDetails}>
          <div className={styles.esDetailsFirst}>
            <div className={styles.column}>
              <Radio
                options={eventTypeRadioOptions}
                formLabel="Event Type:"
                onChange={onEventTypeChange}
                checked={event_type || ""}
              />
              {event_type === "Showcase" ? (
                <Checkbox
                  options={[
                    {
                      label: "Add All-Star Games",
                      checked: Boolean(allstar_games_YN),
                    },
                    {
                      label: "Add Practice Games",
                      checked: Boolean(practice_games_YN),
                    },
                  ]}
                  formLabel=""
                  onChange={onChangeShowcase}
                />
              ) : null}
              {event_type === "Tournament" || event_type === "Showcase" ? (
                <Checkbox
                  options={[
                    {
                      label: "Not Continuous Dates",
                      checked: Boolean(discontinuous_dates_YN),
                    },
                  ]}
                  formLabel=""
                  onChange={onChangeContinuousDate}
                />
              ) : null}
              {event_type === "League" || discontinuous_dates_YN ? (
                <div>
                  <Button
                    label="Select Dates"
                    color="secondary"
                    variant="text"
                    onClick={() => setDatePickerOpen(!isDatePickerOpen)}
                  />
                  <MultipleDatesPicker
                    open={isDatePickerOpen}
                    selectedDates={leagueDates}
                    onCancel={() => setDatePickerOpen(false)}
                    onSubmit={onDatesSubmit}
                    submitButtonText="Select"
                  />
                </div>
              ) : null}
            </div>
            <div className={styles.column}>
              <Radio
                options={timeDivisionOptions}
                formLabel="Time Selection:"
                onChange={onChangePeriod}
                checked={timeDivisionEnum[periods_per_game!] || ""}
              />
            </div>
            <div className={styles.column}>
              <Radio
                options={timerOptions}
                formLabel="Time Controlled By:"
                onChange={onChangeTimer}
                checked={timerEnum[timer_owner!] || ""}
              />
            </div>
            <div className={styles.column}>
              <Checkbox
                options={resultsDisplayOptions}
                formLabel="Results Display:"
                onChange={onResultsChange}
              />
            </div>
            <div className={styles.column}>
              <Input
                fullWidth={true}
                type="number"
                label="Min # of Game Guarantee:"
                value={min_num_of_games || ""}
                onChange={onGameNumChange}
              />
              <Checkbox
                options={[
                  {
                    label: "Back to Back Game Warning",
                    checked: Boolean(back_to_back_warning),
                  },
                ]}
                formLabel=""
                onChange={onBackToBackChange}
              />
              <Checkbox
                options={[
                  {
                    label: "Same coach, same timeslot warning",
                    checked: Boolean(same_coach_timeslot_YN),
                  },
                ]}
                formLabel=""
                onChange={onSameCoachTimeslot}
              />
              <Checkbox
                options={[
                  {
                    label: "Show same state warning on Schedule",
                    checked: Boolean(same_state_warn_YN),
                  },
                ]}
                formLabel=""
                onChange={onSameState}
              />
            </div>
          </div>
          <div className={styles.esDetailsSecond}>
            <Input
              fullWidth={true}
              endAdornment="Minutes"
              label="Pregame Warmup *"
              type="number"
              value={getTimeFromString(pre_game_warmup!, "minutes").toString()}
              onChange={onPregameWarmupChange}
            />
            <span className={styles.innerSpanText}>&nbsp;+&nbsp;</span>
            <Input
              fullWidth={true}
              endAdornment="Minutes"
              label="Time Selection Duration *"
              type="number"
              value={getTimeFromString(period_duration!, "minutes").toString()}
              onChange={onTimeDivisionDuration}
            />
            <span className={styles.innerSpanText}>
              &nbsp;({periods_per_game})&nbsp;+&nbsp;
            </span>
            <Input
              fullWidth={true}
              endAdornment="Minutes"
              label="Time Btwn Periods *"
              type="number"
              value={getTimeFromString(
                time_btwn_periods!,
                "minutes"
              ).toString()}
              onChange={onTimeBtwnPeriodsDuration}
            />
            <span className={styles.innerSpanText}>
              &nbsp;({countBtwnPeriod})&nbsp;
            </span>
            <span className={styles.innerSpanText}>
              &nbsp;=&nbsp;
              {eventData &&
                periods_per_game! *
                  getTimeFromString(period_duration!, "minutes") +
                  getTimeFromString(pre_game_warmup!, "minutes") +
                  getTimeFromString(time_btwn_periods!, "minutes") *
                    countBtwnPeriod}
              &nbsp; Minutes Total Runtime
            </span>
          </div>
        </div>
      </div>
    </SectionDropdown>
  );
};

export default EventStructureSection;
