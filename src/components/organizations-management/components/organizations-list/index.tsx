import React from 'react';
import {
  SectionDropdown,
  HeadingLevelThree,
  Button,
  Paper,
  Tooltip,
  ButtonCopy,
} from 'components/common';
import PopupDeleteConfirm from 'components/common/delete-popup-confirm';
import { IOrganization } from 'common/models';
import { Icons, ButtonColors, ButtonVariant } from 'common/enums';
import { getIcon } from 'helpers';
import styles from './styles.module.scss';

const COPY_ICON_STYLES = {
  width: '140px',
};

interface Props {
  organizations: IOrganization[];
  deleteOrganization: (organization: IOrganization) => void;
  isSectionExpand: boolean;
}

const OrganizationsList = ({
  organizations,
  deleteOrganization,
  isSectionExpand,
}: Props) => {
  const [configOrg, onDeletePopup] = React.useState<null | IOrganization>(null);

  const renderDisabledBtn = () => {
    return (
      <Tooltip
        type="info"
        title="You must be a part of at least one organization.
        You need to join another organization before you are able to delete this one."
      >
        <span className={styles.delBtnWrapper}>
          <Button
            onClick={() => {}}
            icon={getIcon(Icons.DELETE)}
            label="Delete"
            variant="text"
            color="inherit"
            disabled={true}
          />
        </span>
      </Tooltip>
    );
  };

  const deleteMessage = `You are about to delete this organization and this cannot be undone.
  Please, enter the name of the organization to continue.`;

  return (
    <>
      <SectionDropdown
        type="section"
        useShadow={true}
        panelDetailsType="flat"
        expanded={isSectionExpand}
      >
        <HeadingLevelThree>
          <span>Organizations List</span>
        </HeadingLevelThree>
        <div className={styles.sectWrapper}>
          {organizations.length > 0 ? (
            <>
              <p className={styles.description}>
                Organizations to which you currently belong:
              </p>
              <div className={styles.orgTableWrapper}>
                <Paper>
                  <table className={styles.orgTable}>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Name</th>
                        <th>@Tag</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Invitation Code</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizations.map((organization, index) => (
                        <tr
                          className={styles.listItem}
                          key={organization.org_id}
                        >
                          <td>{`${index + 1}.`}</td>
                          <td>{organization.org_name}</td>
                          <td>{organization.org_tag}</td>
                          <td>{organization.city}</td>
                          <td>{organization.state}</td>
                          <td>
                            <ButtonCopy
                              copyString={organization.org_id}
                              label={organization.org_id}
                              color={ButtonColors.SECONDARY}
                              variant={ButtonVariant.TEXT}
                              style={COPY_ICON_STYLES}
                            />
                          </td>
                          <td>
                            {organizations.length === 1 ? (
                              renderDisabledBtn()
                            ) : (
                              <span className={styles.delBtnWrapper}>
                                <Button
                                  onClick={() => onDeletePopup(organization)}
                                  icon={getIcon(Icons.DELETE)}
                                  label="Delete"
                                  variant="text"
                                  color="inherit"
                                />
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Paper>
              </div>
            </>
          ) : (
            <span className={styles.noFound}>
              Sorry, you are not in organization yet. You can create your own or
              apply invitation from other user.
            </span>
          )}
        </div>
      </SectionDropdown>
      {configOrg && (
        <PopupDeleteConfirm
          type={'organization'}
          deleteTitle={configOrg.org_name}
          message={deleteMessage}
          isOpen={Boolean(configOrg)}
          onClose={() => onDeletePopup(null)}
          onDeleteClick={() => {
            deleteOrganization(configOrg);
            onDeletePopup(null);
          }}
        />
      )}
    </>
  );
};

export default OrganizationsList;
