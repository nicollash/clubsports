import React, { useState } from "react";
import { History } from "history";

import DivisionItem from "../division-item";
import Button from "components/common/buttons/button";
import { CardMessageTypes } from "components/common/card-message/types";
import { SectionDropdown, CardMessage } from "components/common";
import { IDivision, IPool, ITeam, BindingAction } from "common/models";
import {
  EventMenuTitles,
  SortByFilesTypes,
  ButtonVariant,
  ButtonColors,
} from "common/enums";
import { sortByField } from "helpers";

import styles from "./styles.module.scss";

interface Props {
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeam[];
  eventId: string | undefined;
  history: History;
  onImportFromCsv: BindingAction;
  onImportFromCoacheCsv: BindingAction;
  loadPools: (divisionId: string) => void;
  onEditPopupOpen: (contactId: string, team: ITeam, division: IDivision, poolName: string) => void;
  onDeleteAllTeams: (divisionId: string) => void;
}

const TeamManagement = ({
  divisions,
  teams,
  pools,
  history,
  eventId,
  onImportFromCsv,
  onImportFromCoacheCsv,
  loadPools,
  onEditPopupOpen,
  onDeleteAllTeams,
}: Props) => {
  const [isSectionsExpand, toggleSectionCollapse] = useState<boolean>(false);
  const [isDropdownExpand, toggleDropdownExpand] = useState<boolean>(false);

  const onToggleSectionCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSectionsExpand) {
      toggleDropdownExpand(true);
    }
    toggleSectionCollapse(!isSectionsExpand);
  };

  const sortedDivisions = sortByField(divisions, SortByFilesTypes.DIVISIONS);

  const onCreateTeam = () => {
    const path = eventId
      ? `/event/teams-create/${eventId}`
      : "/event/teams-create";

    history.push(path);
  };
  return (
    <li>
      <SectionDropdown
        id={EventMenuTitles.TEAM_MANAGEMENT}
        type="section"
        isDefaultExpanded={true}
        expanded={isDropdownExpand}
        onToggle={() => toggleDropdownExpand(!isDropdownExpand)}
        useShadow={true}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>Team Management</div>
          <div className={styles.sectionRow}>
            <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
              Expert Tip: Only include Division Year in the Team Name if the
              team is "playing up"! Otherwise, please leave it out, as it is
              embedded in the Division Name.
            </CardMessage>
            <div className={styles.sectionItem} />
          </div>
          <div className={styles.buttonContainer}>
            {divisions.length ? (
              <Button
                label={isSectionsExpand ? "Collapse All" : "Expand All"}
                variant="text"
                color="secondary"
                onClick={onToggleSectionCollapse}
              />
            ) : null}
          </div>
        </div>
        <ul className={styles.divisionList}>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={onImportFromCsv}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              label="Import Team List from CSV"
            />
            <Button
              onClick={onImportFromCoacheCsv}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              label="Import Coaches List from CSV"
            />
            <Button
              onClick={onCreateTeam}
              variant={ButtonVariant.CONTAINED}
              color={ButtonColors.PRIMARY}
              label="+ Create Team"
            />
          </div>
          {sortedDivisions.map((division) => (
            <DivisionItem
              division={division}
              pools={pools.filter(
                (pool) => pool.division_id === division.division_id
              )}
              teams={teams}
              loadPools={loadPools}
              onEditPopupOpen={onEditPopupOpen}
              onDeleteAllTeams={onDeleteAllTeams}
              key={division.division_id}
              isSectionExpand={isSectionsExpand}
            />
          ))}
        </ul>
      </SectionDropdown>
    </li>
  );
};

export default TeamManagement;
