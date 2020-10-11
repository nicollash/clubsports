import React from 'react';
import { connect } from 'react-redux';
import { History, Location } from 'history';
import styles from './styles.module.scss';
import Paper from '../../common/paper';
import Button from '../../common/buttons/button';
import FabButton from 'components/common/fab-button';
import HeadingLevelTwo from '../../common/headings/heading-level-two';
import AddDivisionForm from './add-division-form';
import {
  saveDivisions,
  updateDivision,
  deleteDivision,
  getRegistration,
} from '../logic/actions';
import { loadFacilities } from 'components/facilities/logic/actions';
import {
  BindingCbWithOne,
  BindingCbWithTwo,
  BindingCbWithThree,
} from 'common/models/callback';
import DeleteIcon from '@material-ui/icons/Delete';
import { IDivision, ITeam, IPool, IFacility, IEventDetails } from 'common/models';
import { IRegistration } from 'common/models/registration';
import { PopupExposure } from 'components/common';
import DeletePopupConfrim from 'components/common/delete-popup-confirm';

interface ILocationState {
  divisionId: string;
  pools: IPool[];
  teams: ITeam[];
}

interface IAddDivisionState {
  defaultDivision: Partial<IDivision>;
  divisions: Partial<IDivision>[];
  isModalOpen: boolean;
  isModalConfirmOpen: boolean;
  changesAreMade: boolean;
}

interface IDivisionProps {
  event: IEventDetails;
  history: History;
  location: Location<ILocationState>;
  match: any;
  divisions: IDivision[];
  registration: IRegistration;
  facilities: IFacility[];
  saveDivisions: BindingCbWithTwo<Partial<IDivision>[], string>;
  getDivision: BindingCbWithOne<string>;
  updateDivision: BindingCbWithOne<Partial<IDivision>>;
  deleteDivision: BindingCbWithThree<string, IPool[], ITeam[]>;
  getRegistration: BindingCbWithOne<string>;
  loadFacilities: BindingCbWithOne<string>;
}

class AddDivision extends React.Component<IDivisionProps, IAddDivisionState> {
  divisionId = this.props.location.state?.divisionId;
  eventId = this.props.match.params.eventId;
  state = {
    defaultDivision: { division_hex: '1c315f' },
    divisions: [{ division_hex: '1c315f' }],
    isModalOpen: false,
    isModalConfirmOpen: false,
    changesAreMade: false,
  };

  componentDidMount() {
    if (this.divisionId) {
      const division: IDivision[] = this.props.divisions.filter(
        div => div.division_id === this.divisionId
      );
      this.setState({ divisions: [division[0]] });
    }
    this.props.getRegistration(this.eventId);
    this.props.loadFacilities(this.eventId);
  }

  onChange = (name: string, value: string | number, index: number) => {
    this.setState(({ divisions }) => ({
      divisions: divisions.map(division =>
        division === divisions[index]
          ? { ...division, [name]: value }
          : division
      ),
    }));
    if (!this.state.changesAreMade) {
      this.setState({ changesAreMade: true });
    }
  };

  onCancel = () => {
    if (this.state.changesAreMade) {
      this.setState({ isModalConfirmOpen: true });
    } else {
      this.onExit();
    }
  };

  onSave = () => {
    this.divisionId
      ? this.props.updateDivision(this.state.divisions[0])
      : this.props.saveDivisions(this.state.divisions, this.eventId);
    this.setState({ isModalConfirmOpen: false });
  };

  onAddDivision = () => {
    this.setState({
      divisions: [...this.state.divisions, this.state.defaultDivision],
    });
  };

  onDeleteDivisionClick = () => {
    this.setState({ isModalOpen: true });
  };

  onModalClose = () => {
    this.setState({ isModalOpen: false });
  };
  onModalConfirmClose = () => {
    this.setState({ isModalConfirmOpen: false });
  };

  onExit = () => {
    this.props.history.goBack();
  };

  onDeleteDivision = () => {
    this.props.deleteDivision(
      this.divisionId,
      this.props.location.state?.pools,
      this.props.location.state?.teams
    );
  };

  renderHeading = () => {
    const text = this.divisionId ? 'Edit Division' : 'Add Division';
    return <HeadingLevelTwo>{text}</HeadingLevelTwo>;
  };

  renderButton = () => {
    return this.divisionId ? (
      <Button
        label="Delete Division"
        variant="text"
        color="secondary"
        type="dangerLink"
        icon={<DeleteIcon style={{ fill: '#FF0F19' }} />}
        onClick={this.onDeleteDivisionClick}
      />
    ) : (
      <Button
        label="+ Add Additional Division"
        variant="text"
        color="secondary"
        onClick={this.onAddDivision}
      />
    );
  };

  componentDidUpdate(prevProps: IDivisionProps, prevState: IAddDivisionState) {
    if (
      this.props.registration &&
      !prevState.divisions[0]?.division_id &&
      prevProps.registration !== this.props.registration
    ) {
      this.setState({
        defaultDivision: {
          ...this.state.defaultDivision,
          ...(this.props.registration.entry_fee && {
            entry_fee: this.props.registration.entry_fee,
          }),
          ...(this.props.registration.max_teams_per_division && {
            max_num_teams: this.props.registration.max_teams_per_division,
          }),
        },
        divisions: [
          {
            ...this.state.divisions[0],
            ...(this.props.registration.entry_fee && {
              entry_fee: this.props.registration.entry_fee,
            }),
            ...(this.props.registration.max_teams_per_division && {
              max_num_teams: this.props.registration.max_teams_per_division,
            }),
          },
        ],
      });
    }
  }

  render() {
    const { long_name }: Partial<IDivision> = this.state.divisions[0] || '';
    const deleteMessage = `You are about to delete this division and this cannot be undone.
    Deleting a division will also delete all pools (${this.props.location.state?.pools.length}) and teams (${this.props.location.state?.teams.length}) inside the division.
    Please, enter the name of the division to continue.`;

    return (
      <section className={styles.container}>
        <Paper sticky={true}>
          <div className={styles.mainMenu}>
            <div className={styles.btnsWrapper}>
              <Button
                label="Cancel"
                variant="text"
                color="secondary"
                onClick={this.onCancel}
              />
              <Button
                label="Save"
                variant="contained"
                color="primary"
                onClick={this.onSave}
              />
              <FabButton
                onClick={this.onCancel}
                sequence={1}
                label="Cancel"
                variant="outlined"
              />
              <FabButton
                onClick={this.onSave}
                sequence={2}
                label="Save"
                variant="contained"
              />
            </div>
          </div>
        </Paper>
        <div className={styles.heading}>{this.renderHeading()}</div>
        {this.state.divisions.map((_division, index) => (
          <AddDivisionForm
            key={index}
            event={this.props.event!}
            index={index}
            onChange={this.onChange}
            division={this.state.divisions[index] || {}}
            registration={this.props.registration}
            facilities={this.props.facilities}
            divisions={this.props.divisions}
          />
        ))}
        {this.renderButton()}
        <DeletePopupConfrim
          type={'division'}
          message={deleteMessage}
          deleteTitle={long_name || ''}
          isOpen={this.state.isModalOpen}
          onClose={this.onModalClose}
          onDeleteClick={this.onDeleteDivision}
        />
        <PopupExposure
          isOpen={this.state.isModalConfirmOpen}
          onClose={this.onModalConfirmClose}
          onExitClick={this.onExit}
          onSaveClick={this.onSave}
        />
      </section>
    );
  }
}

interface IState {
  event: {data: IEventDetails};
  divisions: { data: IDivision[]; registration: IRegistration };
  facilities: { facilities: IFacility[] };
}

const mapStateToProps = (state: IState) => ({
  event: state.event.data,
  divisions: state.divisions.data,
  registration: state.divisions.registration,
  facilities: state.facilities.facilities,
});

const mapDispatchToProps = {
  saveDivisions,
  updateDivision,
  deleteDivision,
  getRegistration,
  loadFacilities,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddDivision);
