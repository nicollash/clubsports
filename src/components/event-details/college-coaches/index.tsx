import React, { useEffect, useState, useMemo } from "react";
import { Chip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  SectionDropdown,
  HeadingLevelThree,
  Checkbox,
  Select,
  SearchableList,
} from "components/common";
import axios from "axios";
import Api from "api/api";
import { EventMenuTitles } from "common/enums";

import styles from "../styles.module.scss";
import { IEventDetails, ISelectOption } from "common/models";
import { CardMessageTypes } from 'components/common/card-message/types';
import {
  CardMessage,
} from "components/common";

axios.defaults.baseURL = process.env.REACT_APP_PUBLIC_API_BASE_URL!;

const useStyles = makeStyles(() => ({
  chip: {
    margin: 2,
    backgroundColor: "#00A3EA !important",
    fontSize: 10,
  },
}));

interface IProps {
  isSectionExpand: boolean;
  onChange: any;
  eventData: Partial<IEventDetails>;
}

interface ICollege {
  university_id: string;
  is_active_YN: number;
  division: string;
  sport_id: number;
  name: string;
  short_name: string;
  region: string;
  state: string;
  city: string;
  conference: string;
}

interface IAttendingCollege {
  attending_id: string;
  event_id: string;
  university_id: string;
  is_active_YN: number;
}

const CollegeCoaches: React.FC<IProps> = (props: IProps) => {
  const classes = useStyles();
  const { isSectionExpand, eventData, onChange } = props;
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [attendingColleges, setAttendingColleges] = useState<
    IAttendingCollege[]
  >([]);
  const [selectedColleges, setSelectedColleges] = useState<any>({});

  useEffect(() => {
    getColleges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventData.event_id]);

  useEffect(() => {
    if (colleges.length > 0) {
      getAttendingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colleges]);

  const getColleges = async () => {
    const response = await axios.get(`/universities`);
    if (response.data) {
      setColleges(response.data);
      const tempDivisions: string[] = ["All"];
      response.data.forEach((it: ICollege) => {
        if (!tempDivisions.includes(it.division)) {
          tempDivisions.push(it.division);
        }
      });
      setDivisions(tempDivisions);
      setSelectedDivision(tempDivisions[0]);
    }
  };

  const getAttendingData = async () => {
    const res = await Api.get(
      `/attending_universities?event_id=${eventData.event_id}`
    );
    setAttendingColleges(res);
    const attendingUniversities = {};
    res.forEach((university: IAttendingCollege) => {
      const temp = colleges.find(
        (college) =>
          college.university_id === university.university_id &&
          college.sport_id === eventData.sport_id
      );
      if (temp) {
        attendingUniversities[temp.division] = attendingUniversities[
          temp.division
        ]
          ? [...attendingUniversities[temp.division], temp.university_id]
          : [temp.university_id];
      }
    });
    setSelectedColleges(attendingUniversities);
  };

  const sendUniversities = async (uploadData: any) => {
    await Api.post(
      `/attending_universities?event_id=${eventData.event_id}`,
      uploadData
    );
  };

  const handleDelete = async (data: string) => {
    const deleteData = attendingColleges.find(
      (college: IAttendingCollege) => college.university_id === data
    );
    await Api.delete(
      `/attending_universities?attending_id=${deleteData?.attending_id}`
    );
    await getAttendingData();
  };

  const handleSelect = async (option: ISelectOption) => {
    const addedCollege = colleges.find(
      (college) =>
        (college.division === selectedDivision || selectedDivision === "All") &&
        college.university_id === option.value
    );
    if (addedCollege) {
      await sendUniversities({
        event_id: eventData.event_id,
        university_id: addedCollege.university_id,
        is_active_YN: addedCollege.is_active_YN,
      });
      await getAttendingData();
    }
  };

  const CARD_MESSAGE_STYLES = {
    marginBottom: 10,
    width: "100%",
  };

  const getAllSelectedOptions = () => {
    let result: string[] = [];
    Object.keys(selectedColleges).forEach((key) => {
      result = [...result, ...selectedColleges[key]];
    });
    return result;
  };

  const handleUnSelect = (option: ISelectOption) => {
    handleDelete(String(option.value));
  };

  const onTrackCoachesChanged = () =>
    onChange("track_coaches_YN", eventData.track_coaches_YN ? 0 : 1);

  const options = useMemo(() => {
    return colleges
      .filter(
        (college) =>
          (college.division === selectedDivision ||
            selectedDivision === "All") &&
          college.sport_id === eventData.sport_id
      )
      .map((college) => ({
        label: college.short_name,
        value: college.university_id,
      }));
  }, [colleges, eventData.sport_id, selectedDivision]);

  return (
    <SectionDropdown
      id={EventMenuTitles.COLLEGE_COACHES}
      type="section"
      panelDetailsType="flat"
      useShadow={true}
      expanded={isSectionExpand}
    >
      <HeadingLevelThree>
        <span className={styles.blockHeading}>College Coaches</span>
      </HeadingLevelThree>
      <div>
        <CardMessage
            style={CARD_MESSAGE_STYLES}
            type={CardMessageTypes.EMODJI_OBJECTS}
          >
            By enabling this feature the college coaches are listed on registration pages as well as ClubLax.org as scheduled to attend!
          </CardMessage>

      <div className={styles.playoffsDetails}>
        <div className={styles.pdFirst}>
          <Checkbox
            formLabel=""
            options={[
              {
                label: "Publicly List the College Coaches Attending On ClubLax.org and TourneyMaster Event Page",
                checked: Boolean(eventData.track_coaches_YN),
              },
            ]}
            onChange={onTrackCoachesChanged}
          />
        </div>
        {Boolean(eventData.track_coaches_YN) && (
          <div className={styles.pdSecond}>
            <Select
              label="Select Division:"
              options={divisions.map((division) => ({
                label: division,
                value: division,
              }))}
              value={selectedDivision || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSelectedDivision(e.target.value)
              }
            />
            <SearchableList
              label="School Search:"
              options={options}
              selectedOptions={
                selectedDivision === "All"
                  ? getAllSelectedOptions()
                  : selectedColleges[selectedDivision]
              }
              onHandleSelect={handleSelect}
              onHandleUnSelect={handleUnSelect}
            />
            <div className={styles.ccDetails}>
              {divisions.slice(1).map((division, index) => (
                <div key={index}>
                  <span className={styles.chipHeader}>{division}</span>
                  <div className={styles.chipsSection}>
                    {selectedColleges[division] &&
                      selectedColleges[division].map(
                        (college: string, ind: number) => {
                          return (
                            <Chip
                              key={ind}
                              size="small"
                              label={
                                colleges.find(
                                  (option) =>
                                    option.university_id === college &&
                                    option.sport_id === eventData.sport_id
                                )?.short_name
                              }
                              color="primary"
                              onMouseDown={(event) => {
                                event.stopPropagation();
                              }}
                              onDelete={() => handleDelete(college)}
                              className={classes.chip}
                            />
                          );
                        }
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </SectionDropdown>
  );
};

export default CollegeCoaches;
