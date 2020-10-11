import React from 'react';
import { useDrag, DragSourceMonitor } from 'react-dnd';
import { ITeam, IDivision } from '../../../../common/models';
import Button from '../../../common/buttons/button';
import { getIcon } from '../../../../helpers/get-icon.helper';
import { Icons } from '../../../../common/enums/icons';
import { DndItems } from '../../common';
import styles from './styles.module.scss';
import moveIcon from 'assets/moveIcon.png';

const EDIT_ICON_STYLES = {
  width: '21px',
  margin: '0',
  fill: '#00a3ea',
};

const DELETE_ICON_STYLES = {
  width: '21px',
  margin: '0',
  fill: '#ff0f19',
};

const BTN_STYLES = {
  minWidth: 'unset',
};

interface Props {
  team: ITeam;
  division: IDivision;
  poolName?: string;
  isArrange: boolean;
  changePool: (team: ITeam, divisionId: string, poolId: string | null) => void;
  onDeletePopupOpen: (team: ITeam) => void;
  onEditPopupOpen: (team: ITeam, division: IDivision, poolName: string) => void;
}

const TeamItem = ({
  team,
  division,
  poolName,
  isArrange,
  changePool,
  onDeletePopupOpen,
  onEditPopupOpen,
}: Props) => {
  const item = { type: DndItems.TEAM };
  const [, drag] = useDrag({
    item,
    end(_, monitor: DragSourceMonitor) {
      const dropResult = monitor.getDropResult();

      if (!dropResult) {
        return;
      }

      const { poolId, divisionId } = dropResult;

      if (poolId !== team.pool_id && divisionId === team.division_id) {
        changePool(team, divisionId, poolId);
      }
    },
  });

  return (
    <li
      ref={isArrange ? drag : null}
      className={isArrange ? styles.teamEdit : styles.team}
    >
      <div className={styles.teamEdit_dragContainer}>
        {isArrange && (
              <span className={styles.iconWrapper}>
                <img
                  src={moveIcon}
                  style={{
                    width: '21px',
                    height: '21px',
                    alignSelf: 'center',
                  }}
                  alt=""
                />
              </span>
            )}
        <span className={styles.teamEdit_name}>{team.short_name}</span>
      </div>
      {isArrange && (
        <p className={styles.btnsWrapper}>
          <Button
            onClick={() => onDeletePopupOpen(team)}
            icon={getIcon(Icons.DELETE, DELETE_ICON_STYLES)}
            label={<span className="visually-hidden">Delete team</span>}
            variant="text"
            color="inherit"
            type="icon"
            btnStyles={BTN_STYLES}
          />
          <Button
            onClick={() => onEditPopupOpen(team, division, poolName || '')}
            icon={getIcon(Icons.EDIT, EDIT_ICON_STYLES)}
            label={<span className="visually-hidden">Edit team</span>}
            variant="text"
            color="secondary"
            type="icon"
            btnStyles={BTN_STYLES}
          />
        </p>
      )}
    </li>
  );
};

export default TeamItem;
