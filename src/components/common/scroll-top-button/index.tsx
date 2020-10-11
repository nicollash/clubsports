import React from 'react';
import { Button } from 'components/common';
import styles from './styles.module.scss';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

class ScrollTopButton extends React.Component {
  state = { isBtnVisible: false };
  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll = () => {
    if (window.scrollY > 200) {
      this.setState({ isBtnVisible: true });
    } else {
      this.setState({ isBtnVisible: false });
    }
  };

  onClick = () => {
    window.scrollTo(0, 0);
  };

  render() {
    return (
      <div className={styles.btnContainer}>
        <div className={!this.state.isBtnVisible ? styles.hidden : undefined}>
          <Button
            label={<span className="visually-hidden">Scroll Top</span>}
            variant="text"
            color="secondary"
            type={'icon'}
            onClick={this.onClick}
            icon={<KeyboardArrowUpIcon fontSize="large" />}
          />
        </div>
      </div>
    );
  }
}

export default ScrollTopButton;
