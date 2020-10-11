import React from 'react';
import { Props } from '../../';

interface State {
  activeColor: string;
  displayColorPicker: boolean;
}

const withSelectColor = (Component: React.ComponentType<Props>) => {
  return class WithSelectColor extends React.Component<any, State> {
    constructor(props: {}) {
      super(props);

      this.state = {
        activeColor: '1C315F',
        displayColorPicker: false,
      };
    }

    componentDidUpdate(prevProps: Props) {
      if (prevProps.value !== this.props.value) {
        this.setState({ activeColor: this.props.value });
      }
    }

    onShowColorPicker = (status: boolean) => {
      this.setState({ displayColorPicker: status });
    };

    _changeHandler = (value: string) => {
      this.setState({
        activeColor: value,
      });
      this.props.onChange(value);
    };

    render() {
      const { activeColor, displayColorPicker } = this.state;

      return (
        <Component
          {...this.props}
          value={!this.props.value ? activeColor : this.props.value}
          displayColorPicker={displayColorPicker}
          onShowColorPicker={this.onShowColorPicker}
          onChange={this._changeHandler}
        />
      );
    }
  };
};

export default withSelectColor;
