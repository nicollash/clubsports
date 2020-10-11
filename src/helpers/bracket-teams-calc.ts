import { IDivision } from "../common/models/division";

const MinBracketTeamsCount = (
  divisions: IDivision[] | undefined,
  bracketTeamsNum: number
) =>
  divisions
    ? divisions.reduce(
        (counter: number, div: IDivision) =>
          div.teams?.length > 0 && div.teams?.length < counter
            ? div.teams?.length
            : counter,
        bracketTeamsNum
      )
    : bracketTeamsNum;

export { MinBracketTeamsCount };
