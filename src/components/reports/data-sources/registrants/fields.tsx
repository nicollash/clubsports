import { ColDef } from 'ag-grid-community';

export const initialColumns: ColDef[] = [
  {
    headerName: 'ID',
    field: 'reg_response_id',
    hide: true,
  },
  {
    headerName: 'Organization',
    field: 'org_name',
  },
  {
    headerName: 'Event',
    field: 'event_name',
  },
  {
    headerName: 'Division',
    field: 'division_short_name',
  },
  {
    headerName: 'Payment Date',
    field: 'payment_date',
    type: ['dateColumnWithDateRangeFilter', 'rightAligned'],
  },
  {
    headerName: 'Team',
    field: 'team_name',
  },
  {
    headerName: 'First Name',
    field: 'participant_first_name',
  },
  {
    headerName: 'Last Name',
    field: 'participant_last_name',
  },
  {
    headerName: 'DOB',
    field: 'player_birthdate',
    type: ['dateColumn', 'rightAligned'],
  },
  {
    headerName: 'Mobile',
    field: 'participant_mobile',
    type: 'phoneColumn',
  },
  {
    headerName: 'Email',
    field: 'participant_email',
  },
  {
    headerName: 'City',
    field: 'player_city',
  },
  {
    headerName: 'State',
    field: 'player_state',
  },
  {
    headerName: 'Amount Due',
    field: 'amount_due',
    type: ['currencyColumn', 'rightAligned'],
  },
  {
    headerName: 'Amount Paid',
    field: 'payment_amount',
    type: ['currencyColumn', 'rightAligned'],
  },
  {
    headerName: 'Amount Net',
    field: 'amount_net',
    type: ['currencyColumn', 'rightAligned'],
  },
  {
    headerName: 'Amount Tax',
    field: 'amount_tax',
    type: ['currencyColumn', 'rightAligned'],
    hide: true,
  },
  {
    headerName: 'Amount Net w/Tax',
    field: 'amount_net_with_tax',
    type: ['currencyColumn', 'rightAligned'],
  },
  {
    headerName: 'Waitlist',
    field: 'is_waitlist_YN',
  },
  {
    headerName: 'Highlight URL',
    field: 'player_highlight_URL',
  },
  {
    headerName: 'Reg First Name',
    field: 'registrant_first_name',
  },
  {
    headerName: 'Reg Last Name',
    field: 'registrant_last_name',
  },
  {
    headerName: 'Reg Mobile',
    field: 'registrant_mobile',
    type: 'phoneColumn',
  },
  {
    headerName: 'Reg Email',
    field: 'registrant_email',
  },
  {
    headerName: 'Is Participant',
    field: 'registrant_is_the_participant',
  },
  {
    headerName: 'Other Emails',
    field: 'additional_emails',
  },
  {
    headerName: 'Player Level',
    field: 'player_level',
  },
  {
    headerName: 'Club Name',
    field: 'player_club_name',
  },
  {
    headerName: 'Coach Name',
    field: 'player_club_coach_name',
  },
  {
    headerName: 'Jersey Number',
    field: 'jersey_number',
  },
  {
    headerName: 'School',
    field: 'school_attending',
  },
  {
    headerName: 'Dominant Hand',
    field: 'dominant_hand',
  },
  {
    headerName: 'Height, ft',
    field: 'height_feet',
  },
  {
    headerName: 'Height, in',
    field: 'height_inches',
  },
  {
    headerName: 'Short Size',
    field: 'short_size',
  },
  {
    headerName: 'Shirt Size',
    field: 'shirt_size',
  },
  {
    headerName: 'Position',
    field: 'position',
  },
  {
    headerName: 'Grad Year',
    field: 'hs_graduation_year',
  },
  {
    headerName: 'GPA',
    field: 'gpa',
  },
  {
    headerName: 'Honors Classes',
    field: 'honors_classes',
  },
  {
    headerName: 'Instagram',
    field: 'player_instagram',
  },
  {
    headerName: 'SportRecruits URL',
    field: 'player_sportrecruits_url',
  },
  {
    headerName: 'ConnectLax URL',
    field: 'player_connectlax_url',
  },
  {
    headerName: 'Registrant Name',
    field: 'registrant_name',
  },
  {
    headerName: 'Role',
    field: 'registrant_role',
  },
  {
    headerName: 'Team Name (Canada)',
    field: 'canadian_team_name',
  },
  { headerName: 'Reg Id', field: 'registration_id', hide: true },
  {
    headerName: 'Team Id',
    field: 'team_id',
    hide: true,
  },
  {
    headerName: 'Start Date',
    field: 'event_startdate',
    type: ['dateColumn', 'rightAligned'],
    hide: true,
  },
  {
    headerName: 'Division Id',
    field: 'division_id',
    hide: true,
  },
  {
    headerName: 'Payment Method',
    field: 'payment_method',
    hide: true,
  },
  {
    headerName: 'Payment Id',
    field: 'ext_payment_id',
    hide: true,
  },
  {
    headerName: 'Payment System',
    field: 'ext_payment_system',
    hide: true,
  },
  {
    headerName: 'Discount Code',
    field: 'discount_code',
    hide: true,
  },
  {
    headerName: 'Payment SKU',
    field: 'ext_sku',
    hide: true,
  },
  {
    headerName: 'Payment Option',
    field: 'payment_selection',
    hide: true,
  },
  {
    headerName: 'Division Name 2',
    field: 'division_name',
    hide: true,
  },
  {
    headerName: 'Currency',
    field: 'currency',
    hide: true,
  },
  {
    headerName: 'Waiver Signature',
    field: 'waiver_signature',
    hide: true,
  },
  {
    headerName: 'Waiver Sign Date',
    field: 'waiver_sign_datetime',
    type: ['dateColumn', 'rightAligned'],
    hide: true,
  },
  {
    headerName: 'Active',
    field: 'is_active_YN',
    hide: true,
  },
  {
    headerName: 'Created By',
    field: 'created_by',
    hide: true,
  },
  {
    headerName: 'Created On',
    field: 'created_datetime',
    type: ['dateColumn', 'rightAligned'],
    hide: true,
  },
  {
    headerName: 'Updated By',
    field: 'updated_by',
    hide: true,
  },
  {
    headerName: 'Updated On',
    field: 'updated_datetime',
    type: ['dateColumn', 'rightAligned'],
    hide: true,
  },
  {
    headerName: 'Type',
    field: 'type',
    hide: true,
  },

  {
    headerName: 'Team City',
    field: 'team_city',
    hide: true,
  },
  {
    headerName: 'Team State',
    field: 'team_state',
    hide: true,
  },
  {
    headerName: 'Team Level',
    field: 'team_level',
    hide: true,
  },
  {
    headerName: 'Team Website',
    field: 'team_website',
    hide: true,
  },
  {
    headerName: 'Contact First Name',
    field: 'contact_first_name',
    hide: true,
  },
  {
    headerName: 'Contact Last Name',
    field: 'contact_last_name',
    hide: true,
  },
  {
    headerName: 'Contact Mobile',
    field: 'contact_mobile',

    type: 'phoneColumn',
    hide: true,
  },
  {
    headerName: 'Contact Email',
    field: 'contact_email',
    hide: true,
  },
  {
    headerName: 'Contact Is Coach',
    field: 'contact_is_also_the_coach',
    hide: true,
  },
  {
    headerName: 'Coach First Name',
    field: 'coach_first_name',
    hide: true,
  },
  {
    headerName: 'Coach Last Name',
    field: 'coach_last_name',
    hide: true,
  },
  {
    headerName: 'Coach Mobile',
    field: 'coach_mobile',
    type: 'phoneColumn',
    hide: true,
  },
  {
    headerName: 'Coach Email',
    field: 'coach_email',
    hide: true,
  },
  {
    headerName: 'Display Name',
    field: 'display_name',
    hide: true,
  },
];

export const columnsForMessages: ColDef[] = [
  {
    headerName: 'Recipient',
    field: 'recipientTarget',
  },
  {
    headerName: 'Send On',
    field: 'sendDatetime',
    type: ['dateColumnWithTimeFilter', 'rightAligned'],
    width: 200,
  },
  {
    headerName: 'Received On',
    field: 'receivedDatetime',
    type: ['dateColumnWithTimeFilter', 'rightAligned'],
    hide: true,
  },
  {
    headerName: 'Answer',
    field: 'answerText',
    rowGroupIndex: 0,
  },
  {
    headerName: 'Status',
    field: 'messageStatus',
  },
  {
    headerName: 'Message ID',
    field: 'messageId',
    hide: true,
  },
];
