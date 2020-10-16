import React, { useState, useMemo, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import {
  Table,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  TableFooter,
} from "@material-ui/core";
import { CardMessageTypes } from 'components/common/card-message/types';
import {
  SectionDropdown,
  HeadingLevelThree,
  Checkbox,
  CardMessage,
  Input,
  Button,
} from "components/common";
import { getIcon } from "helpers/get-icon.helper";
import { EventMenuTitles, Icons, ButtonVariant, ButtonColors } from "common/enums";
import Api from "api/api";
import { IEventDetails } from "common/models";
import { BindingAction } from 'common/models';

import styles from "../styles.module.scss";

interface IProps {
  isSectionExpand: boolean;
  onChange: any;
  onCsvLoaderBtn: BindingAction;
  eventData: Partial<IEventDetails>;
}

export interface AuthorizedReporter {
  sms_scorer_id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  is_active_YN: boolean;
}

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

const GameDayScoring: React.FC<IProps> = (props) => {
  const { isSectionExpand, eventData, onChange, onCsvLoaderBtn } = props;
  const [isEditing, setEditing] = useState(-1);
  const [reporters, setReporters] = useState<AuthorizedReporter[]>([]);

  useEffect(() => {
    getScoring();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventData.event_id]);

  const getScoring = () => {
    Api.get(`/sms_authorized_scorers?event_id=${eventData.event_id}`).then(
      (response) => {
        if (
          Boolean(eventData.sms_scoring_YN) &&
          (!response || response.length === 0)
        ) {
          const newReporter: AuthorizedReporter = {
            sms_scorer_id: "",
            event_id: eventData.event_id ? eventData.event_id : "",
            first_name: "",
            last_name: "",
            mobile: "",
            is_active_YN: false,
          };
          const newReporters = [newReporter];
          setEditing(0);
          setReporters(newReporters);
        } else {
          setReporters(response);
        }
      }
    );
  };

  const handleChange = (
    evt: InputTargetValue,
    reporter: AuthorizedReporter
  ) => {
    const newReporter = {
      ...reporter,
      [evt.target.name]: evt.target.value,
    };
    let newReporters = reporters.filter(
      (item) => item.sms_scorer_id !== reporter.sms_scorer_id
    );
    newReporters = [...newReporters, newReporter];
    newReporters.sort((a, b) => {
      if (a.sms_scorer_id === "") return 1;
      if (a.sms_scorer_id > b.sms_scorer_id) return 1;
      if (a.sms_scorer_id < b.sms_scorer_id) return -1;
      return 0;
    });
    setReporters(newReporters);
  };

  const onPhoneChange = (phoneNumber: string, reporter: AuthorizedReporter) => {
    const newReporter = {
      ...reporter,
      mobile: phoneNumber,
    };
    let newReporters = reporters.filter(
      (item) => item.sms_scorer_id !== reporter.sms_scorer_id
    );
    newReporters = [...newReporters, newReporter];
    newReporters.sort((a, b) => {
      if (a.sms_scorer_id === "") return 1;
      if (a.sms_scorer_id > b.sms_scorer_id) return 1;
      if (a.sms_scorer_id < b.sms_scorer_id) return -1;
      return 0;
    });
    setReporters(newReporters);
  };

  const handleDeleteReporter = (reporter: AuthorizedReporter) => {
    Api.delete(
      `/sms_authorized_scorers?sms_scorer_id=${reporter.sms_scorer_id}`
    ).then(() => {
      getScoring();
      setEditing(-1);
    });
  };

  const addNewReporter = () => {
    const newReporter: AuthorizedReporter = {
      sms_scorer_id: "",
      event_id: eventData.event_id ? eventData.event_id : "",
      first_name: "",
      last_name: "",
      mobile: "",
      is_active_YN: false,
    };
    const newReporters = [...reporters, newReporter];
    setEditing(newReporters.length - 1);
    newReporters.sort((a, b) => {
      if (a.sms_scorer_id === "") return 1;
      if (a.sms_scorer_id > b.sms_scorer_id) return 1;
      if (a.sms_scorer_id < b.sms_scorer_id) return -1;
      return 0;
    });
    setReporters(newReporters);
  };

  const onSaveEdit = (reporter: AuthorizedReporter) => {
    if (!reporter.sms_scorer_id) {
      const newData = {
        event_id: reporter.event_id,
        first_name: reporter.first_name,
        last_name: reporter.last_name,
        mobile: reporter.mobile,
        is_active_YN: reporter.is_active_YN,
      };
      Api.post(
        `/sms_authorized_scorers?event_id=${eventData.event_id}`,
        newData
      ).then(() => {
        getScoring();
        setEditing(-1);
      });
    } else {
      Api.put(
        `/sms_authorized_scorers?sms_scorer_id=${reporter.sms_scorer_id}`,
        reporter
      ).then(() => {
        getScoring();
        setEditing(-1);
      });
    }
  };

  const isFilledPrevForms = useMemo(() => {
    let isFilled = true;
    reporters?.forEach((it) => {
      if (
        !it.first_name ||
        !it.last_name ||
        !it.mobile ||
        it.mobile.length < 10
      ) {
        isFilled = false;
      }
    });

    return isFilled;
  }, [reporters]);

  const onSMSScoring = () => {
    onChange("sms_scoring_YN", eventData.sms_scoring_YN ? 0 : 1);
    if (reporters.length === 0) {
      addNewReporter();
    }
  };

  const CARD_MESSAGE_STYLES = {
    marginBottom: 30,
    width: "100%",
  };

  return (
    <SectionDropdown
      id={EventMenuTitles.GAME_DAY_SCORING}
      type="section"
      panelDetailsType="flat"
      useShadow={true}
      expanded={isSectionExpand}
    >
      <HeadingLevelThree>
        <span className={styles.blockHeading}>Field Manager Management</span>
      </HeadingLevelThree>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", width: '100%' }}>
          <CardMessage
              style={CARD_MESSAGE_STYLES}
              type={CardMessageTypes.EMODJI_OBJECTS}
            >
              Enable two way transactional texting with your team! Authorizing them to txt final scores is faster, more efficient, and has fewer errors.
            </CardMessage>
          <div style={{ marginTop: '-8px', width: 170 }} >
            <Button
                onClick={onCsvLoaderBtn}
                variant={ButtonVariant.TEXT}
                color={ButtonColors.SECONDARY}              
                label="Import from CSV"
              />
            </div>
          </div>

        <div className={styles.gdscoringDetails}>
          <div className={styles.heading}>
            <a
              href="https://tourneymaster.s3.amazonaws.com/public/Quickstarts/Tourney+Master+SMS+Scoring+Quick+Start+Guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Quickstart Guide to SMS Scoring
            </a>
          </div>
        </div>

        <Checkbox
          options={[
            {
              label: "Enable Field Manager Management and SMS Scoring",
              checked: Boolean(eventData.sms_scoring_YN),
            },
          ]}
          onChange={onSMSScoring}
        />
        {Boolean(eventData.sms_scoring_YN) && (
          <div className={styles.authorizedReports}>
            <span className={styles.authorizedReportsHeader}>
              Authorized Reporters
            </span>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Phone #</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reporters?.length > 0 &&
                    reporters?.map((reporter, index) => (
                      <TableRow key={reporter.sms_scorer_id}>
                        <TableCell>
                          <Input
                            fullWidth={true}
                            name="first_name"
                            placeholder="Enter First Name"
                            disabled={isEditing !== index}
                            value={reporter.first_name}
                            onChange={(evt: InputTargetValue) =>
                              handleChange(evt, reporter)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            fullWidth={true}
                            name="last_name"
                            placeholder="Enter Last Name"
                            disabled={isEditing !== index}
                            value={reporter.last_name}
                            onChange={(evt: InputTargetValue) =>
                              handleChange(evt, reporter)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <PhoneInput
                            country={"us"}
                            onlyCountries={["us", "ca"]}
                            placeholder="Mobile is required"
                            enableAreaCodes={true}
                            disabled={isEditing !== index}
                            disableCountryCode={true}
                            value={reporter.mobile}
                            onChange={(value: string) =>
                              onPhoneChange(value, reporter)
                            }
                            inputStyle={{
                              height: "42px",
                              fontSize: "18px",
                              color: "#6a6a6a",
                              borderRadius: "4px",
                              width: "100%",
                            }}
                            inputClass={styles.phoneInput}
                          />
                        </TableCell>
                        <TableCell>
                          <div style={{ display: "flex" }}>
                            {isEditing !== index ? (
                              <Button
                                btnStyles={{ minWidth: 0 }}
                                icon={getIcon(Icons.EDIT)}
                                variant="text"
                                type="icon"
                                label=""
                                color="default"
                                onClick={() => setEditing(index)}
                              />
                            ) : (
                              <Button
                                btnStyles={{ minWidth: 0 }}
                                icon={getIcon(Icons.SAVE)}
                                variant="text"
                                type="icon"
                                label=""
                                color="default"
                                onClick={() => onSaveEdit(reporter)}
                              />
                            )}
                            <Button
                              btnStyles={{ minWidth: 0 }}
                              icon={getIcon(Icons.DELETE)}
                              variant="text"
                              type="icon"
                              label=""
                              color="default"
                              onClick={() => handleDeleteReporter(reporter)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={1}>
                      <Button
                        variant="outlined"
                        color="primary"
                        disabled={!isFilledPrevForms || isEditing !== -1}
                        label="Add Another Scorer"
                        btnStyles={{
                          width: "fit-content",
                        }}
                        onClick={addNewReporter}
                      />
                    </TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    </SectionDropdown>
  );
};

export default GameDayScoring;
