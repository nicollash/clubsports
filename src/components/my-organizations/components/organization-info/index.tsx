/* eslint-disable react-hooks/exhaustive-deps */
import React, { Component } from "react";
import { MenuTitles, Icons } from "common/enums";
import { BindingCbWithOne } from "common/models";
import {
  Select,
  Loader,
  Input,
  SectionDropdown,
  Checkbox,
} from "components/common";
import styles from "./styles.module.scss";
import Button from "components/common/buttons/button";
import { getIcon } from "helpers/get-icon.helper";
import { IOrganization } from "components/my-organizations";

interface StateGroup {
  label: string;
  value: string;
}

interface IProps {
  orgList: IOrganization[];
  isLoading: boolean;
  expanded: boolean;
  stateGroup: StateGroup[];
  onChangeOrgList: BindingCbWithOne<IOrganization[]>;
}

enum merchantPaymentTypes {
  "Stripe Connect ID" = "stripe_enabled_YN",
  "Authorize.NET" = "authdotnet_enabled_YN",
}

interface IState {
  tempOrgList: IOrganization[];
  stripeEditable: boolean;
  authnetEditable: boolean;
}

class OrganizationInfo extends Component<IProps, IState> {
  state: IState = {
    tempOrgList: [],
    stripeEditable: false,
    authnetEditable: false,
  };

  onChange = (value: any, id: string, field: string) => {
    const { onChangeOrgList, orgList } = this.props;
    const newOrgList = orgList.map((el) => {
      if (el.org_id === id) {
        return {
          ...el,
          [field]: value,
        };
      }
      return el;
    });
    onChangeOrgList(newOrgList);
  };

  onMerchantPaymentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    org: IOrganization
  ) => {
    this.onChange(
      !Boolean(org[merchantPaymentTypes[e.target.value]]),
      org.org_id,
      merchantPaymentTypes[e.target.value]
    );
  };

  toggleEditableStripe = () => {
    const { orgList } = this.props;
    const { stripeEditable } = this.state;
    this.setState({
      stripeEditable: !stripeEditable,
      tempOrgList: orgList,
    });
  };

  toggleEditableAuthNet = () => {
    const { orgList } = this.props;
    const { authnetEditable } = this.state;
    this.setState({
      authnetEditable: !authnetEditable,
      tempOrgList: orgList,
    });
  };

  onCancelStripeEdit = () => {
    const { tempOrgList } = this.state;
    const { onChangeOrgList } = this.props;
    onChangeOrgList(tempOrgList);
    this.toggleEditableStripe();
  };

  onCancelAuthnetEdit = () => {
    const { onChangeOrgList } = this.props;
    const { tempOrgList } = this.state;
    onChangeOrgList(tempOrgList);
    this.toggleEditableAuthNet();
  };

  render() {
    const { isLoading, orgList, stateGroup, expanded } = this.props;
    const { authnetEditable, stripeEditable } = this.state;

    if (isLoading || !orgList) {
      return <Loader />;
    }
    return (
      <section className={styles.container}>
        <div className={styles.sectionContainer}>
          <ul className={styles.organizationList}>
            {this.props.orgList.map((org: IOrganization, index: number) => (
              <li key={index}>
                <SectionDropdown
                  id={MenuTitles.ORG_INFO}
                  panelDetailsType="flat"
                  isDefaultExpanded={false}
                  expanded={expanded}
                >
                  <div className={styles.sectionTitle}>Organization Info</div>
                  <div className={styles.sectionContent}>
                    <div className={styles.orgInfo}>
                      <fieldset className={styles.orgName}>
                        <Input
                          onChange={(evt: any) =>
                            this.onChange(
                              evt.target.value,
                              org.org_id,
                              "org_name"
                            )
                          }
                          value={org.org_name || ""}
                          label="Org Name"
                          fullWidth={true}
                        />
                      </fieldset>
                      <fieldset className={styles.orgCity}>
                        <Input
                          onChange={(evt: any) =>
                            this.onChange(evt.target.value, org.org_id, "city")
                          }
                          value={org.city || ""}
                          label="City"
                          fullWidth={true}
                        />
                      </fieldset>
                      <fieldset className={styles.orgState}>
                        <Select
                          options={stateGroup}
                          label="State/Province *"
                          value={org.state || ""}
                          onChange={(evt: any) =>
                            this.onChange(evt.target.value, org.org_id, "state")
                          }
                          isRequired={true}
                        />
                      </fieldset>
                    </div>
                    <div className={styles.formLabel}>
                      Merchant Payment Accounts
                    </div>
                    <div className={styles.merchantPaymentForm}>
                      <Checkbox
                        options={[
                          {
                            label: "Stripe Connect ID",
                            checked: Boolean(org.stripe_enabled_YN),
                          },
                          {
                            label: "Authorize.NET",
                            checked: Boolean(org.authdotnet_enabled_YN),
                          },
                        ]}
                        onChange={(e: any) =>
                          this.onMerchantPaymentChange(e, org)
                        }
                      />
                      <div className={styles.merchantInputs}>
                        <div className={styles.merchantInput}>
                          <Input
                            onChange={(evt: any) =>
                              this.onChange(
                                evt.target.value,
                                org.org_id,
                                "stripe_connect_id"
                              )
                            }
                            disabled={!stripeEditable}
                            value={org.stripe_connect_id || ""}
                            fullWidth={true}
                          />
                          {!stripeEditable ? (
                            <Button
                              variant="contained"
                              color="primary"
                              label="Edit"
                              onClick={this.toggleEditableStripe}
                            />
                          ) : (
                            <div style={{ display: "flex" }}>
                              <Button
                                icon={getIcon(Icons.DONE)}
                                variant="text"
                                type="icon"
                                label=""
                                color="default"
                                onClick={this.toggleEditableStripe}
                              />
                              <Button
                                icon={getIcon(Icons.CLOSE)}
                                variant="text"
                                type="icon"
                                label=""
                                color="default"
                                onClick={this.onCancelStripeEdit}
                              />
                            </div>
                          )}
                        </div>
                        <div className={styles.merchantInput}>
                          <Input
                            onChange={(evt: any) =>
                              this.onChange(
                                evt.target.value,
                                org.org_id,
                                "authdotnet_id"
                              )
                            }
                            disabled={!authnetEditable}
                            value={org.authdotnet_id || ""}
                            fullWidth={true}
                          />
                          {!authnetEditable ? (
                            <Button
                              variant="contained"
                              color="primary"
                              label="Edit"
                              onClick={this.toggleEditableAuthNet}
                            />
                          ) : (
                            <div style={{ display: "flex" }}>
                              <Button
                                icon={getIcon(Icons.DONE)}
                                variant="text"
                                type="icon"
                                label=""
                                color="default"
                                onClick={this.toggleEditableAuthNet}
                              />
                              <Button
                                icon={getIcon(Icons.CLOSE)}
                                variant="text"
                                type="icon"
                                label=""
                                color="default"
                                onClick={this.onCancelAuthnetEdit}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionDropdown>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }
}

export default OrganizationInfo;
