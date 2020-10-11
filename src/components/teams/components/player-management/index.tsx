import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { History } from "history";
import MaterialTable, { Column } from "material-table";
import { Menu, MenuItem, TextField } from "@material-ui/core";

import { SectionDropdown } from "components/common";
import DeletePopupConfirm from "components/common/delete-popup-confirm";
import Button from "components/common/buttons/button";
import { BindingAction, IPlayer, ITeam, IDivision } from "common/models";
import {
  EventMenuTitles,
  ButtonVariant,
  ButtonColors,
  Icons,
} from "common/enums";
import { getIcon } from "helpers/get-icon.helper";
// import TeamPlayersItem from "../team-players-item";

import styles from "../team-management/styles.module.scss";
import { IAppState } from "reducers/root-reducer.types";

interface Props {
  history: History;
  teams: ITeam[];
  players: IPlayer[];
  eventId: string | undefined;
  onEditPopupOpen: (player: IPlayer[]) => void;
  onChangePlayer: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeTeamPopupOpen: (player: IPlayer[]) => void;
  onImportFromCsv: BindingAction;
  onDeletePlayer: (player: IPlayer[]) => void;
  onSavePlayer: () => void;
}

const PlayerManagement = ({
  history,
  teams,
  players,
  eventId,
  onEditPopupOpen,
  onDeletePlayer,
  onChangePlayer,
  onChangeTeamPopupOpen,
  onImportFromCsv,
  onSavePlayer,
}: Props) => {
  const [isSectionsExpand, toggleSectionCollapse] = useState<boolean>(false);
  const [isDeleteModal, setDeleteModal] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [rowData, setRowData] = useState<IPlayer[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { divisions } = useSelector((state: IAppState) => state.teams);
  const deleteMessage = `You are about to delete player(s) from this registration and this cannot be undone. Please type the word "DELETE" in the below box to continue.`;

  const columns: Column<any>[] = useMemo(
    () => [
      {
        title: "Division",
        field: "division_name",
        type: "string",
        defaultSort: "asc",
        cellStyle: {
          textAlign: "left",
          paddingLeft: 30,
        },
        headerStyle: {
          textAlign: "left",
          paddingLeft: 30,
        },
      },
      {
        title: "Team",
        field: "team_name",
        type: "string",
        defaultSort: "asc",
        cellStyle: {
          textAlign: "left",
          paddingLeft: 30,
        },
        headerStyle: {
          textAlign: "left",
          paddingLeft: 30,
        },
      },
      {
        title: "Last Name",
        field: "last_name",
        type: "string",
        cellStyle: {
          textAlign: "left",
          paddingLeft: 36,
        },
        render: (row) => {
          if (isEditing && rowData[0].team_player_id === row.team_player_id) {
            return (
              <TextField
                value={rowData[0].last_name}
                name="last_name"
                InputProps={{
                  className: styles.input,
                }}
                onChange={onChangeCell}
              />
            );
          }
          return <p>{row.last_name}</p>;
        },
      },
      {
        title: "First Name",
        field: "first_name",
        type: "string",
        cellStyle: {
          textAlign: "left",
          paddingLeft: 16,
        },
        render: (row) => {
          if (isEditing && rowData[0].team_player_id === row.team_player_id) {
            return (
              <TextField
                value={rowData[0].first_name}
                name="first_name"
                InputProps={{
                  className: styles.input,
                }}
                onChange={onChangeCell}
              />
            );
          }
          return <p>{row.first_name}</p>;
        },
      },
      {
        title: "Email",
        field: "player_email",
        type: "string",
        cellStyle: {
          textAlign: "left",
          paddingLeft: 16,
        },
        render: (row) => {
          if (isEditing && rowData[0].team_player_id === row.team_player_id) {
            return (
              <TextField
                value={rowData[0].player_email}
                name="player_email"
                InputProps={{
                  className: styles.input,
                }}
                onChange={onChangeCell}
              />
            );
          }
          return <p>{row.player_email}</p>;
        },
      },
      {
        title: "Jersey Number",
        field: "jersey_number",
        type: "string",
        defaultSort: "asc",
        cellStyle: {
          textAlign: "center",
        },
        render: (row) => {
          if (isEditing && rowData[0].team_player_id === row.team_player_id) {
            return (
              <TextField
                value={rowData[0].jersey_number}
                name="jersey_number"
                InputProps={{
                  className: styles.input,
                }}
                onChange={onChangeCell}
              />
            );
          }
          return <p>{row.jersey_number}</p>;
        },
        headerStyle: {
          textAlign: "center",
          paddingLeft: 30,
        },
      },
      {
        title: "Action",
        field: "action",
        type: "string",
        headerStyle: {
          textAlign: "center",
          paddingLeft: 30,
        },
        render: (row) => {
          if (isEditing && rowData[0].team_player_id === row.team_player_id) {
            return (
              <div style={{ display: "flex" }}>
                <Button
                  icon={getIcon(Icons.DONE)}
                  variant="text"
                  type="icon"
                  label=""
                  color="default"
                  onClick={onSaveEdit}
                />
                <Button
                  icon={getIcon(Icons.CLOSE)}
                  variant="text"
                  type="icon"
                  label=""
                  color="default"
                  onClick={onCloseEdit}
                />
              </div>
            );
          }
          return (
            <Button
              icon={getIcon(Icons.MENU)}
              variant="text"
              type="icon"
              label=""
              color="default"
              onClick={(event) => handleOpenActionMenu(event, row)}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onToggleSectionCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSectionCollapse(!isSectionsExpand);
  };

  const onChangeTeam = () => {
    if (rowData.length > 0) {
      onChangeTeamPopupOpen(rowData);
    }
    handleCloseActionMenu();
  };

  const onEdit = () => {
    setIsEditing(true);
    if (rowData.length > 0) {
      onEditPopupOpen(rowData);
    }
    handleCloseActionMenu();
  };

  const onCloseEdit = () => {
    setIsEditing(false);
  };

  const onSaveEdit = () => {
    onSavePlayer();
    setIsEditing(false);
  };

  const onDelete = () => {
    if (rowData.length > 0) {
      setDeleteModal(true);
    }
    handleCloseActionMenu();
  };

  const onChangeGroupTeam = (rows: IPlayer[]) => {
    if (rows.length > 0) {
      onChangeTeamPopupOpen(rows);
    }
    handleCloseActionMenu();
  };

  const onDeleteGroupTeam = (rows: IPlayer[]) => {
    if (rows.length > 0) {
      setDeleteModal(true);
    }
    handleCloseActionMenu();
  };

  const deletePlayers = () => {
    onDeletePlayer(rowData);
    handleCloseDeleteModal();
  };

  const handleOpenActionMenu = (event: any, row: IPlayer) => {
    setRowData([row]);
    setAnchorEl(event.currentTarget);
  };

  const handleGroupAction = (eventName: string, rows: IPlayer[]) => {
    setRowData(rows);
    switch (eventName) {
      case "change_team": {
        onChangeGroupTeam(rows);
        break;
      }
      case "delete": {
        onDeleteGroupTeam(rows);
        break;
      }
      default:
        break;
    }
  };

  const handleCloseActionMenu = () => {
    setAnchorEl(null);
  };

  const onCreatePlayer = () => {
    const path = eventId
      ? `/event/players-create/${eventId}`
      : "/event/players-create";
    history.push(path);
  };

  const getPlayerCount = (division: IDivision) => {
    let count = 0;
    players.forEach((player) => {
      const selectedTeam = teams.find(
        (team) => team.team_id === player.team_id
      );
      if (selectedTeam?.division_id === division.division_id) {
        count += 1;
      }
    });
    return count;
  };

  const onChangeCell = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newRowData = rowData.map((player) => ({
      ...player,
      [name]: value,
    }));
    setRowData(newRowData);
    onChangePlayer(e);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(false);
  };

  const data: any[] = players.map((player) => {
    const selectedTeam = teams.find((team) => team.team_id === player.team_id);
    const selectedDivision = divisions.find(
      (division) => division.division_id === selectedTeam?.division_id
    );
    return {
      first_name: player.first_name,
      last_name: player.last_name,
      division_name: selectedDivision?.short_name,
      team_name: selectedTeam?.short_name,
      player_email: player.player_email,
      jersey_number: player.jersey_number,
      team_player_id: player.team_player_id,
      team_id: player.team_id,
      player_mobile: player.player_mobile,
      position: player.position,
    };
  });

  return (
    <li>
      <SectionDropdown
        id={EventMenuTitles.PLAYER_MANAGEMENT}
        type="section"
        isDefaultExpanded={true}
        expanded={isSectionsExpand}
        useShadow={true}
        onToggle={() => toggleSectionCollapse(!isSectionsExpand)}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>Player Management</div>
          <div className={styles.buttonContainer}>
            {players.length ? (
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
              label="Import Players from CSV"
            />
            <Button
              onClick={onCreatePlayer}
              variant={ButtonVariant.CONTAINED}
              color={ButtonColors.PRIMARY}
              label="+ Create Player"
            />
          </div>
          <div className={styles.playerCountInfo}>
            <table>
              <thead>
                <tr>
                  <th>Division</th>
                  {divisions.map((division, idx) => (
                    <th key={idx}>{division.short_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Player Count</td>
                  {divisions.map((division, idx) => (
                    <td key={idx}>{getPlayerCount(division)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <MaterialTable
            columns={columns}
            data={data}
            title="All Participants"
            options={{
              pageSize: 10,
              pageSizeOptions: [5, 10, 20, 50, 100, 500],
              emptyRowsWhenPaging: false,
              padding: "dense",
              exportButton: true,
              exportAllData: true,
              columnsButton: true,
              filtering: true,
              showTitle: false,
              thirdSortClick: false,
              search: true,
              selection: true,
              actionsColumnIndex: -1,
            }}
            actions={[
              {
                icon: "compare_arrows",
                tooltip: "Change Team",
                onClick: (_, rows) => handleGroupAction("change_team", rows),
              },
              {
                icon: "star",
                tooltip: "Add to All Star Team",
                onClick: (_, rows) => handleGroupAction("star", rows),
              },
              {
                icon: "delete",
                tooltip: "Delete",
                onClick: (_, rows) => handleGroupAction("delete", rows),
              },
            ]}
          />
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseActionMenu}
          >
            <MenuItem onClick={onChangeTeam}>Change Team</MenuItem>
            <MenuItem onClick={onEdit}>Edit</MenuItem>
            <MenuItem onClick={handleCloseActionMenu}>
              Add to AllStar Team
            </MenuItem>
            <MenuItem onClick={onDelete}>Delete</MenuItem>
          </Menu>
        </ul>
      </SectionDropdown>
      <DeletePopupConfirm
        type={"player"}
        message={deleteMessage}
        deleteTitle={"Delete these player(s)?"}
        isOpen={isDeleteModal}
        onClose={handleCloseDeleteModal}
        onDeleteClick={deletePlayers}
      />
    </li>
  );
};

export default PlayerManagement;
