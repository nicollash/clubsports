import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
} from '@material-ui/core';
import { getRegistrantPayments } from '../../../registration-edit/logic/actions';
import { BindingCbWithOne } from 'common/models';

import moment from 'moment';

export interface RegistrantPaymentsProps {
  registrant: any;
  allPayments: any[];
  getRegistrantPayments: BindingCbWithOne<string>;
}

const RegistrantPayments: React.SFC<RegistrantPaymentsProps> = ({
  registrant,
  allPayments,
  getRegistrantPayments,
}: RegistrantPaymentsProps) => {
  const payments = allPayments[registrant.reg_response_id];

  const { reg_response_id } = registrant;
  useEffect(() => {
    getRegistrantPayments(reg_response_id);
  }, [reg_response_id, getRegistrantPayments]);

  const sum = (fieldName: string) =>
    payments?.reduce((a: any, b: any) => a + b[fieldName], 0).toFixed(2);

  return payments?.length > 0 ? (
    <React.Fragment>
      <TableContainer>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align='right'>Due</TableCell>
              <TableCell align='right'>Paid</TableCell>
              <TableCell align='right'>Refunded</TableCell>
              <TableCell align='right'>Fees</TableCell>
              <TableCell align='right'>Tax</TableCell>
              <TableCell align='right'>Net</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment: any) => (
              <TableRow key={payment.reg_payment_id}>
                <TableCell>
                  {moment(payment.payment_date).format('MM/DD/YYYY')}
                </TableCell>
                <TableCell>{payment.payment_status}</TableCell>
                <TableCell align='right'>
                  ${payment.amount_due.toFixed(2)}
                </TableCell>
                <TableCell align='right'>
                  ${payment.amount_paid.toFixed(2)}
                </TableCell>
                <TableCell align='right'>
                  ${payment.amount_refunded.toFixed(2)}
                </TableCell>
                <TableCell align='right'>
                  ${payment.amount_fees.toFixed(2)}
                </TableCell>
                <TableCell align='right'>
                  ${payment.amount_tax.toFixed(2)}
                </TableCell>
                <TableCell align='right'>
                  ${payment.amount_net.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>TOTAL</TableCell>
              <TableCell align='right'>${sum('amount_due')}</TableCell>
              <TableCell align='right'>${sum('amount_paid')}</TableCell>
              <TableCell align='right'>${sum('amount_refunded')}</TableCell>
              <TableCell align='right'>${sum('amount_fees')}</TableCell>
              <TableCell align='right'>${sum('amount_tax')}</TableCell>
              <TableCell align='right'>${sum('amount_net')}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </React.Fragment>
  ) : null;
};

const mapStateToProps = (state: any) => ({
  allPayments: state.registration.payments,
});

const mapDispatchToProps = {
  getRegistrantPayments,
};

export default connect(mapStateToProps, mapDispatchToProps)(RegistrantPayments);
