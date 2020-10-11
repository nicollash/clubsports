import React from 'react';
import { Tooltip } from 'components/common';
import { TooltipMessageTypes } from 'components/common/tooltip-message/types';
import { IScoringSetting } from 'common/models';

interface Props {
  scoringSettings: IScoringSetting;
}

const getHeadingWithTooltip = (heading: string, message: string) => (
  <th>
    <Tooltip type={TooltipMessageTypes.INFO} title={message}>
      <span>{heading}</span>
    </Tooltip>
  </th>
);

const GroupItemHeader = ({ scoringSettings }: Props) => (
  <thead>
    <tr>
      <th>Team</th>
      {getHeadingWithTooltip('W', 'Wins')}
      {getHeadingWithTooltip('L', 'Losses')}
      {scoringSettings.hasTies && getHeadingWithTooltip('T', 'Ties')}
      {scoringSettings.hasGoalsScored &&
        getHeadingWithTooltip('GS', 'Goals Scored')}
      {scoringSettings.hasGoalsAllowed &&
        getHeadingWithTooltip('GA', 'Goals Allowed')}
      {scoringSettings.hasGoalsDifferential &&
        getHeadingWithTooltip('GD', 'Goals Differential')}
    </tr>
  </thead>
);

export default GroupItemHeader;
