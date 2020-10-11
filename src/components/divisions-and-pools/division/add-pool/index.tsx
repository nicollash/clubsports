import React from 'react';
import Input from 'components/common/input';
import styles from './styles.module.scss';
import Button from 'components/common/buttons/button';
import { BindingCbWithOne, BindingAction, IDivision, IPool } from 'common/models';
import { PopupExposure, ColorPicker } from 'components/common';
import { PoolColorMatching } from "../auto-generate-pools-popup/consts";

interface IAddPoolState {
  divisions_id?: string;
  pool_name: string;
  pool_hex: string;
  isModalConfirmOpen: boolean;
}

interface IAddPoolProps {
  division: IDivision;
  pools: IPool[];
  numOfTeams: number;
  savePool: BindingCbWithOne<Partial<IAddPoolState>>;
  onClose: BindingAction;
}

class AddPool extends React.Component<IAddPoolProps, IAddPoolState> {
  state = {
    division_id: this.props.division.division_id,
    pool_name: '',
    pool_hex: '',
    isModalConfirmOpen: false,
  };

  onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ pool_name: e.target.value });
  };

  onColorChange = (value: string) => {
    this.setState({ pool_hex: value.replace(/#/, () => "") });
  };

  onModalClose = () => {
    this.setState({ isModalConfirmOpen: false });
  };

  onCancelClick = () => {
    const changesAreMade = !!this.state.pool_name || !!this.state.pool_hex;
    if (changesAreMade) {
      this.setState({ isModalConfirmOpen: true });
    } else {
      this.props.onClose();
    }
  };

  getDefaultColor = () => {
    const { pools } = this.props;
    const currentHexes = pools.map((pool: IPool) => pool.pool_hex);
    const currentDefaultHex = PoolColorMatching.find(
      (color) => !currentHexes.includes(color.hex)
    )?.hex;
    return currentDefaultHex ? currentDefaultHex : '1c315f';
  };

  onSave = () => {
    const { division_id, pool_name, pool_hex } = this.state;
    const currentDefaultHex = !pool_hex ? this.getDefaultColor() : pool_hex;

    const data = {
      division_id,
      pool_name,
      pool_hex: currentDefaultHex,
    };
    this.props.savePool(data);
    this.props.onClose();
  };

  render() {
    const { division } = this.props;
    const { pool_name, pool_hex } = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.sectionTitle}>Add Pool</div>
        <div className={styles.sectionRow}>
          <Input
            width="230px"
            label="Name"
            value={pool_name || ''}
            autofocus={true}
            onChange={this.onNameChange}
          />
          <div className={styles.sectionItemColorPicker}>
            <p className={styles.sectionLabel}>
              <span>Color</span>
            </p>
            <ColorPicker
              label="Color"
              width="221px"
              value={!pool_hex ? this.getDefaultColor() : pool_hex}
              onChange={this.onColorChange}
            />
          </div>
        </div>
        <div className={styles.sectionItem}>
          <span className={styles.title}>Division:</span>{' '}
          {division.short_name || '—'}
        </div>
        <div className={styles.sectionItem}>
          <span className={styles.title}>Teams:</span> {this.props.numOfTeams}
        </div>
        <div className={styles.buttonsGroup}>
          <Button
            label="Cancel"
            variant="text"
            color="secondary"
            onClick={this.onCancelClick}
          />
          <Button
            label="Save"
            variant="contained"
            color="primary"
            onClick={this.onSave}
          />
        </div>
        <PopupExposure
          isOpen={this.state.isModalConfirmOpen}
          onClose={this.onModalClose}
          onExitClick={this.props.onClose}
          onSaveClick={this.onSave}
        />
      </div>
    );
  }
}

export default AddPool;
