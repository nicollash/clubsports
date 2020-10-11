import React from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { IAppState } from 'reducers/root-reducer.types';
import {
  loadFacilities,
  loadFields,
  addEmptyFacility,
  addEmptyFields,
  updateFacilities,
  updateField,
  uploadFileMap,
  saveFacilities,
  createFacilities,
  deleteFacility,
  deleteField,
} from './logic/actions';
import { addEntitiesToLibrary } from 'components/authorized-page/authorized-page-event/logic/actions';
import Navigation from './components/navigation';
import FacilityDetails from './components/facility-details';
import {
  HeadingLevelTwo,
  CardMessage,
  Select,
  Loader,
  Button,
  PopupExposure,
  CsvLoader,
  PopupAddToLibrary,
} from 'components/common';
import {
  IFacility,
  IField,
  IUploadFile,
  BindingCbWithOne,
  BindingCbWithTwo,
} from 'common/models';
import { EntryPoints } from 'common/enums';
import { IEntity, IInputEvent } from 'common/types';
import { getIncrementSelectOptions } from './helpers';
import history from '../../browserhistory';
import styles from './styles.module.scss';
import { CardMessageTypes } from "components/common/card-message/types";

const CARD_MESSAGE_STYLES = {
  marginBottom: 10,
  width: "100%",
};

interface MatchParams {
  eventId?: string;
}

interface Props {
  isLoading: boolean;
  facilities: IFacility[];
  fields: IField[];
  loadFacilities: (eventId: string) => void;
  loadFields: (facilityId: string) => void;
  addEmptyFacility: (incrementCount: number) => void;
  addEmptyFields: (facility: IFacility, incrementCount: number) => void;
  updateFacilities: BindingCbWithOne<IFacility>;
  updateField: BindingCbWithOne<IField>;
  saveFacilities: BindingCbWithTwo<IFacility[], IField[]>;
  uploadFileMap: (facility: IFacility, files: IUploadFile[]) => void;
  createFacilities: (facilities: IFacility[]) => void;
  addEntitiesToLibrary: BindingCbWithTwo<IEntity[], EntryPoints>;
  deleteFacility: (facilityId: string) => void;
  deleteField: BindingCbWithTwo<IFacility, IField>;
}

interface State {
  isSectionsExpand: boolean;
  isModalOpen: boolean;
  isCsvLoaderOpen: boolean;
  isLibraryPopupOpen: boolean;
}

class Facilities extends React.Component<
  Props & RouteComponentProps<MatchParams>,
  State
> {
  constructor(props: Props & RouteComponentProps<MatchParams>) {
    super(props);

    this.state = {
      isSectionsExpand: false,
      isModalOpen: false,
      isCsvLoaderOpen: false,
      isLibraryPopupOpen: false,
    };
  }

  componentDidMount() {
    const { loadFacilities } = this.props;
    const eventId = this.props.match.params.eventId;

    if (eventId) {
      loadFacilities(eventId);
    }
  }

  onChangeFacilitiesCount = ({ target }: IInputEvent) => {
    const { facilities, addEmptyFacility } = this.props;
    const inputValue = Number(target.value);

    if (inputValue > facilities.length) {
      const incrementValue = inputValue - facilities.length;

      addEmptyFacility(incrementValue);
    }
  };

  savingFacilities = () => {
    const { facilities, fields, saveFacilities } = this.props;

    saveFacilities(facilities, fields);

    this.setState({ isModalOpen: false });
  };

  onModalClose = () => {
    this.setState({ isModalOpen: false });
  };

  onCancelClick = () => {
    const changesAreMade = this.props.facilities.some(
      facility => facility.isChange
    );
    if (changesAreMade) {
      this.setState({ isModalOpen: true });
    } else {
      this.onCancel();
    }
  };

  onCancel = () => {
    history.push(`/event/event-details/${this.props.match.params.eventId}`);
  };

  onCsvLoaderBtn = () => {
    this.setState({ isCsvLoaderOpen: true });
  };

  onCsvLoaderClose = () => {
    this.setState({ isCsvLoaderOpen: false });
  };

  toggleLibraryPopup = () => {
    this.setState(({ isLibraryPopupOpen }) => ({
      isLibraryPopupOpen: !isLibraryPopupOpen,
    }));
  };

  toggleSectionCollapse = () => {
    this.setState({ isSectionsExpand: !this.state.isSectionsExpand });
  };

  render() {
    const {
      isLoading,
      facilities,
      fields,
      loadFields,
      addEmptyFields,
      updateFacilities,
      updateField,
      uploadFileMap,
      deleteFacility,
      deleteField,
    } = this.props;

    const { isLibraryPopupOpen } = this.state;

    const facilitiesSelectOptions = getIncrementSelectOptions(
      facilities.length
    );

    if (isLoading) {
      return <Loader />;
    }

    return (
      <section>
        <Navigation
          onClick={this.savingFacilities}
          onCancelClick={this.onCancelClick}
          onCsvLoaderBtn={this.onCsvLoaderBtn}
          toggleLibraryPopup={this.toggleLibraryPopup}
        />
        <div className={styles.sectionWrapper}>
          <div className={styles.headingWrapper}>
            <HeadingLevelTwo>Facilities</HeadingLevelTwo>
          </div>
          <div>
          <CardMessage
            style={CARD_MESSAGE_STYLES}
            type={CardMessageTypes.EMODJI_OBJECTS}
          > We can handle as many facilities as you need! Start by telling us how many. Or load from your library above or import from csv.
          </CardMessage>

          <div className={styles.numberWrapper}>
            <div className={styles.numberTitleWrapper}>
              <div>Number of Facilities</div>
            </div>
            <div className={styles.numberContainer}>
              <Select
                onChange={this.onChangeFacilitiesCount}
                value={`${facilities.length || ''}`}
                options={facilitiesSelectOptions}
                width="160px"
              />
              {facilities?.length ? (
                <Button
                  label={
                    this.state.isSectionsExpand ? 'Collapse All' : 'Expand All'
                  }
                  variant="text"
                  color="secondary"
                  onClick={this.toggleSectionCollapse}
                />
              ) : null}
            </div>
          </div>
          </div>
          <ul className={styles.facilitiesList}>
            {facilities
              .sort((a, b) => {
                if (a.isChange || b.isChange) {
                  return 0;
                }

                return a.facilities_description.localeCompare(
                  b.facilities_description,
                  undefined,
                  { numeric: true }
                );
              })
              .map((facilitiy, idx) => (
                <li
                  className={styles.facilitiesItem}
                  key={facilitiy.facilities_id}
                >
                  <FacilityDetails
                    facility={facilitiy}
                    fields={fields.filter(
                      it => it.facilities_id === facilitiy.facilities_id
                    )}
                    facilitiyNumber={idx + 1}
                    loadFields={loadFields}
                    addEmptyFields={addEmptyFields}
                    updateFacilities={updateFacilities}
                    updateField={updateField}
                    uploadFileMap={uploadFileMap}
                    isSectionExpand={this.state.isSectionsExpand}
                    deleteFacility={deleteFacility}
                    deleteField={deleteField}
                  />
                </li>
              ))}
          </ul>
        </div>
        <PopupExposure
          isOpen={this.state.isModalOpen}
          onClose={this.onModalClose}
          onExitClick={this.onCancel}
          onSaveClick={this.savingFacilities}
        />
        <CsvLoader
          isOpen={this.state.isCsvLoaderOpen}
          onClose={this.onCsvLoaderClose}
          type="facilities"
          onCreate={this.props.createFacilities}
          eventId={this.props.match.params.eventId}
        />
        <PopupAddToLibrary
          entities={facilities}
          entryPoint={EntryPoints.FACILITIES}
          isOpen={isLibraryPopupOpen}
          onClose={this.toggleLibraryPopup}
          addEntitiesToLibrary={this.props.addEntitiesToLibrary}
        />
      </section>

    );
  }
}

export default connect(
  (state: IAppState) => ({
    isLoading: state.facilities.isLoading,
    facilities: state.facilities.facilities,
    fields: state.facilities.fields,
  }),
  (dispatch: Dispatch) =>
    bindActionCreators(
      {
        loadFacilities,
        loadFields,
        addEmptyFacility,
        addEmptyFields,
        updateFacilities,
        updateField,
        saveFacilities,
        uploadFileMap,
        createFacilities,
        addEntitiesToLibrary,
        deleteFacility,
        deleteField,
      },
      dispatch
    )
)(Facilities);
