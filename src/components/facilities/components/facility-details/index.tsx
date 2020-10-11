import React from 'react';
import Field from '../field';
import {
  Select,
  Checkbox,
  Button,
  Loader,
  Input,
  FileUpload,
  SectionDropdown,
  HeadingLevelThree,
  CardMessage,
  DatePicker,
} from 'components/common';
import { CardMessageTypes } from 'components/common/card-message/types';
import { FileUploadTypes, AcceptFileTypes } from '../../../common/file-upload';
import PlacesAutocompleteInput, {
  IPosition,
} from '../../../event-details/primary-information/map/autocomplete';
import Map from '../../../event-details/primary-information/map';
import { timeToDate, dateToTime } from 'helpers';
import {
  IFacility,
  IField,
  IUploadFile,
  BindingCbWithOne,
  BindingCbWithTwo,
} from 'common/models';
import styles from './styles.module.scss';
import DeleteIcon from '@material-ui/icons/Delete';
import DeletePopupConfrim from 'components/common/delete-popup-confirm';
import { IInputEvent } from 'common/types';
import { getIncrementSelectOptions } from '../../helpers';

const STYLES_FACILITIES_DESCRIPTION_CARD_MESSAGE = {
  marginTop: '10px',
};

enum FormFields {
  FACILITIES_DESCRIPTION = 'facilities_description',
  ADDRESS_ONE = 'address1',
  NUM_FIELDS = 'num_fields',
  RESTROOM = 'restrooms',
  NUM_TOILETS = 'num_toilets',
  RESTROOM_DETAILS = 'restroom_details',
  FIRST_GAME_TIME = 'first_game_time',
  LAST_GAME_END = 'last_game_end',
  PARKING_AVAILABLE = 'parking_available',
  PARKING_PROXIMITY = 'parking_proximity',
  GOLF_CARTS_AVAILABLE = 'golf_carts_available',
  PARKING_DETAILS = 'parking_details',
}

enum ParkingAvailableOptions {
  AMPLE = 'Ample',
  RESTRICTED = 'Restricted',
  VERY_RESTRICTED = 'Very Restricted',
}

enum RestroomOptions {
  IN_FACILITY = 'In Facility',
  PORTABLE = 'Portable',
  BOTHINNOUT = 'Both In Facility & Portable'
}

const FACILITY_FIELD_MAP_KEY = 'field_map_URL';

interface State {
  isEdit: boolean;
  isRestRoomDetails: boolean;
  isParkingDetails: boolean;
  isDeleteModalOpen: boolean;
}

interface Props {
  facility: IFacility;
  fields: IField[];
  facilitiyNumber: number;
  loadFields: (facilityId: string) => void;
  addEmptyFields: (facility: IFacility, incrementCount: number) => void;
  updateField: BindingCbWithOne<IField>;
  updateFacilities: BindingCbWithOne<IFacility>;
  uploadFileMap: (facility: IFacility, files: IUploadFile[]) => void;
  isSectionExpand: boolean;
  deleteFacility: BindingCbWithOne<string>;
  deleteField: BindingCbWithTwo<IFacility, IField>;
}

class FacilityDetails extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isEdit: Boolean(props.facility.isNew),
      isRestRoomDetails: Boolean(props.facility.restroom_details),
      isParkingDetails: Boolean(props.facility.parking_details),
      isDeleteModalOpen: false,
    };
  }

  onChangeFacility = (name: FormFields, value: string | number) => {
    const { facility, updateFacilities } = this.props;

    updateFacilities({ ...facility, [name]: value });
  };

  onAdressSelect = ({
    position,
    state,
    city,
  }: {
    position: IPosition;
    state: string;
    city: string;
  }) => {
    const { facility, updateFacilities } = this.props;
    updateFacilities({
      ...facility,
      facility_lat: position.lat,
      facility_long: position.lng,
      state,
      city,
    });
  };

  onChangeField = (field: IField) => {
    const { updateField } = this.props;

    updateField(field);
  };

  onChangeFieldsCount = ({ target }: IInputEvent) => {
    const { fields, facility } = this.props;
    const inputValue = Number(target.value);

    if (inputValue > fields.length) {
      const incrementValue = inputValue - fields.length;
      this.onChangeFacility(FormFields.NUM_FIELDS, inputValue);

      this.props.addEmptyFields(facility, incrementValue);
    }
  };

  onEditClick = () => this.setState(({ isEdit }) => ({ isEdit: !isEdit }));

  onMapFileUpload = (files: File[]) => {
    const { facility, uploadFileMap } = this.props;

    uploadFileMap(
      facility,
      files.map((file: File) => ({
        file,
        destinationType: FACILITY_FIELD_MAP_KEY,
      }))
    );
  };

  onDeleteFacility = () => {
    this.props.deleteFacility(this.props.facility.facilities_id);
  };

  onDeleteClick = () => {
    this.setState({ isDeleteModalOpen: true });
  };

  onDeleteModalClose = () => {
    this.setState({ isDeleteModalOpen: false });
  };

  onLocationChange = (address: string) => {
    this.onChangeFacility(FormFields.ADDRESS_ONE, address);
  };

  render() {
    const { facility, fields, facilitiyNumber, loadFields } = this.props;
    const { isEdit, isRestRoomDetails, isParkingDetails } = this.state;

    if (
      !facility.isNew &&
      !facility.isFieldsLoading &&
      !facility.isFieldsLoaded
    ) {
      loadFields(facility.facilities_id);
    }

    const { facility_lat: lat, facility_long: lng } = this.props.facility;

    const deleteMessage = `You are about to delete this facility and this cannot be undone. Fields (${Number(
      facility.num_fields
    )}) of this facility will be deleted too.
      Please, enter the name of the facility to continue.`;

    const fieldsSelectOptions = getIncrementSelectOptions(fields.length);

    return (
      <SectionDropdown
        id={facility.facilities_description}
        type="section"
        panelDetailsType="flat"
        expanded={this.props.isSectionExpand}
        useShadow={true}
      >
        <HeadingLevelThree>
          <span className={styles.detailsSubtitle}>
            Facility {facilitiyNumber} Details
          </span>
        </HeadingLevelThree>
        <form className={styles.form} autoComplete="off">
          <div className={styles.container}>
            <div className={styles.section}>
              <h3 className={styles.detailsSubtitle}>
                Location {facilitiyNumber}
              </h3>
              <fieldset className={`${styles.filedset} ${styles.filedsetName}`}>
                <Input
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                    this.onChangeFacility(
                      FormFields.FACILITIES_DESCRIPTION,
                      evt.target.value
                    )
                  }
                  value={facility.facilities_description || ''}
                  disabled={!isEdit}
                  placeholder={'Big Sports Complex'}
                  label="Facility Name"
                  width="100%"
                />
                <CardMessage
                  type={CardMessageTypes.EMODJI_OBJECTS}
                  style={STYLES_FACILITIES_DESCRIPTION_CARD_MESSAGE}
                >
                  The initials of the facility name will be used as the
                  facilities abbreviation in reports.
                </CardMessage>
              </fieldset>
              <fieldset className={`${styles.filedset} ${styles.filedsetName}`}>
                <PlacesAutocompleteInput
                  onSelect={this.onAdressSelect}
                  onChange={this.onLocationChange}
                  address={facility.address1 || ''}
                  disabled={!isEdit}
                  label={'Facility Address'}
                />
              </fieldset>
              <div className={`${styles.filedset} ${styles.filedsetGameTimes}`}>
                <DatePicker
                  minWidth="100%"
                  label="First Game Start"
                  type="time"
                  value={timeToDate(facility.first_game_time || '')}
                  onChange={(date: Date) =>
                    this.onChangeFacility(
                      FormFields.FIRST_GAME_TIME,
                      dateToTime(date)
                    )
                  }
                  disabled={!isEdit}
                />
                <DatePicker
                  minWidth="100%"
                  label="Last Game Ends By"
                  type="time"
                  value={timeToDate(facility.last_game_end || '')}
                  onChange={(date: Date) =>
                    this.onChangeFacility(
                      FormFields.LAST_GAME_END,
                      dateToTime(date)
                    )
                  }
                  disabled={!isEdit}
                />
              </div>
              <fieldset
                className={`${styles.filedset} ${styles.filedsetFields}`}
              >
                <Select
                  onChange={this.onChangeFieldsCount}
                  value={`${fields.length || ''}`}
                  options={fieldsSelectOptions}
                  width="100%"
                  label="Number of Fields"
                  disabled={!isEdit}
                />
              </fieldset>
            </div>
            <div className={styles.section}>
              <Map
                position={{
                  lat: lat || 39.521305,
                  lng: lng || -76.6451518,
                }}
              />
            </div>
            <div className={`${styles.section} ${styles.btnsContainer}`}>
              <Button
                onClick={this.onEditClick}
                label="Edit"
                variant={isEdit ? 'contained' : 'text'}
                color={isEdit ? 'primary' : 'secondary'}
              />
              <Button
                label="Delete"
                variant="text"
                color="secondary"
                type="dangerLink"
                icon={<DeleteIcon style={{ fill: '#FF0F19' }} />}
                onClick={this.onDeleteClick}
              />
            </div>
          </div>
          <ul className={styles.fieldList}>
            {facility.isFieldsLoading ? (
              <Loader />
            ) : (
                fields.map((it, idx) => (
                  <li key={it.field_id}>
                    <Field
                      field={it}
                      facility={facility}
                      fieldNumber={idx + 1}
                      isEdit={isEdit}
                      onChangeField={this.onChangeField}
                      deleteField={this.props.deleteField}
                    />
                  </li>
                ))
              )}
          </ul>
          <div className={styles.restroomWrapper}>
            <fieldset
              className={`${styles.filedset} ${styles.filedsetRestrooms}`}
            >
              <Select
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                  this.onChangeFacility(FormFields.RESTROOM, evt.target.value)
                }
                value={facility.restrooms || ''}
                name="restrooms"
                options={Object.values(RestroomOptions).map(type => ({
                  label: type,
                  value: type,
                }))}
                disabled={!isEdit}
                width="100%"
                label="Restrooms"
              />
            </fieldset>
            <fieldset
              className={`${styles.filedset} ${styles.filedsetToiltes}`}
            >
              <Input
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                  this.onChangeFacility(
                    FormFields.NUM_TOILETS,
                    evt.target.value
                  )
                }
                value={facility.num_toilets || ''}
                name={FormFields.NUM_TOILETS}
                disabled={!isEdit}
                width="100%"
                label="Approx. # of Portable Toilets"
              />
            </fieldset>
          </div>
          <fieldset className={`${styles.filedset} ${styles.restroomDetails}`}>
            <Checkbox
              onChange={() =>
                this.setState(({ isRestRoomDetails }) => ({
                  isRestRoomDetails: !isRestRoomDetails,
                }
                ))
              }
              options={[
                {
                  label: 'Restroom Details',
                  checked: isRestRoomDetails,
                  disabled: !isEdit,
                },
              ]}
            />
            {(isRestRoomDetails || facility.restroom_details) && (
              <Input
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                  this.onChangeFacility(
                    FormFields.RESTROOM_DETAILS,
                    evt.target.value
                  )
                }
                value={facility.restroom_details || ''}
                disabled={!isEdit}
                placeholder = "Clean, gross, unknown..."
                width="75%"
              />
            )}
          </fieldset>
          <div className={styles.parkingWrapper}>
            <fieldset
              className={`${styles.filedset} ${styles.filedsetParkingAvailable}`}
            >
              <Select
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                  this.onChangeFacility(
                    FormFields.PARKING_AVAILABLE,
                    evt.target.value
                  )
                }
                value={facility.parking_available || ''}
                name="parking_available"
                options={Object.keys(ParkingAvailableOptions).map(type => ({
                  label: ParkingAvailableOptions[type],
                  value: ParkingAvailableOptions[type],
                }))}
                width="75%"
                disabled={!isEdit}
                label="Parking Availability"
              />
            </fieldset>
            <fieldset
              className={`${styles.filedset} ${styles.filedsetDistanceFields}`}
            >
              <Input
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                  this.onChangeFacility(
                    FormFields.PARKING_PROXIMITY,
                    evt.target.value
                  )
                }
                value={facility.parking_proximity || ''}
                disabled={!isEdit}
                endAdornment="(walk in minutes)"
                width="100%"
                label="Main Parking; Distance to Fields (approx)"
              />
            </fieldset>
            <fieldset className={`${styles.filedset} ${styles.filedsetGolf}`}>
              <Checkbox
                onChange={() =>
                  this.onChangeFacility(
                    FormFields.GOLF_CARTS_AVAILABLE,
                    facility.golf_carts_available ? 0 : 1
                  )
                }
                options={[
                  {
                    label: 'Golf Carts Available',
                    checked: Boolean(facility.golf_carts_available),
                    disabled: !isEdit,
                  },
                ]}
              />
            </fieldset>
          </div>
          <fieldset className={`${styles.filedset} ${styles.parkingDetails}`}>
            <Checkbox
              onChange={() =>
                this.setState(({ isParkingDetails }) => ({
                  isParkingDetails: !isParkingDetails,
                }))
              }
              options={[
                {
                  label: 'Parking Details',
                  checked: isParkingDetails,
                  disabled: !isEdit,
                },
              ]}
            />
            {(isParkingDetails || facility.parking_details) && (
              <>
                <div className={styles.parkingDetailsWrapper}>
                  <Input
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      this.onChangeFacility(
                        FormFields.PARKING_DETAILS,
                        evt.target.value
                      )
                    }
                    value={facility.parking_details || ''}
                    width="75%"
                    disabled={!isEdit}
                  />
                </div>
                <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
                  Notify your attendees they need to know something. For example, if cars will be aggressively ticketed, parking will be tight, etc.
                </CardMessage>
              </>
            )}
          </fieldset>
          <fieldset className={styles.filedset} disabled={!isEdit}>
            <FileUpload
              type={FileUploadTypes.BUTTON}
              acceptTypes={[AcceptFileTypes.JPG, AcceptFileTypes.JPG, AcceptFileTypes.PNG, AcceptFileTypes.SVG, AcceptFileTypes.JFIF]}
              onUpload={this.onMapFileUpload}
            />
          </fieldset>
          <DeletePopupConfrim
            type={'facility'}
            deleteTitle={facility.facilities_description}
            message={deleteMessage}
            isOpen={this.state.isDeleteModalOpen}
            onClose={this.onDeleteModalClose}
            onDeleteClick={this.onDeleteFacility}
          />
        </form>
      </SectionDropdown>
    );
  }
}

export default FacilityDetails;
