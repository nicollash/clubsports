import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import axios from "axios";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { orderBy } from "lodash-es";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Button,
  Select,
  PopupConfirm,
  DeletePopupConfrim,
  HeadingLevelThree,
} from "components/common";
import FieldItem from "./components/field-item";
import { getIcon } from "helpers";
import { BindingAction } from "common/models/callback";
import { ISelectOption, IUSAState, IDivision } from "common/models";
import { ITeam, ITeamWithResults } from "common/models/teams";
import { Icons } from "common/enums/icons";
import { IAppState } from "reducers/root-reducer.types";
import { ISchedulesGameWithNames } from "common/models";
import styles from "./styles.module.scss";
import { formatPhoneNumber } from "helpers/formatPhoneNumber";
import { Backdrop, CircularProgress } from "@material-ui/core";

const EDIT_ICON_STYLES = {
  marginRight: "5px",
};

const DELETE_ICON_STYLES = {
  marginRight: "5px",
  fill: "#FF0F19",
};

enum FORM_FIELDS {
  LONG_NAME = "long_name",
  SHORT_NAME = "short_name",
  TEAM_TAG = "team_tag",
  STATE = "state",
  CITY = "city",
  CONTACT_FIRST_NAME = "contact_first_name",
  CONTACT_LAST_NAME = "contact_last_name",
  PHONE_NUM = "phone_num",
  CONCTACT_EMAIL = "contact_email",
};

export enum ComponentType {
  DIVISIONS_AND_POOLS,
  TEAMS_AND_PLAYERS,
  SCORING,
};

interface Props {
  componentType: ComponentType;
  contactId: string;
  team: ITeam | ITeamWithResults | null;
  pool: string | null;
  games: ISchedulesGameWithNames[] | null;
  division: IDivision | null;
  divisions: IDivision[];
  deleteMessage?: string;
  isOpenConfirm?: boolean;
  schedulesNames?: string[];
  isLoadingNames?: boolean;
  isOpenDeleteConfirm?: boolean;
  onCheckTeam?: (team: ITeam | ITeamWithResults) => void;
  onSaveTeamClick: BindingAction;
  onDeleteTeamClick: (team: ITeam | ITeamWithResults) => void;
  onChangeTeam: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePhoneNumber: (value: string) => void;
  onCloseModal: BindingAction;
  onChangeDivision?: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteTeamFromSchedule?: () => void;
}

const TeamDetailsPopup = ({
  contactId,
  team,
  pool,
  games,
  division,
  divisions,
  deleteMessage,
  isOpenConfirm,
  schedulesNames,
  isLoadingNames,
  componentType,
  isOpenDeleteConfirm,
  onCheckTeam,
  onCloseModal,
  onChangeTeam,
  onSaveTeamClick,
  onDeleteTeamClick,
  onChangePhoneNumber,
  onChangeDivision,
  onDeleteTeamFromSchedule,
}: Props) => {
  const [isEdit, onEditClick] = useState(false);
  const [teamTitle] = useState(team?.long_name);
  const [isDeletePopupOpen, onDeletePopup] = useState(isOpenDeleteConfirm!);
  const [states, onUpdateStates] = useState([]);
  const [isOpenConf, setIsOpenConf] = useState(isOpenConfirm);
  const [isDivisionEdited, setIsDivisionEdited] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [checkStatus, setCheckStatus] = useState(false);

  const { coaches } = useSelector((state: IAppState) => state.teams);
  const coache = coaches.find((coache) => coache.team_contact_id === contactId);
  const contactFirstName = (contactId === '') 
    ? team?.contact_first_name
    : coache?.first_name;
   
  const contactLastName = (contactId === '')
    ? team?.contact_last_name
    : coache?.last_name;

  const contactPhone: string = contactId === '' 
    ? (team?.phone_num ? team.phone_num : '')
    : (coache?.phone_num ? coache.phone_num : '');

  const contactEmail = function () {
    if (contactId === '') {
      return team?.contact_email;
    } else {
      return coaches.find((coache) => coache.team_contact_id === contactId)?.contact_email;
    }
  };

  useEffect(() => {
    setIsOpenConf(isOpenConfirm);
    onDeletePopup(isOpenDeleteConfirm!);
    if (checkStatus && isDivisionEdited && isOpenDeleteConfirm) {
      onSaveTeamClick();
    }
  }, [isOpenConfirm, isOpenDeleteConfirm, checkStatus]);

  useEffect(() => {
    axios.get("/states").then((response) => {
      const selectStateOptions = response.data.map((it: IUSAState) => ({
        label: it.state_id,
        value: it.state_name,
      }));

      const sortedSelectStateOptions = selectStateOptions.sort(
        (a: ISelectOption, b: ISelectOption) =>
          a.label.localeCompare(b.label, undefined, { numeric: true })
      );

      onUpdateStates(sortedSelectStateOptions);
    });
  }, []);

  const onDeletePopupClose = () => {
    onDeletePopup(false);
  };

  if (!team) {
    return null;
  }

  const teamOwnGames = games?.filter(
    (it) => it.homeTeamId === team?.team_id || it.awayTeamId === team?.team_id
  );

  const sortedGames = orderBy(
    teamOwnGames,
    ({ gameDate, startTime }) => [gameDate, startTime],
    ["asc", "asc"]
  );

  const confirmDelete = () => {
    setIsDelete(true);
    if (onCheckTeam) {
      onCheckTeam(team);
    }
  };

  const onSaveTeam = () => {
    if (onCheckTeam && isDivisionEdited) {
      onCheckTeam(team);
      setCheckStatus(true);
    } else {
      onSaveTeamClick();
    }
  };

  const onHandleChangeDivision = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChangeDivision) {
      onChangeDivision(e);
    }
    setIsDivisionEdited(true);
  };

  const confirmedDelete = () => {
    onDeletePopup(true);
  };

  const onDeleteTeam = () => {
    if (onDeleteTeamFromSchedule) {
      onDeleteTeamFromSchedule();
    }
    onSaveTeamClick();
  };

  const divisionsOptions = divisions?.map((item) => {
    return { value: item.division_id, label: item.long_name };
  });

  const warningMessage = `This team is in the ${
    schedulesNames ? schedulesNames.join(", ") : null
  } schedule. If deleted, all of their games would 
   need to be updated with a new team. Proceed?`;

  const warningMessageDivision = `This team is in the ${
    schedulesNames ? schedulesNames.join(", ") : null
  } schedule. Delete team from schedules?`;
console.log('contactId => ', contactId)
  return (
    <div className={styles.popupWrapper}>
      <div className={styles.headerWrapper}>
        <HeadingLevelThree color="#1C315F">
          <span>
            {teamTitle}
            {division?.long_name
              ? ` (${
                  division?.long_name && pool
                    ? `${division?.long_name}, ${pool}`
                    : `${division?.long_name}`
                })`
              : ""}
          </span>
        </HeadingLevelThree>
        <p className={styles.editBtnWrapper}>
          <Button
            onClick={() => onEditClick(!isEdit)}
            icon={getIcon(Icons.EDIT, EDIT_ICON_STYLES)}
            label="Edit Team Details"
            variant="text"
            color="secondary"
          />
        </p>
      </div>
      <form autoComplete="off">
        <div className={styles.popupFormWrapper}>
          <div className={styles.mainInfo}>
            <ul className={styles.infoList}>
              <li>
                <b>Long Name: </b>
                {isEdit ? (
                  <label>
                    <input
                      onChange={onChangeTeam}
                      value={team.long_name || ""}
                      name={FORM_FIELDS.LONG_NAME}
                      type="text"
                      autoFocus={true}
                    />
                    <span className="visually-hidden">Long Name</span>
                  </label>
                ) : (
                  <span>{team.long_name}</span>
                )}
              </li>
              <li>
                <b>Short name: </b>
                {isEdit ? (
                  <label>
                    <input
                      onChange={onChangeTeam}
                      value={team.short_name || ""}
                      name={FORM_FIELDS.SHORT_NAME}
                      type="text"
                    />
                    <span className="visually-hidden">Short name:</span>
                  </label>
                ) : (
                  <span>{team.short_name}</span>
                )}
              </li>
              <li>
                <b>Division: </b>
                {isEdit ? (
                  <label>
                    <Select
                      disabled={componentType === ComponentType.SCORING}
                      options={divisionsOptions!}
                      name={FORM_FIELDS.LONG_NAME}
                      value={division?.division_id || ""}
                      onChange={onHandleChangeDivision}
                    />
                    <span className="visually-hidden">Tag</span>
                  </label>
                ) : (
                  <span>{division?.long_name}</span>
                )}
              </li>
              <li>
                <b>State: </b>
                {isEdit ? (
                  <label>
                    <Select
                      options={states}
                      name={FORM_FIELDS.STATE}
                      value={team.state || ""}
                      onChange={onChangeTeam}
                      isRequired={false}
                    />
                    <span className="visually-hidden">State</span>
                  </label>
                ) : (
                  <span>{team.state}</span>
                )}
              </li>
              <li>
                <b>City: </b>
                {isEdit ? (
                  <label>
                    <input
                      onChange={onChangeTeam}
                      value={team.city || ""}
                      name={FORM_FIELDS.CITY}
                      type="text"
                    />
                    <span className="visually-hidden">City</span>
                  </label>
                ) : (
                  <span>{team.city}</span>
                )}
              </li>
            </ul>
            <ul className={styles.contactList}>
              <li className={styles.contactListDouble}>
                <b>Contact: </b>
                {isEdit ? (
                  <p>
                    <label>
                      <b>First Name: </b>
                      <input
                        onChange={onChangeTeam}
                        value={team.contact_first_name || ""}
                        name={FORM_FIELDS.CONTACT_FIRST_NAME}
                        type="text"
                      />
                    </label>
                    <label>
                      <b>Last Name: </b>
                      <input
                        onChange={onChangeTeam}
                        value={team.contact_last_name || ""}
                        name={FORM_FIELDS.CONTACT_LAST_NAME}
                        type="text"
                      />
                    </label>
                  </p>
                ) : (
                  <span>{`${contactFirstName || ""} ${
                    contactLastName || ""
                  }`}</span>
                )}
              </li>
              <li>
                <b>Mobile: </b>
                {isEdit ? (
                  <PhoneInput
                    country={"us"}
                    disableDropdown
                    onlyCountries={["us"]}
                    disableCountryCode={true}
                    placeholder=""
                    value={team.phone_num || ""}
                    onChange={onChangePhoneNumber}
                    containerStyle={{ marginTop: "7px" }}
                    inputStyle={{
                      height: "42px",
                      fontSize: "18px",
                      color: "#6a6a6a",
                      borderRadius: "4px",
                      width: "100%",
                    }}
                    inputClass={styles.phoneInput}
                  />
                ) : (
                  <span>
                    {contactPhone ? formatPhoneNumber(contactPhone) : ""}
                  </span>
                )}
              </li>
              <li>
                <b>Email: </b>
                {isEdit ? (
                  <label className={styles.emailSectionItem}>
                    <ValidatorForm onSubmit={() => {}}>
                      <TextValidator
                        onChange={onChangeTeam}
                        value={contactEmail || ""}
                        name={FORM_FIELDS.CONCTACT_EMAIL}
                        validators={["isEmail"]}
                        errorMessages={["Invalid email address"]}
                      />
                    </ValidatorForm>
                    <span className="visually-hidden">Email</span>
                  </label>
                ) : (
                  <span>{contactEmail}</span>
                )}
              </li>
            </ul>
          </div>
          {games &&
            (sortedGames && sortedGames?.length !== 0 ? (
              <ul className={styles.fieldList}>
                {sortedGames.map((it) => (
                  <FieldItem game={it} key={it.id} />
                ))}
              </ul>
            ) : (
              <p className={styles.gamesMessage}>
                There is no published schedule yet.
              </p>
            ))}
        </div>
        <div className={styles.btnsWrapper}>
          <span className={styles.BtnDeleteWrapper}>
            <Button
              onClick={confirmDelete}
              icon={getIcon(Icons.DELETE, DELETE_ICON_STYLES)}
              label="Delete Team"
              variant="text"
              color="inherit"
            />
          </span>
          <p className={styles.popupBtnsWrapper}>
            <Button
              onClick={onCloseModal}
              label="Cancel"
              variant="text"
              color="secondary"
            />
            <Button
              onClick={onSaveTeam}
              label="Save"
              variant="contained"
              color="primary"
            />
          </p>
        </div>
      </form>
      {isDelete && (
        <PopupConfirm
          showYes={true}
          showNo={true}
          message={warningMessage}
          isOpen={isOpenConf || false}
          onClose={() => setIsOpenConf(false)}
          onCanceClick={() => setIsOpenConf(false)}
          onYesClick={confirmedDelete}
          type="warning"
        />
      )}
      {isDivisionEdited && (
        <PopupConfirm
          showCancelByLeft={true}
          showYes={true}
          showNo={true}
          message={warningMessageDivision}
          isOpen={isOpenConf || false}
          onClose={onCloseModal}
          onCanceClick={onSaveTeamClick}
          onYesClick={onDeleteTeam}
        />
      )}
      <Backdrop className={styles.backdrop} open={isLoadingNames || false}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {isDelete && (
        <DeletePopupConfrim
          type={"team"}
          message={deleteMessage}
          deleteTitle={team.long_name!}
          isOpen={isDeletePopupOpen}
          onClose={onDeletePopupClose}
          onDeleteClick={() => onDeleteTeamClick(team)}
        />
      )}
    </div>
  );
};
export default TeamDetailsPopup;
