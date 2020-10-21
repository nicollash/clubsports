/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

import {
  SectionDropdown,
  HeadingLevelThree,
  Input,
  Select,
  DatePicker,
  CardMessage,
  ButtonCopy,
  PopupConfirm,
} from "components/common";
import PhoneInput from "react-phone-input-2";
import { CardMessageTypes } from "components/common/card-message/types";

import { IPosition } from "./map/autocomplete";
import {
  EventMenuTitles,
  ButtonColors,
  ButtonVariant,
  EventStatuses,
} from "common/enums";

import styles from "../styles.module.scss";

import Map from "./map";
import PlacesAutocompleteInput from "./map/autocomplete";
import { IEventDetails, IOrganization } from "common/models";
import { getIdByGenderAndSport, getGenderAndSportById } from "./helper";
import { timeToDate, dateToTime, dateToShortString } from "helpers";
import moment from "moment";

const CONTACT_TOOLTIP_MESSAGE =
  "Contact details; included when printing the Master Schedule and Fields-by-Field details";
const RESULTS_DISABLE_MESSAGE =
  "Link will be available after the publication of the event";

const BASE_RESULT_LINK = "http://results.tourneymaster.com/event/";

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

interface Props {
  eventData: Partial<IEventDetails>;
  onChange: (name: string, value: string | number, ignore?: boolean) => void;
  isSectionExpand: boolean;
  organizations?: IOrganization[];
}

enum sportsEnum {
  "Lacrosse" = 1,
  "Field Hockey" = 2,
  "Basketball" = 3,
  "Soccer" = 4,
}
enum genderEnum {
  "Male" = 1,
  "Female" = 2,
  "Co-Ed" = 3,
}
enum timeZoneEnum {
  "Eastern Standard Time" = -5,
  "Central Standard Time" = -6,
  "Mountain Standard Time" = -7,
  "Pacific Standard Time" = -8,
}

const sportOptions = [
  { label: "Lacrosse", value: sportsEnum[1] },
  { label: "Field Hockey", value: sportsEnum[2] },
  { label: "Basketball", value: sportsEnum[3] },
  { label: "Soccer", value: sportsEnum[4] },
];
const timeZoneOptions = [
  "Eastern Standard Time",
  "Central Standard Time",
  "Mountain Standard Time",
  "Pacific Standard Time",
];
const genderOptions = [
  { label: "Male", value: genderEnum[1] },
  { label: "Female", value: genderEnum[2] },
  { label: "Co-Ed", value: genderEnum[3] },
];

const levelOptions = ["High School", "Club", "Youth", "Other"];

const PrimaryInformationSection: React.FC<Props> = ({
  eventData,
  onChange,
  isSectionExpand,
  organizations
}: Props) => {
  const {
    event_id,
    time_zone_utc,
    event_startdate,
    event_enddate,
    first_game_time,
    last_game_end,
    event_level,
    is_published_YN,
    org_id,
    sport_id,
  } = eventData;
  
  const listOfOrganizationsNames = organizations?.map((item: IOrganization) => { return {label: item.org_name, value:item.org_id}});

  const {
    sportId: dropdownSportValue,
    genderId: dropdownGenderValue,
  } = getGenderAndSportById(sport_id);

  const [genderId, onChangeGender] = useState(dropdownGenderValue);
  const [sportId, onChangeSport] = useState(dropdownSportValue);
  const [isWarningPopupOpen, setIsWarningPopupOpen] = useState<boolean>(false);

  useEffect(() => {
    const calculatedSportId = getIdByGenderAndSport(genderId, sportId);

    onChange("sport_id", calculatedSportId, true);
  }, [genderId, sportId]);

  const onNameChange = (e: InputTargetValue) =>
    onChange("event_name", e.target.value);

  const onTagChange = (e: InputTargetValue) =>
    onChange("event_tag", e.target.value);

  const onSportChange = (e: InputTargetValue) => {
    onChangeSport(sportsEnum[e.target.value]);
  };

  const onProfitCenterChange = (e: InputTargetValue) => {
    onChange("org_id", e.target.value)
  }

  const onLevelChange = (e: InputTargetValue) =>
    onChange("event_level", e.target.value);

  const onGenderChange = (e: InputTargetValue) => {
    if (genderEnum[e.target.value] === genderEnum["Co-Ed"]) {
      setIsWarningPopupOpen(true);
    }
    onChangeGender(genderEnum[e.target.value]);
  };

  const onStartDate = (e: Date | string) => {
    if (!isNaN(Number(e))) {
      onChange("event_startdate", dateToShortString(new Date(e).toISOString()));
      if (
        event_enddate &&
        dateToShortString(new Date(e).toISOString()) >
          dateToShortString(event_enddate)
      ) {
        onEndDate(e);
      }
    }
  };

  const onEndDate = (e: Date | string) =>
    !isNaN(Number(e)) &&
    onChange("event_enddate", dateToShortString(new Date(e).toISOString()));

  const onFirstGameTime = (e: Date | string) =>
    !isNaN(Number(e)) && onChange("first_game_time", dateToTime(e));

  const onLastGameTime = (e: Date | string) =>
    !isNaN(Number(e)) && onChange("last_game_end", dateToTime(e));

  const onTimeZone = (e: InputTargetValue) =>
    onChange("time_zone_utc", timeZoneEnum[e.target.value]);

  const onDescriptionChange = (e: InputTargetValue) =>
    onChange("event_description", e.target.value);

  const onPrimaryLocation = (address: string) => {
    onChange("primary_location_desc", address);
  };

  const onGeneralLocationSelect = ({
    position,
    state,
    city,
  }: {
    position: IPosition;
    state: string;
    city: string;
  }) => {
    onChange("primary_location_lat", position.lat);
    onChange("primary_location_long", position.lng);
    onChange("primary_location_state", state);
    onChange("primary_location_city", city);
  };

  const onMainContactChange = (e: InputTargetValue) =>
    onChange("main_contact", e.target.value);

  const onMainContactMobieChange = (phoneNumber: string) =>
    onChange("main_contact_mobile", phoneNumber);

  const onMainContactEmailChange = (e: InputTargetValue) =>
    onChange("main_contact_email", e.target.value);

  const closeWarning = () => setIsWarningPopupOpen(false);

  const { primary_location_lat: lat, primary_location_long: lng } = eventData;

  const currentDate = new Date();

  return (
    <SectionDropdown
      id={EventMenuTitles.PRIMARY_INFORMATION}
      type="section"
      panelDetailsType="flat"
      useShadow={true}
      expanded={isSectionExpand}
    >
      <HeadingLevelThree>
        <span className={styles.blockHeading}>Primary Information</span>
      </HeadingLevelThree>
      <div className={styles.piDetails}>
        <div className={styles.piDetailsFirst}>
          <Input
            fullWidth={true}
            label="Event Name"
            value={eventData.event_name || ""}
            onChange={onNameChange}
            autofocus={eventData.event_name ? false : true}
          />
          <Input
            fullWidth={true}
            label="Event Tag"
            placeholder="InstagramTag"
            startAdornment="@"
            value={eventData.event_tag || ""}
            onChange={onTagChange}
          />
          <Select
            options={sportOptions}
            label="Sport"
            value={sportsEnum[dropdownSportValue]}
            onChange={onSportChange}
          />
          <Select
            options={levelOptions.map((type) => ({ label: type, value: type }))}
            label="Level"
            value={event_level || levelOptions[1]}
            onChange={onLevelChange}
          />
          <Select
            options={genderOptions}
            label="Gender"
            value={genderEnum[dropdownGenderValue]}
            onChange={onGenderChange}
          />
        </div>
        <div className={styles.piDetailsFirstContacts}>
          <Input
            fullWidth={true}
            label="Main Contact Name"
            placeholder="Who is in charge?"
            value={eventData.main_contact || ""}
            onChange={onMainContactChange}
          />
          <div>
            <span className={styles.modalLabel}>Main Contact Mobile</span>
            <PhoneInput
              country={"us"}
              onlyCountries={["us", "ca"]}
              placeholder="(212) 555-1212"
              disableCountryCode={true}
              value={eventData.main_contact_mobile || ""}
              onChange={onMainContactMobieChange}
              containerStyle={{ marginTop: "7px" }}
              inputStyle={{
                height: "42px",
                fontSize: "16px",
                color: "#6a6a6a",
                borderRadius: "4px",
                width: "100%",
              }}
              inputClass={styles.phoneInput}
            />
          </div>
          <div className={styles.emailSectionItem}>
            <span className={styles.label}>Main Contact Email</span>
            <ValidatorForm onSubmit={() => {}}>
              <TextValidator
                value={eventData.main_contact_email || ""}
                placeholder="mainperson@yourcompany.com"
                onChange={onMainContactEmailChange}
                name="email"
                fullWidth={true}
                validators={["isEmail"]}
                errorMessages={["Invalid email address"]}
              />
            </ValidatorForm>
          </div>
          <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
            {CONTACT_TOOLTIP_MESSAGE}
          </CardMessage>
        </div>
        <div className={styles.piSectionContainer}>
          <div className={styles.piSection}>
            <div className={styles.gameTimesWrapper}>
              <DatePicker
                minWidth="50%"
                label="Start Date"
                type="date"
                value={moment(
                  new Date(dateToShortString(event_startdate)).setUTCHours(
                    currentDate.getUTCHours(),
                    currentDate.getUTCMinutes()
                  )
                ).format()}
                onChange={onStartDate}
              />
              <DatePicker
                minWidth="50%"
                label="End Date"
                type="date"
                value={moment(
                  new Date(dateToShortString(event_enddate)).setUTCHours(
                    currentDate.getUTCHours(),
                    currentDate.getUTCMinutes()
                  )
                ).format()}
                onChange={onEndDate}
              />
              <Select
                options={listOfOrganizationsNames || []}
                label="Profit Center"
                value={String(org_id) || ""}
                onChange={onProfitCenterChange}
                isRequired={true}
              />
            </div>
            <div className={styles.gameTimesWrapper}>
              <DatePicker
                minWidth="70%"
                label="First Game Start;"
                type="time"
                value={timeToDate(first_game_time!)}
                onChange={onFirstGameTime}
              />
              <DatePicker
                minWidth="100%"
                label="Last Game Ends By;"
                type="time"
                value={timeToDate(last_game_end!)}
                onChange={onLastGameTime}
              />
              <Select
                options={timeZoneOptions.map((type) => ({
                  label: type,
                  value: type,
                }))}
                label="Event Time Zone"
                value={time_zone_utc ? timeZoneEnum[time_zone_utc!] : ""}
                onChange={onTimeZone}
              />
            </div>
            <div className={styles.piDetailsThird}>
              <PlacesAutocompleteInput
                onSelect={onGeneralLocationSelect}
                onChange={onPrimaryLocation}
                address={eventData.primary_location_desc || ""}
                label={"General Location"}
              />
            </div>
            <div className={styles.piDetailsThirdArea}>
              <Input
                fullWidth={true}
                label="Event Description *"
                placeholder="Salespitch for your event goes here..."
                multiline={true}
                rows="4"
                value={eventData.event_description}
                onChange={onDescriptionChange}
              />
            </div>
          </div>
          <div className={styles.mapContainer}>
            <Map
              position={{
                lat: lat || 39.521305,
                lng: lng || -76.6451518,
              }}
            />
          </div>
        </div>
        <ButtonCopy
          copyString={`${BASE_RESULT_LINK}${event_id}`}
          color={ButtonColors.SECONDARY}
          variant={ButtonVariant.TEXT}
          disableMessage={
            is_published_YN === EventStatuses.Draft
              ? RESULTS_DISABLE_MESSAGE
              : undefined
          }
          label="Results Link"
        />
        <PopupConfirm
          isOpen={isWarningPopupOpen}
          message="You now need to update the genders for each division."
          onClose={closeWarning}
          onCanceClick={closeWarning}
          onYesClick={closeWarning}
        />
      </div>
    </SectionDropdown>
  );
};

export default PrimaryInformationSection;
