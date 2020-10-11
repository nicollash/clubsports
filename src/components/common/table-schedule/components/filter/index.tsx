import React, { useState } from "react";
import { Button, Select, Tooltip, Checkbox } from "components/common";
import { ButtonTypes, TableScheduleTypes } from "common/enums";
import { IScheduleFilter } from "../../types";
import styles from "./styles.module.scss";
import MultiSelect, {
  IMultiSelectOption,
} from "components/common/multi-select";
import InteractiveTooltip, {
  IModalItem,
} from "components/common/interactive-tooltip";
import chainIcon from "assets/chainIcon.png";
import { AssignmentType } from "../../helpers";
import moment from "moment";
import { ISelectOption } from "../../../../../common/models/select";

interface IProps {
  days: number;
  warnings?: IModalItem[];
  datesList: Date[] | undefined;
  tableType: TableScheduleTypes;
  filterValues: IScheduleFilter;
  assignmentType?: AssignmentType;
  simultaneousDnd?: boolean;
  onChangeFilterValue: (values: IScheduleFilter) => void;
  onShowUnscoredGames: () => void;
  toggleSimultaneousDnd: () => void;
}

const ScoringFilter = (props: IProps) => {
  const {
    warnings,
    tableType,
    datesList,
    filterValues,
    assignmentType,
    simultaneousDnd,
    onChangeFilterValue,
    onShowUnscoredGames,
    toggleSimultaneousDnd,
  } = props;

  const {
    divisionsOptions,
    timeOptions,
    teamsOptions,
    fieldsOptions,
    poolsOptions,
  } = filterValues;

  const [isUnscoredGames, setIsUnscoredGames] = useState(false);
  const dates: string[] = [
    ...new Set(
      datesList
        ? datesList
            .sort((a: Date, b: Date) => (a && b ? (a > b ? 1 : -1) : 0))
            .map((v: Date) => moment(v).format("MMM D"))
        : []
    ),
  ];

  const dateSelect: ISelectOption[] = dates.map(
    (date: string, key: number) => ({
      label: date,
      value: key + 1,
    })
  );

  const onDaySelect = (day: string) => {
    onChangeFilterValue({
      ...filterValues,
      selectedDay: day,
    });
  };

  const onSelectUpdate = (name: string, options: IMultiSelectOption[]) => {
    onChangeFilterValue({
      ...filterValues,
      [name]: options,
    });
  };

  const onSetUnscoredGames = () => {
    setIsUnscoredGames(!isUnscoredGames);
    onShowUnscoredGames();
  };

  const days = [...Array(props.days)].map((_v, i) => `${i + 1}`);
  return (
    <section className={styles.section}>
      <h3 className="visually-hidden">Scoring filters</h3>
      <form className={styles.scoringForm}>
        <div className={styles.selectsContainer}>
          {days?.length > 0 && days?.length <= 2 && (
            <div className={styles.buttonsWrapper}>
              {days.map((day: string) => (
                <Button
                  onClick={() => onDaySelect(day)}
                  label={dates[Number(day) - 1]}
                  variant="contained"
                  color="primary"
                  type={
                    filterValues.selectedDay === day
                      ? ButtonTypes.SQUARED
                      : ButtonTypes.SQUARED_OUTLINED
                  }
                  key={day}
                />
              ))}
            </div>
          )}
          {days?.length > 2 && (
            <div className={styles.daySelectWrapper}>
              <Select
                options={dateSelect}
                value={filterValues.selectedDay || dateSelect?.values()[0]}
                label="Day Selection"
                onChange={(item: any) => onDaySelect(item?.target.value)}
              />
            </div>
          )}
          <div className={styles.selectsContainer}>
            {timeOptions && timeOptions?.length > 0 && (
              <fieldset className={styles.selectWrapper}>
                <legend className={styles.selectTitle}>Timeslots</legend>
                <MultiSelect
                  name="timeOptions"
                  selectOptions={timeOptions!}
                  onChange={onSelectUpdate}
                />
              </fieldset>
            )}

            <fieldset className={styles.selectWrapper}>
              <legend className={styles.selectTitle}>Divisions</legend>
              <MultiSelect
                name="divisionsOptions"
                selectOptions={divisionsOptions}
                onChange={onSelectUpdate}
              />
            </fieldset>
            {tableType === TableScheduleTypes.SCHEDULES &&
              poolsOptions &&
              poolsOptions?.length > 0 && (
                <fieldset className={styles.selectWrapper}>
                  <legend className={styles.selectTitle}>Pools</legend>
                  <MultiSelect
                    name="poolsOptions"
                    selectOptions={poolsOptions}
                    onChange={onSelectUpdate}
                  />
                </fieldset>
              )}
            <fieldset className={styles.selectWrapper}>
              <legend className={styles.selectTitle}>Teams</legend>
              <MultiSelect
                name="teamsOptions"
                selectOptions={teamsOptions}
                onChange={onSelectUpdate}
              />
            </fieldset>
            <fieldset className={styles.selectWrapper}>
              <legend className={styles.selectTitle}>Fields</legend>
              <MultiSelect
                name="fieldsOptions"
                selectOptions={fieldsOptions}
                onChange={onSelectUpdate}
              />
            </fieldset>
            {warnings && warnings.length > 0 ? (
              <InteractiveTooltip title="Scheduling Warning" items={warnings} />
            ) : null}
            {tableType === TableScheduleTypes.SCHEDULES && (
              <Tooltip type="info" title="Move both teams simultaneously">
                <div style={{ marginLeft: "15px", marginBottom: "2px" }}>
                  <Button
                    icon={
                      <img
                        src={chainIcon}
                        style={{
                          width: "18px",
                          height: "18px",
                          filter: "invert(1)",
                        }}
                        alt=""
                      />
                    }
                    label={simultaneousDnd ? "On" : "Off"}
                    variant="contained"
                    color="primary"
                    disabled={assignmentType === AssignmentType.Matchups}
                    onClick={toggleSimultaneousDnd}
                  />
                </div>
              </Tooltip>
            )}
          </div>
          {tableType === TableScheduleTypes.SCORES && (
            <div className={styles.checkbox}>
              <Checkbox
                options={[
                  {
                    label: "Unscored Games Only",
                    checked: isUnscoredGames,
                  },
                ]}
                formLabel=""
                onChange={onSetUnscoredGames}
              />
            </div>
          )}
        </div>
      </form>
    </section>
  );
};

export default ScoringFilter;
