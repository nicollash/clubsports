import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { IPromoCode } from 'common/models';
import {
  loadPromoCodes,
  addPromoCode,
  deletePromoCode,
  updatePromoCode,
} from './logic/actions';
import MaterialTable from 'material-table';

import styles from './styles.module.scss';

export interface PromoCodesProps {
  registrationId: string;
  promoCodes: IPromoCode[] | null;
  loadPromoCodes: (registrationId: string) => void;
  addPromoCode: (promoCode: IPromoCode) => void;
  deletePromoCode: (promoCodeId: string) => void;
  updatePromoCode: (promoCode: IPromoCode) => void;
}

const PromoCodes: React.SFC<PromoCodesProps> = ({
  registrationId,
  promoCodes,
  loadPromoCodes,
  addPromoCode,
  deletePromoCode,
  updatePromoCode,
}) => {
  useEffect(() => {
    loadPromoCodes(registrationId);
  }, [loadPromoCodes, registrationId]);

  return (
    <div className={styles.PromoCodes}>
      {promoCodes && (
        <MaterialTable
          title='Promo Codes'
          columns={[
            {
              title: 'Code',
              field: 'code',
            },
            {
              title: 'Discount (%)',
              field: 'percent_off',
              width: 150,
              initialEditValue: 0,
            },
          ]}
          data={promoCodes}
          options={{
            actionsColumnIndex: 2,
            searchFieldStyle: { width: 200 },
            addRowPosition: 'first',
            emptyRowsWhenPaging: false,
            paging: promoCodes.length > 5,
            editCellStyle: { backgroundColor: 'red' },
          }}
          editable={{
            onRowAdd: newData =>
              new Promise(resolve => {
                newData.registration_id = registrationId;
                addPromoCode(newData);
                resolve();
              }),
            onRowUpdate: newData =>
              new Promise(resolve => {
                updatePromoCode(newData);
                resolve();
              }),
            onRowDelete: newData =>
              new Promise(resolve => {
                deletePromoCode(newData.promo_code_id);
                resolve();
              }),
          }}
        />
      )}
    </div>
  );
};

interface IPromoCodesState {
  promoCodes: { promoCodes: IPromoCode[] };
}

const mapStateToProps = (state: IPromoCodesState) => ({
  promoCodes: state.promoCodes.promoCodes,
});

const mapDispatchToProps = {
  loadPromoCodes,
  addPromoCode,
  deletePromoCode,
  updatePromoCode,
};

export default connect(mapStateToProps, mapDispatchToProps)(PromoCodes);
