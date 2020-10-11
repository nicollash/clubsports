import React from 'react';
import { Button } from 'components/common';
import styles from './styles.module.scss';

interface IFabButtonState {
  isBtnVisible: boolean;
}

interface IFabButtonProps {
  onClick?: () => void;
  sequence: number | 0;
  btnType?: 'button' | 'submit';
  variant: 'text' | 'outlined' | 'contained' | undefined;
  label: string;
}

class FabButton extends React.Component<IFabButtonProps, IFabButtonState> {
  state = { isBtnVisible: false };
  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll = () => {
    if (window.scrollY > 140) {
      this.setState({ isBtnVisible: true });
    } else {
      this.setState({ isBtnVisible: false });
    }
  };

  // onClick = () => {
  //   this.props.onClick();
  // };

  render() {
    const { label, sequence, variant, btnType } = this.props;

    return (
      <div
        className={styles.btnContainer}
        style={{ bottom: `${sequence * 60 + 20}px` }}
      >
        <div className={!this.state.isBtnVisible ? styles.hidden : undefined}>
          <Button
            btnType={btnType}
            label={label}
            variant={variant}
            color="primary"
            onClick={this.props.onClick}
          />
        </div>
      </div>
    );
  }
}

export default FabButton;
