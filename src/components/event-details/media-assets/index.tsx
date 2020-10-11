import React from "react";
import { SectionDropdown, HeadingLevelThree } from "components/common";

import FileUpload, {
  FileUploadTypes,
  AcceptFileTypes,
} from "components/common/file-upload";
import { ButtonCopy, Button } from "components/common";
import {
  EventMenuTitles,
  ButtonColors,
  ButtonVariant,
  Icons,
} from "common/enums";
import { onImageSave } from "helpers";
import { getIcon } from "helpers/get-icon.helper";

import { IIconFile } from "../logic/model";
import { UploadLogoTypes } from "../state";
import styles from "../styles.module.scss";
import { CardMessageTypes } from "components/common/card-message/types";
import { CardMessage } from "components/common";

const CARD_MESSAGE_STYLES = {
  marginBottom: 30,
  width: "100%",
};

const EDIT_ICON_STYLES = {
  width: "21px",
  marginRight: "5px",
  fill: "#00a3ea",
};

interface IProps {
  onFileUpload: (files: IIconFile[]) => void;
  onFileRemove: (files: IIconFile[]) => void;
  isSectionExpand: boolean;
  logo?: string;
  mobileLogo?: string;
}

const image = {
  SMALL:
    "https://clublacrosse.s3.amazonaws.com/Images/Powered+By+Club+Lax+Dot+Org+Small.png",
  MEDIUM:
    "https://clublacrosse.s3.amazonaws.com/Images/Powered+By+Club+Lax+Dot+Org+Medium.png",
  LARGE:
    "https://clublacrosse.s3.amazonaws.com/Images/Powered+By+Club+Lax+Dot+Org+Large.png",
};

const MediaAssetsSection: React.FC<IProps> = (props) => {
  const {
    onFileUpload,
    onFileRemove,
    isSectionExpand,
    logo,
    mobileLogo,
  } = props;

  const populateFileObj = (
    files: File[],
    destinationType: string
  ): IIconFile[] => files.map((file) => ({ file, destinationType }));

  const onDesktopFileUpload = (files: File[]) =>
    onFileUpload(populateFileObj(files, UploadLogoTypes.DESKTOP));

  const onMobileFileUpload = (files: File[]) =>
    onFileUpload(populateFileObj(files, UploadLogoTypes.MOBILE));

  const onDesktopFileRemove = (files: File[]) =>
    onFileRemove(populateFileObj(files, UploadLogoTypes.DESKTOP));

  const onMobileFileRemove = (files: File[]) =>
    onFileRemove(populateFileObj(files, UploadLogoTypes.MOBILE));

  return (
    <SectionDropdown
      id={EventMenuTitles.MEDIA_ASSETS}
      type="section"
      panelDetailsType="flat"
      useShadow={true}
      expanded={isSectionExpand}
    >
      <HeadingLevelThree>
        <span className={styles.blockHeading}>Media Assets</span>
      </HeadingLevelThree>
      <div style={{ width: "100%" }}>
        <CardMessage
          style={CARD_MESSAGE_STYLES}
          type={CardMessageTypes.EMODJI_OBJECTS}
        >
          Desktop Icons are for display if the user is on a computer (larger
          pixel). Mobile is for lower resolution on the mobile.
        </CardMessage>

        <div className={styles.maDetails}>
          <div className={styles.uploadWrapper}>
            <div className={styles.uploadBlock}>
              <span className={styles.uploadBlockTitle}>Desktop Icon</span>
              <FileUpload
                type={FileUploadTypes.SECTION}
                acceptTypes={[
                  AcceptFileTypes.JPG,
                  AcceptFileTypes.JPEG,
                  AcceptFileTypes.PNG,
                  AcceptFileTypes.SVG,
                ]}
                onUpload={onDesktopFileUpload}
                onFileRemove={onDesktopFileRemove}
                logo={logo}
              />
            </div>
            <div className={styles.uploadBlock}>
              <span className={styles.uploadBlockTitle}>Mobile Icon</span>
              <FileUpload
                type={FileUploadTypes.SECTION}
                acceptTypes={[
                  AcceptFileTypes.JPG,
                  AcceptFileTypes.JPEG,
                  AcceptFileTypes.PNG,
                  AcceptFileTypes.SVG,
                ]}
                onUpload={onMobileFileUpload}
                onFileRemove={onMobileFileRemove}
                logo={mobileLogo}
              />
            </div>
            <div className={styles.uploadBlock}>
              <span className={styles.uploadBlockTitle}>
                Download our Media Assets
              </span>
              <div className={styles.downloadContainer}>
                <img
                  className={styles.downloadImage}
                  src="https://clublacrosse.s3.amazonaws.com/Images/Powered+By+Club+Lax+Dot+Org+Small.png"
                  alt="logo"
                />
                <table>
                  <tbody>
                    <tr>
                      <td>Small</td>
                      <td>
                        <Button
                          onClick={() => onImageSave(image.SMALL)}
                          icon={getIcon(Icons.GET_APP, EDIT_ICON_STYLES)}
                          variant={ButtonVariant.TEXT}
                          color={ButtonColors.SECONDARY}
                          label="Download"
                        />
                      </td>
                      <td>
                        <ButtonCopy
                          copyString={image.SMALL}
                          label={"Link"}
                          color={ButtonColors.SECONDARY}
                          variant={ButtonVariant.TEXT}
                          style={{
                            width: "40px",
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Medium</td>
                      <td>
                        <Button
                          onClick={() => onImageSave(image.MEDIUM)}
                          icon={getIcon(Icons.GET_APP, EDIT_ICON_STYLES)}
                          variant={ButtonVariant.TEXT}
                          color={ButtonColors.SECONDARY}
                          label="Download"
                        />
                      </td>
                      <td>
                        <ButtonCopy
                          copyString={image.MEDIUM}
                          label={"Link"}
                          color={ButtonColors.SECONDARY}
                          variant={ButtonVariant.TEXT}
                          style={{
                            width: "40px",
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Large</td>
                      <td>
                        <Button
                          onClick={() => onImageSave(image.LARGE)}
                          icon={getIcon(Icons.GET_APP, EDIT_ICON_STYLES)}
                          variant={ButtonVariant.TEXT}
                          color={ButtonColors.SECONDARY}
                          label="Download"
                        />
                      </td>
                      <td>
                        <ButtonCopy
                          copyString={image.LARGE}
                          label={"Link"}
                          color={ButtonColors.SECONDARY}
                          variant={ButtonVariant.TEXT}
                          style={{
                            width: "40px",
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionDropdown>
  );
};

export default MediaAssetsSection;
