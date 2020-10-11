import * as React from 'react';
import { connect } from 'react-redux';
import { Button } from 'components/common';
import { ButtonVariant, ButtonColors } from 'common/enums';
import RegistrantPayments from './registrant-payments';
import { addTeamToEvent } from '../../registration-edit/logic/actions';
import { BindingCbWithOne, IEventDetails } from 'common/models';

export interface RegistrantDetailsProps {
  registrant: any;
  regResponseId?: string;
  event: IEventDetails;
  handleAddTeamToEvent: BindingCbWithOne<string>;
}

const RegistrantDetails: React.SFC<RegistrantDetailsProps> = ({
  registrant,
  event,
  handleAddTeamToEvent,
}: RegistrantDetailsProps) => {
  return (
    <>
      {registrant.type === 'team' && !registrant.team_id ? (
        <Button
          onClick={handleAddTeamToEvent.bind(null, registrant, event)}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          label="+ Add to Event"
        />
      ) : null}
      <RegistrantPayments registrant={registrant} />
    </>
  );
};

interface IState {
  registration: {
    event: IEventDetails;
  };
}
const mapStateToProps = (state: IState) => ({
  event: state.registration.event[0],
});

const mapDispatchToProps = { handleAddTeamToEvent: addTeamToEvent };

export default connect(mapStateToProps, mapDispatchToProps)(RegistrantDetails);
