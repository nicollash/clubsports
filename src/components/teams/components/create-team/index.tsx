import React from 'react';
import { connect } from 'react-redux';
import { History } from 'history';
import styles from './styles.module.scss';
import Paper from 'components/common/paper';
import Button from 'components/common/buttons/button';
import FabButton from 'components/common/fab-button';
import HeadingLevelTwo from 'components/common/headings/heading-level-two';
import AddTeamForm from './create-team-form';
import { createTeams } from '../../logic/actions';
import {
  BindingCbWithOne,
  IDivision,
  ITeam,
  BindingCbWithTwo,
} from 'common/models';
import { PopupExposure } from 'components/common';

interface ICreateTeamState {
  teams: Partial<ITeam>[];
  isModalOpen: boolean;
  changesAreMade: boolean;
}

interface ICreateTeamProps {
  history: History;
  match: any;
  divisions: IDivision[];
  createTeams: BindingCbWithTwo<Partial<ITeam>[], string>;
  getDivisions: BindingCbWithOne<string>;
}

class CreateTeam extends React.Component<ICreateTeamProps, ICreateTeamState> {
  eventId = this.props.match.params.eventId;
  state = { teams: [{}], isModalOpen: false, changesAreMade: false };

  onChange = (name: string, value: string | number, index: number) => {
    this.setState(({ teams }) => ({
      teams: teams.map(team =>
        team === teams[index] ? { ...team, [name]: value } : team
      ),
    }));
    if (!this.state.changesAreMade) {
      this.setState({ changesAreMade: true });
    }
  };

  onCancel = () => {
    if (this.state.changesAreMade) {
      this.setState({ isModalOpen: true });
    } else {
      this.onExit();
    }
  };

  onSave = () => {
    this.props.createTeams(this.state.teams, this.eventId);
    this.setState({ isModalOpen: false });
  };

  onAddTeam = () => {
    this.setState({ teams: [...this.state.teams, {}] });
  };

  onModalClose = () => {
    this.setState({ isModalOpen: false });
  };

  onExit = () => {
    this.props.history.goBack();
  };

  render() {
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
        <div className={styles.heading}>
          <HeadingLevelTwo>Create Team</HeadingLevelTwo>
        </div>
        {this.state.teams.map((_team, index) => (
          <AddTeamForm
            key={index}
            index={index}
            onChange={this.onChange}
            team={this.state.teams[index]}
            divisions={this.props.divisions}
          />
        ))}
        <Button
          label="+ Add Additional Team"
          variant="text"
          color="secondary"
          onClick={this.onAddTeam}
        />
        <PopupExposure
          isOpen={this.state.isModalOpen}
          onClose={this.onModalClose}
          onExitClick={this.onExit}
          onSaveClick={this.onSave}
        />
      </section>
    );
  }
}

interface IState {
  teams: any;
}

const mapStateToProps = (state: IState) => ({
  divisions: state.teams.divisions,
});

const mapDispatchToProps = {
  createTeams,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateTeam);
