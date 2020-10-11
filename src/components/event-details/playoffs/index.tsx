import React, { useEffect } from "react";
import {
  SectionDropdown,
  HeadingLevelThree,
  Checkbox,
  CardMessage,
  Radio,
  Select,
  Input,
} from "components/common";
import { CardMessageTypes } from "components/common/card-message/types";
import { EventMenuTitles } from "common/enums";

import styles from "../styles.module.scss";

import { IInputEvent } from "common/types";
import { IEventDetails } from "common/models";


const CARD_MESSAGE_STYLES = {
  marginBottom: 10,
  width: "100%",
};

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

const bracketTypeOptions = [
  "Single Elimination (NCAA Brackets)",
  "Double Elimination",
  "3 Game Guarantee",
];

const bracketLevelOptions = [
  "Across the Division",
  "Within Each Pool",
];


const topNumberOfTeams = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
];

enum bracketTypesEnum {
  "Single Elimination (NCAA Brackets)" = 1,
  "Double Elimination" = 2,
  "3 Game Guarantee" = 3,
}

enum bracketLevelEnum {
  "Across the Division" = 1,
  "Within Each Pool" = 2,
}


enum numTeamsBracketEnum {
  "Top:" = 1,
  "All" = 2,
}

interface Props {
  eventData: Partial<IEventDetails>;
  onChange: any;
  isSectionExpand: boolean;
}

const PlayoffsSection: React.FC<Props> = ({
  eventData,
  onChange,
  isSectionExpand,
}: Props) => {
  const [isPlayoffCommentsEnabled, togglePlayOffComments] = React.useState(
    false
  );
  const [playoffComments, playoffCommentsChange] = React.useState("");

  const {
    playoffs_exist,
    bracket_type,
    bracket_level,
    num_teams_bracket,
    bracket_durations_vary,
    multiday_playoffs_YN,
    auto_adv_playoffs_YN,
    custom_playoffs_YN,
    bracket_warmup,
    bracket_division_duration,
    bracket_time_btwn_periods,
    bracket_duration,
    periods_per_game,
  } = eventData;

  React.useEffect(() => {
    onBracketGameDuration();
  }, [
    bracket_warmup,
    bracket_division_duration,
    bracket_time_btwn_periods,
    periods_per_game,
  ]);

  const bracketGameDurationOpts = [
    {
      label: "Bracket Games have Different Game Durations",
      checked: Boolean(bracket_durations_vary),
    },
  ];

  const playoffsCommentsOpts = [
    {
      label: "Add Detailed Explanation of Playoffs",
      checked: Boolean(isPlayoffCommentsEnabled),
    },
  ];

  const handleTogglePlayoffComments = (event: InputTargetValue) => {
    const { checked } = event.target;

    if (playoffComments !== "") {
      onChange("playoff_comments", checked ? playoffComments : "");
    }
    togglePlayOffComments(checked);
  };

  const onPlayoffCommentsChange = ({ target }: IInputEvent) => {
    const { value } = target;

    playoffCommentsChange(value);
    onChange("playoff_comments", value);
  };

  const onPlayoffs = () => 
    onChange("playoffs_exist", playoffs_exist ? 0 : 1);
  
  const onMultidayPlayoffs = () =>
    onChange("multiday_playoffs_YN", multiday_playoffs_YN ? 0 : 1);
  
  const onAutoAdvPlayoffs = () =>
    onChange("auto_adv_playoffs_YN", auto_adv_playoffs_YN ? 0 : 1);

  const onCustomPlayoffs = () =>
    onChange("custom_playoffs_YN", custom_playoffs_YN ? 0 : 1);

  const onChangeBracketType = (e: InputTargetValue) =>
    onChange("bracket_type", bracketTypesEnum[e.target.value]);
  
  const onChangeBracketLevelType = (e: InputTargetValue) =>
    onChange("bracket_level", bracketLevelEnum[e.target.value]);

  const onNumberOfTeamsChange = (e: InputTargetValue) =>
    onChange(
      "num_teams_bracket",
      e.target.value === numTeamsBracketEnum[2]
        ? null
        : Number(topNumberOfTeams[topNumberOfTeams.length - 1])
    );

  const onChangeMaxTeamNumber = (e: InputTargetValue) =>
    onChange("num_teams_bracket", Number(e.target.value));

  const onChangeBracketWarmup = (e: InputTargetValue) => {
    onChange("bracket_warmup", Number(e.target.value));
  }

  const onChangeBracketDivisionDuration = (e: InputTargetValue) => {
    onChange("bracket_division_duration", Number(e.target.value));
  }

  const onChangeBracketTimeBtwnPeriods = (e: InputTargetValue) => {
    onChange("bracket_time_btwn_periods", Number(e.target.value));
  }

  const onBracketGameDuration = () => {
    const countBtwnPeriod = periods_per_game ? periods_per_game - 1 : 1;
    const currentBracketDuration =
      (periods_per_game || 1) * Number(bracket_division_duration! || 0) +
      Number(bracket_warmup! || 0) +
      Number(bracket_time_btwn_periods! || 0) * countBtwnPeriod;
    onChange("bracket_duration", currentBracketDuration);
  }

  const onBracketGameDurationVary = () =>
    onChange("bracket_durations_vary", bracket_durations_vary ? 0 : 1);

  useEffect(() => {
    if (playoffs_exist && !bracket_type) {
      onChange("bracket_type", bracketTypesEnum["Single Elimination (NCAA Brackets)"]);
    }
  });

  useEffect(() => {
    const { playoff_comments } = eventData;
    if (playoff_comments) {
      togglePlayOffComments(true);
      playoffCommentsChange(playoff_comments);
    } else {
      togglePlayOffComments(false);
    }
  }, [eventData]);

  return (
    <SectionDropdown
      id={EventMenuTitles.PLAYOFFS}
      type="section"
      panelDetailsType="flat"
      useShadow={true}
      expanded={isSectionExpand}
    >
      <HeadingLevelThree>
        <span className={styles.blockHeading}>Playoffs</span>
      </HeadingLevelThree>
      <div style={ {width: '100%' }}>
        <CardMessage
          style={CARD_MESSAGE_STYLES}
          type={CardMessageTypes.EMODJI_OBJECTS}
        >
          If you do not see something here, request an enhancement using the help function on the top menu bar!
        </CardMessage>
        <div className={styles.playoffsDetails}>
          <div className={styles.pdFirst}>
            <div className={styles.pdFirstInnerContainer}>
              <Checkbox
                formLabel=""
                options={[
                  { label: "Event has Playoffs", checked: Boolean(playoffs_exist) },
                ]}
                onChange={onPlayoffs}
              />
            </div>
            {playoffs_exist !== 0 && (
              <div className={styles.pdFirstInnerContainer}>
                <Checkbox
                  formLabel=""
                  options={[
                    {
                      label: "Playoffs Span Multiple Days",
                      checked: Boolean(multiday_playoffs_YN),
                    },
                  ]}
                  onChange={onMultidayPlayoffs}
                />
              </div>
            )}
            {playoffs_exist !== 0 && (
              <div className={styles.pdFirstInnerContainer}>
                <Checkbox
                  formLabel=""
                  options={[
                    {
                      label: "Auto Adv Playoffs after Pool Play is Scored",
                      checked: Boolean(auto_adv_playoffs_YN),
                    },
                  ]}
                  onChange={onAutoAdvPlayoffs}
                />
              </div>
            )}
          </div>
          {Boolean(playoffs_exist) && (
            <>
              <div className={styles.pdSecond}>
                <div className={styles.pdSecondinnerContainer}>
                  <Radio
                    formLabel="Bracket Type"
                    options={bracketTypeOptions}
                    onChange={onChangeBracketType}
                    checked={bracketTypesEnum[bracket_type!]}
                  />
                </div>
                <div className={styles.pdSecondinnerContainer}>
                  <Radio
                    formLabel="Brackets Exist:"
                    options={bracketLevelOptions}
                    onChange={onChangeBracketLevelType}
                    checked={bracketLevelEnum[bracket_level || 1]}
                  />
                </div>
                <div className={styles.pdSecondinnerContainer}>
                  <Radio
                    formLabel="# of Teams that Advance:"
                    options={[ "All", "Top:"]}
                    onChange={onNumberOfTeamsChange}
                    checked={numTeamsBracketEnum[num_teams_bracket ? 1 : 2]}
                  />
                  <div className={styles.select}>
                    <Select
                      label=""
                      disabled={!num_teams_bracket}
                      options={topNumberOfTeams.map((type) => ({
                        label: type,
                        value: type,
                      }))}
                      value={String(num_teams_bracket || "")}
                      onChange={onChangeMaxTeamNumber}
                    />
                  </div>
                </div>
                <div className={styles.pdSecondinnerContainer}>
                  <Checkbox
                    options={playoffsCommentsOpts}
                    onChange={handleTogglePlayoffComments}
                  />
                  {isPlayoffCommentsEnabled ? (
                    <Input
                      value={playoffComments}
                      fullWidth={true}
                      onChange={onPlayoffCommentsChange}
                      multiline={true}
                    />
                  ) : (
                    <Input
                      value={playoffComments}
                      fullWidth={true}
                      onChange={onPlayoffCommentsChange}
                      disabled={true}
                    />
                  )}
                </div>
              </div>
              <div className={styles.pdThird}>
                {playoffs_exist !== 0 && (
                  <Checkbox
                    formLabel=""
                    options={[
                      {
                        label: "Enable Custom Bracket Construction",
                        checked: Boolean(custom_playoffs_YN),
                      },
                    ]}
                    onChange={onCustomPlayoffs}
                  />
                )}
                <Checkbox
                  options={bracketGameDurationOpts}
                  onChange={onBracketGameDurationVary}
                />
              </div>
              {Boolean(bracket_durations_vary) && (
                <div className={styles.pdFourth}>
                  <Input
                    fullWidth={true}
                    endAdornment="Minutes"
                    label="Pregame Warmup"
                    value={bracket_warmup || "0"}
                    onChange={onChangeBracketWarmup}
                  />
                  <span className={styles.innerSpanText}>&nbsp;+&nbsp;</span>
                  <Input
                    fullWidth={true}
                    endAdornment="Minutes"
                    label="Time Division Duration"
                    value={bracket_division_duration || "0"}
                    onChange={onChangeBracketDivisionDuration}
                  />
                  <span className={styles.innerSpanText}>
                    &nbsp;({periods_per_game || "0"})&nbsp;+&nbsp;
                  </span>
                  <Input
                    fullWidth={true}
                    endAdornment="Minutes"
                    label="Time Between Periods"
                    value={bracket_time_btwn_periods || "0"}
                    onChange={onChangeBracketTimeBtwnPeriods}
                  />
                  <span className={styles.innerSpanText}>
                    &nbsp;=&nbsp;{bracket_duration}&nbsp; Minutes Total Runtime
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SectionDropdown>
  );
};

export default PlayoffsSection;
