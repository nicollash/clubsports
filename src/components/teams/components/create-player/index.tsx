import React from "react";
import { connect } from "react-redux";
import { History } from "history";
import styles from "../create-team/styles.module.scss";
import Paper from "components/common/paper";
import Button from "components/common/buttons/button";
import FabButton from "components/common/fab-button";
import HeadingLevelTwo from "components/common/headings/heading-level-two";
import AddPlayerForm from "./create-player-form";
import { createPlayers } from "../../logic/actions";
import { ITeam, BindingCbWithOne, IPlayer, IDivision } from "common/models";
import { PopupExposure } from "components/common";

interface ICreatePlayerState {
  players: Partial<IPlayer>[];
  isModalOpen: boolean;
  changesAreMade: boolean;
}

interface ICreatePlayerProps {
  history: History;
  match: any;
  teams: ITeam[];
  divisions: IDivision[];
  createPlayers: BindingCbWithOne<Partial<IPlayer>[]>;
}

class CreatePlayer extends React.Component<
  ICreatePlayerProps,
  ICreatePlayerState
> {
  state = { players: [{}], isModalOpen: false, changesAreMade: false };

  onChange = (name: string, value: string | number, index: number) => {
    this.setState(({ players }) => ({
      players: players.map((player) =>
        player === players[index] ? { ...player, [name]: value } : player
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
    const { players } = this.state;
    this.props.createPlayers(players);
    this.setState({ isModalOpen: false });
  };

  onAddPlayer = () => {
    this.setState({ players: [...this.state.players, {}] });
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
          <HeadingLevelTwo>Create Player</HeadingLevelTwo>
        </div>
        {this.state.players.map((_player, index) => (
          <AddPlayerForm
            key={index}
            index={index}
            onChange={this.onChange}
            player={_player}
            teams={this.props.teams}
            divisions={this.props.divisions}
          />
        ))}
        <Button
          label="+ Add Additional Player"
          variant="text"
          color="secondary"
          onClick={this.onAddPlayer}
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
  divisions: any;
}

const mapStateToProps = (state: IState) => ({
  teams: state.teams.teams,
  divisions: state.teams.divisions,
});

const mapDispatchToProps = {
  createPlayers,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreatePlayer);
