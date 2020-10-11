export interface IScoringSetting {
  hasGoalsScored: boolean;
  hasGoalsAllowed: boolean;
  hasGoalsDifferential: boolean;
  hasTies: boolean;
  maxGoalDifferential: number | null;
}
