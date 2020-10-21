import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { ITeam } from "common/models";
import SelectSeed from "./select-seed";
import { IInputEvent } from "common/types";
import { sortByField } from "helpers";
import { SortByFilesTypes } from "common/enums";
import {
  generateGameNumbers,
  ordinalSuffixOf,
} from "components/playoffs/helper";
import {
  bracketSourceTypeEnum,
  IBracketGame,
} from "components/playoffs/bracketGames";
import { IPlayoffSortedTeams } from "../../logic/actions";
import { connect } from "react-redux";
import { IAppState } from "../../../../reducers/root-reducer.types";

enum SourceTypeEnum {
  BYE = "Bye",
  TEAM = "Team",
  POOL = "Pool",
  LOSER = "Loser",
  SOURCE = "Source",
  WINNER = "Winner",
  DIVISION = "Division",
}

interface IProps {
  teams?: ITeam[];
  score?: number;
  game: IBracketGame;
  typeTeam: string;
  gameCount: number;
  sourcesOptions: { label: string; value: string }[];
  topNumberOfTeam: number | null | undefined;
  onChange: (fields: string[]) => void;
  sortedTeams: IPlayoffSortedTeams | null;
}

const NewSeed = ({
  game,
  teams,
  typeTeam,
  gameCount,
  sourcesOptions,
  topNumberOfTeam,
  onChange,
  sortedTeams,
}: IProps) => {
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const sourceId =
    typeTeam === "AwayTeam" ? "awaySourceValue" : "homeSourceValue";
  const sourcePoolId =
    typeTeam === "AwayTeam" ? "awaySourceId" : "homeSourceId";
  const sourceType =
    typeTeam === "AwayTeam" ? "awaySourceType" : "homeSourceType";

  const teamsFromPool =
    teams && topNumberOfTeam && teams.length > topNumberOfTeam
      ? teams?.slice(0, topNumberOfTeam!).filter((t: ITeam) => {
          return game[sourcePoolId]
            ? t.pool_id === game[sourcePoolId]
            : t.pool_id === selectedPoolId;
        })
      : teams?.filter((t: ITeam) => {
          return game[sourcePoolId]
            ? t.pool_id === game[sourcePoolId]
            : t.pool_id === selectedPoolId;
        });

  const teamsFromDivision =
    teams && topNumberOfTeam && teams.length > topNumberOfTeam
      ? teams?.slice(0, topNumberOfTeam!)
      : teams;

  const subSource = {
    team: teams?.map((t: ITeam) => ({
      label: t.short_name,
      value: t.team_id,
    })),
    division: teamsFromDivision?.map((_t: ITeam, index) => {
      return {
        label: ordinalSuffixOf(index + 1),
        value: index + 1,
      };
    }),
    pool: teamsFromPool?.map((_t: ITeam, index) => {
      return {
        label: ordinalSuffixOf(index + 1),
        value: index + 1,
      };
    }),
    winnerLoser: generateGameNumbers(gameCount, game.index),
  };

  const teamSource =
    subSource && subSource.team
      ? sortByField(subSource.team, SortByFilesTypes.LABEL)
      : [];

  const divisionSource =
    subSource && subSource.division
      ? sortByField(subSource.division, SortByFilesTypes.LABEL)
      : [];

  const poolSource =
    subSource && subSource.pool
      ? sortByField(subSource.pool, SortByFilesTypes.LABEL)
      : [];
  const [selectedSource, setSelectedSource] = useState<string | number>(
    sourcesOptions[0].value
  );
  const [selectedValueSubSource, setSelectedValueSubSource] = useState<
    string | number
  >(teamSource[0].value);
  const [selectedSubSourceOptions, setSelectedSubSourceOptions] = useState<
    { label: string; value: string | number }[]
  >(teamSource);

  useEffect(() => {
    if (typeTeam === "AwayTeam") {
      if (game && game.awaySourceType) {
        onSetSourceOption(game.awaySourceType);
        if (
          game.awaySourceId &&
          game.awaySourceType === bracketSourceTypeEnum.Pool
        ) {
          onSetSourceOption(game.awaySourceId);
        }
        if (game.awaySourceValue) {
          onSetSubSourceOption(game.awaySourceValue);
        }
      }
    } else {
      if (game && game.homeSourceType) {
        onSetSourceOption(game.homeSourceType);
        if (
          game.homeSourceId &&
          game.homeSourceType === bracketSourceTypeEnum.Pool
        ) {
          onSetSourceOption(game.homeSourceId);
        }
        if (game.homeSourceValue) {
          onSetSubSourceOption(game.homeSourceValue);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (selectedPoolId) {
      setSelectedSubSourceOptions(poolSource);
      if (
        !!game[sourceId] &&
        poolSource?.length > 1 &&
        game[sourceType] === bracketSourceTypeEnum.Pool
      ) {
        setSelectedValueSubSource(
          poolSource[+(game[sourceId] || 1) - 1]?.value
        );
      } else {
        setSelectedValueSubSource(poolSource[0]?.value);
      }
    }
  }, [selectedPoolId]);

  const onSetSubSourceOption = (value: string | number) => {
    const changedValues: string[] = [];

    setSelectedValueSubSource(value);
    changedValues[sourceId] = value;

    onChange(changedValues);
  };

  const onSetSourceOption = (value: string) => {
    const changedValues: any[] = [];

    setSelectedSource(value);

    switch (value) {
      case SourceTypeEnum.SOURCE || undefined:
        setSelectedSource(sourcesOptions[0].value);
        changedValues[sourceId] = undefined;
        changedValues[sourceType] = undefined;
        break;
      case SourceTypeEnum.BYE:
        changedValues[sourceType] = SourceTypeEnum.BYE;
        changedValues[sourceId] = 0;
        break;
      case SourceTypeEnum.TEAM:
        setSelectedValueSubSource(teamSource[0].value);
        setSelectedSubSourceOptions(teamSource);
        changedValues[sourceId] = teamSource[0].value;
        changedValues[sourceType] = value;
        break;
      case SourceTypeEnum.DIVISION:
        setSelectedValueSubSource(divisionSource[0].value);
        setSelectedSubSourceOptions(divisionSource);
        changedValues[sourceId] = divisionSource[0].value.toString();
        changedValues[sourceType] = value;
        break;
      case SourceTypeEnum.WINNER:
      case SourceTypeEnum.LOSER:
        if (subSource.winnerLoser) {
          setSelectedValueSubSource(subSource.winnerLoser[0].value);
          setSelectedSubSourceOptions(subSource.winnerLoser);
          changedValues[sourceId] = subSource.winnerLoser[0].value.toString();
          changedValues[sourceType] = value;
        }
        break;
      case SourceTypeEnum.POOL:
        setSelectedPoolId(game[sourcePoolId]!);
        setSelectedSource(game[sourcePoolId]!);
        setSelectedValueSubSource(game[sourceId]!);
        setSelectedSubSourceOptions(poolSource);
        changedValues[sourceType] = SourceTypeEnum.POOL;
        changedValues[sourcePoolId] = value;
      default:
        setSelectedPoolId(value);
        changedValues[sourceType] = SourceTypeEnum.POOL;
        changedValues[sourcePoolId] = value;
        changedValues[sourceId] = game[sourceId] || "1";
        break;
    }

    if (changedValues) onChange(changedValues);
  };

  const onChangeSource = (e: IInputEvent) => {
    const { value } = e.target;
    e.stopPropagation();
    setSelectedSource(value);
    onSetSourceOption(value);
  };

  const onChangeSubSource = (e: IInputEvent) => {
    e.stopPropagation();
    onSetSubSourceOption(e.target.value);
  };

  const currentTeams =
    sortedTeams && selectedSource === "Division" && game.divisionId
      ? sortedTeams[game.divisionId]
      : sortedTeams && selectedSource === "Pool" && game.poolId
      ? sortedTeams[game.poolId]
      : undefined;
  const selectedTeam = currentTeams
    ? currentTeams[+selectedValueSubSource - 1]
    : undefined;

  const teamName = selectedTeam
    ? selectedTeam.short_name
    : typeTeam === "AwayTeam" && game.awayTeamId
    ? teams?.find((t: ITeam) => t.team_id === game.awayTeamId)?.short_name
    : typeTeam === "HomeTeam" && game.homeTeamId
    ? teams?.find((t: ITeam) => t.team_id === game.homeTeamId)?.short_name
    : undefined;

  return teamName ? (
    <span>{teamName}</span>
  ) : (
    <div className={styles.TeamSource}>
      <SelectSeed
        value={selectedSource}
        options={sourcesOptions}
        onChange={onChangeSource}
      />
      {selectedSource !== "Source" && selectedSource !== "Bye" && (
        <SelectSeed
          stretch={true}
          value={selectedValueSubSource}
          options={selectedSubSourceOptions}
          onChange={onChangeSubSource}
        />
      )}
    </div>
  );
};

const mapStateToProps = ({ playoffs }: IAppState) => ({
  sortedTeams: playoffs?.sortedTeams,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(NewSeed);
