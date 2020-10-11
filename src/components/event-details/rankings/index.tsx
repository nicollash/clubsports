import React from 'react';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Dnd from '../dnd';
import {
  SectionDropdown,
  HeadingLevelThree,
  CardMessage,
  Checkbox,
  Select,
} from 'components/common';
import { IEventDetails } from 'common/models';
import { EventMenuTitles } from 'common/enums';
import { CardMessageTypes } from 'components/common/card-message/types';
import { IInputEvent } from 'common/types';
import { defaultRankingFactor } from '../state';
import styles from '../styles.module.scss';

const MAX_GOAL_ALLOWED_COUNT = 16;

const goalAllowedSelectOptions = Array.from(
  new Array(MAX_GOAL_ALLOWED_COUNT),
  (_, idx) => ({
    label: idx.toString(),
    value: idx.toString(),
  })
);

enum rankingFactors {
  'rankingFactorDivisions' = 'ranking_factor_divisions',
  'rankingFactorPools' = 'ranking_factor_pools',
}

interface Props {
  eventData: Partial<IEventDetails>;
  onChange: any;
  isSectionExpand: boolean;
}

const Rankings = ({ eventData, onChange, isSectionExpand }: Props) => {
  const {
    ranking_factor_divisions,
    ranking_factor_pools,
    max_goal_differential,
  } = eventData;

  const [isGoalCheckboxAllowed, toggleGoalCheckbox] = React.useState<boolean>(
    Boolean(max_goal_differential)
  );

  const onChangeGoalCheckbox = () => {
    if (max_goal_differential) {
      onChange('max_goal_differential', null);

      toggleGoalCheckbox(false);
    } else {
      toggleGoalCheckbox(true);
    }
  };

  const onRankingFactorReorder = (
    name: string,
    cards: { id: number; text: string }[]
  ) => {
    const rankingFactor = JSON.stringify(cards.map(card => card.id));

    onChange(rankingFactors[name], rankingFactor);
  };

  const parseRankingFactor = (factor?: string) => {
    return factor
      ? JSON.parse(factor).map((fact: number) => ({
          id: fact,
          text: defaultRankingFactor[fact - 1].text,
        }))
      : defaultRankingFactor;
  };

  const rankingFactorDivisions = parseRankingFactor(ranking_factor_divisions);

  const rankingFactorPools = parseRankingFactor(ranking_factor_pools);

  const goalAllowedCheckboxOptions = [
    {
      label: 'Cap Goals Allowed Differential',
      checked: isGoalCheckboxAllowed,
    },
  ];

  const onGoalAllowedChage = (evt: IInputEvent) => {
    onChange('max_goal_differential', evt.target.value);
  };

  return (
    <SectionDropdown
      id={EventMenuTitles.RANKINGS}
      type="section"
      panelDetailsType="flat"
      useShadow={true}
      expanded={isSectionExpand}
    >
      <HeadingLevelThree>
        <div className={`${styles.blockHeading} ${styles.headerQuickstart}`}><span>{EventMenuTitles.RANKINGS}</span></div> 
      </HeadingLevelThree>
      <div className={styles.playoffsDetails}>
        <div className={styles.pdThird}>
          <div className={styles.dndTitleWrapper}>
            <span>Ranking Factors (Within Divisions)</span>
            <span>Ranking Factors (Within Pools)</span>
          </div>
          <div className={styles.dndWrapper}>
            <DndProvider backend={HTML5Backend}>
              <Dnd
                name="rankingFactorDivisions"
                cards={rankingFactorDivisions}
                onUpdate={onRankingFactorReorder.bind(
                  undefined,
                  'rankingFactorDivisions'
                )}
              />
              <Dnd
                name="rankingFactorPools"
                cards={rankingFactorPools}
                onUpdate={onRankingFactorReorder.bind(
                  undefined,
                  'rankingFactorPools'
                )}
              />
            </DndProvider>
          </div>

          <div className={styles.tooltipWrapper}>
            <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
              Drag and Drop to reorder Ranking Factors
            </CardMessage>
            <div className={styles.checkBoxWrapper}>
              <Checkbox
                onChange={onChangeGoalCheckbox}
                options={goalAllowedCheckboxOptions}
              />
              {isGoalCheckboxAllowed && (
                <Select
                  onChange={onGoalAllowedChage}
                  options={goalAllowedSelectOptions}
                  value={max_goal_differential || ''}
                />
              )}
            </div>
            <div className={styles.heading}>
              <a
                href="https://tourneymaster.s3.amazonaws.com/public/Quickstarts/Tourney+Master+Factors+and+Calculations+for+Rankings.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                FAQs for Rankings
              </a>
            </div>
          </div>
        </div>
      </div>
    </SectionDropdown>
  );
};

export default Rankings;
