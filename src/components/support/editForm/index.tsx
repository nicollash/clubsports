import React from 'react';

interface State {
  option: string;
  message: string;
  email: string;
}

const EditingForm = (Component: React.ComponentType<any>) =>
  class EditingForm extends React.Component<any, State> {
    constructor(props: any) {
      super(props);

      this.state = {
        option: 'Bugs',
        message: '',
        email: '',
      };
    }

    onChangeField = ({ target: { name, value } }: any) => {
      this.setState({ [name]: value } as Pick<State, keyof State>);
    }

    render() {
      return (
        <Component
          {...this.props}
          {...this.state}
          onChange={this.onChangeField}
        />
      );
    }
  };

export default EditingForm;
