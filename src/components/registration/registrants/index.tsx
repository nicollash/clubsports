import * as React from 'react';
import { connect } from 'react-redux';
import MaterialTable, { Column } from 'material-table';
import { getIcon } from 'helpers';
import { Icons } from 'common/enums';
import RegistrantDetails from './registrant-details';
import { formatPhoneNumber } from '../../../helpers/formatPhoneNumber';
import moment from 'moment';
import { IDivision } from 'common/models';

const STYLES_ICON = {
  width: '20px',
  height: '20px',
  marginRight: '9px',
};

export interface IRegistrantsProps {
  registrants: any[];
  divisions: IDivision[];
}

const Registrants: React.FC<IRegistrantsProps> = (props: IRegistrantsProps) => {
  const divisions = props.divisions.reduce((map, division) => {
    map[division.division_id] = division.short_name;
    return map;
  }, {});

  let columns: Column<any>[] = [
    {
      title: 'Date',
      field: 'date',
      type: 'date',
      defaultSort: 'desc',
    },
    {
      title: 'Type',
      field: 'type',
      type: 'string',
      hidden: true,
    },
    {
      title: 'Status',
      field: 'status',
      type: 'string',
      lookup: { confirmed: 'confirmed', pending: 'pending' },
      render: rowData =>
        rowData.status === 'confirmed'
          ? getIcon(Icons.CHECK_CIRCLE, {
              ...STYLES_ICON,
              fill: '#00CC47',
            })
          : null,
    },
    {
      title: 'Participant',
      field: 'participant',
      type: 'string',
    },
    { title: 'Team', field: 'team_name', type: 'string', hidden: true },
    {
      title: 'Division',
      field: 'division_id',
      type: 'string',
      lookup: divisions,
    },

    { title: 'Contact', field: 'contact_name', type: 'string' },
    {
      title: 'Phone',
      field: 'contact_phone',
      type: 'string',
      cellStyle: { minWidth: 90 },
      hidden: true,
    },
    {
      title: 'Due',
      field: 'amount_due',
      type: 'currency',
      cellStyle: { maxWidth: 40 },
      headerStyle: { maxWidth: 40 },
    },
    {
      title: 'Paid',
      field: 'amount_paid',
      type: 'currency',
      cellStyle: { maxWidth: 40 },
      headerStyle: { maxWidth: 40 },
    },
    {
      title: 'Net',
      field: 'amount_net',
      type: 'currency',
      cellStyle: { maxWidth: 40 },
      headerStyle: { maxWidth: 40 },
    },
  ];

  columns = columns.map(column => ({
    ...column,
    cellStyle: { ...column.cellStyle, padding: '0.1em 0.3em', fontSize: 14 },
  }));

  const detailPanel = (rowData: any) => {
    return (
      <RegistrantDetails
        registrant={rowData.registrant}
        regResponseId={rowData.reg_response_id}
      />
    );
  };

  const data: any[] = props.registrants.map(registrant => {
    return {
      reg_response_id: registrant.reg_response_id,
      registrant,
      type: registrant.type,
      date: moment(registrant.created_datetime).format('MM/DD/YYYY'),
      amount_due: registrant.amount_due?.toFixed(2),
      amount_paid: registrant.payment_amount.toFixed(2),
      amount_net: registrant.amount_net.toFixed(2),
      team_name: registrant.team_name,
      division_id: registrant.division_id,
      status:
        registrant.type === 'team'
          ? registrant.team_id
            ? 'confirmed'
            : 'pending'
          : registrant.amount_due <= registrant.payment_amount
          ? 'confirmed'
          : 'pending',
      participant:
        registrant.type === 'team'
          ? `${registrant.team_name}`
          : `${registrant.participant_first_name} ${registrant.participant_last_name}`,
      contact_name:
        registrant.type === 'team'
          ? registrant.contact_first_name + ' ' + registrant.contact_last_name
          : registrant.registrant_first_name +
            ' ' +
            registrant.registrant_last_name,
      contact_phone: formatPhoneNumber(
        registrant.type === 'team'
          ? registrant.contact_mobile
          : registrant.registrant_mobile
      ),
    };
  });

  return (
    <div style={{ minWidth: '100%' }}>
      <MaterialTable
        columns={columns}
        data={data}
        title='All Participants'
        detailPanel={detailPanel}
        options={{
          pageSize: 10,
          pageSizeOptions: [5, 10, 20, 50, 100, 500],
          emptyRowsWhenPaging: false,
          padding: 'dense',
          exportButton: true,
          exportAllData: true,
          columnsButton: true,
          filtering: true,
          showTitle: false,
          thirdSortClick: false,
        }}
        onRowClick={(_, __, togglePanel) => {
          togglePanel!();
        }}
      />
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  divisions: state.registration.divisions,
  registrants: state.registration.registrants,
});

export default connect(mapStateToProps)(Registrants);
