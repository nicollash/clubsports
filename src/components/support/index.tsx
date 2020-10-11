import React from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { AppState } from './logic/index';
import { loadUserData } from './logic/actions';
import styles from './style.module.scss';
import SupportForm from './supportForm';
import EditForm from "./editForm";
import Api from './api'
import { Toasts, Loader } from '../common';
import { BindingAction, IMember } from 'common/models';
import { IUtilitiesMember } from './types';
interface Props {
  email: string,
  option: string,
  message: string,
  isLoading: boolean;
  isLoaded: boolean;
  userData: IMember | IUtilitiesMember | null;
  loadUserData: BindingAction;
}

interface State {
  Loading: boolean,
}

interface IRootState {
  support: AppState;
}
const FormSupportWrapped = EditForm(SupportForm)

class Support extends React.Component<Props & RouteComponentProps, State> {

  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      Loading: false,
    }
  }
  componentDidMount() {
    this.props.loadUserData();
  }
  onSubmit = async (email: string, option: string, message: string) => {
    console.log(this.props.userData)
    this.setState({ Loading: true })
    console.log(email, option, message);
    let body = {
      request: {
        requester: { name: `${this.props.userData?.first_name} ${this.props.userData?.last_name}`, email: email },
        subject: option,
        comment: {
          body: message
        },
      }
    }
    try {
      let res = await Api.createTicket(body)
      console.log("Support -> onSubmit -> res", res)
      Toasts.successToast(
        'Your feedback sent successfully.'
      );
    } catch (error) {
      Toasts.errorToast(
        error.message
      );
    }

    this.setState({ Loading: false })
  }
  render() {
    const { Loading } = this.state;
    if (Loading) return <Loader />
    return (
      <div className={styles.supportMainWrapper}>
        <FormSupportWrapped
          onSubmit={this.onSubmit}
          {...this.state}
        />
      </div>
    )
  }
}


export default connect(
  ({ support }: IRootState) => ({
    isLoading: support.isLoading,
    isLoaded: support.isLoaded,
    userData: support.userData,
  }),
  (dispatch: Dispatch) =>
    bindActionCreators(
      {
        loadUserData,
      },
      dispatch
    )
)(Support);

