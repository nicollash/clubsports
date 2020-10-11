import React from 'react';
import { Checkbox } from 'components/common';
import { IDivision } from 'common/models';
import styles from './styles.module.scss';
import { orderBy } from 'lodash-es';

const DEFAUL_DIVISION_COLOR = '#ffffff';

interface Props {
  divisions: IDivision[];
  showHeatmap: boolean;
  onHeatmapChange: (showHeatmap: boolean) => void;
}

const DivisionHeatmap = ({
  divisions,
  showHeatmap,
  onHeatmapChange,
}: Props) => {
  const CHECKBOX_OPTION = { label: 'Division Heatmap', checked: showHeatmap };

  return (
    <form className={styles.form}>
      <div className={styles.checkboxWrapper}>
        <Checkbox
          options={[CHECKBOX_OPTION]}
          onChange={() => onHeatmapChange(!showHeatmap)}
        />
      </div>
      <ul className={styles.divisionsList}>
        {orderBy(divisions, 'short_name').map(it => (
          <li className={styles.divisionItem} key={it.division_id}>
            <span
              className={styles.divisionColor}
              style={{
                backgroundColor: it.division_hex
                  ? `#${it.division_hex}`
                  : DEFAUL_DIVISION_COLOR,
              }}
            />
            {it.short_name}
          </li>
        ))}
      </ul>
    </form>
  );
};

export default DivisionHeatmap;
