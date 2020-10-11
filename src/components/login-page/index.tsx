import React from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Auth, Hub } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth/lib/types';
import { createMemeber } from './logic/action';
import WithEditingForm from './hocs/withEditingForm';
import FormSignUp from './components/form-sign-up';
import FormSignIn from './components/form-sign-in';
import LoadingWrapper from './components/loading-wrapper';
import { Toasts } from '../common';
import logo from '../../assets/logo.png';
import styles from './style.module.scss';
import './styles.scss';

interface Props {
  createMemeber: (fullName: string, email: string, sub: string) => void;
}

interface State {
  isSignUpOpen: boolean;
  isLoading: boolean;
  isLogin: boolean;
  confirmCodeForm: boolean;
  newPwdForm: boolean;
}

const FormSignUpWrapped = WithEditingForm(FormSignUp);
const FormSignInWrapped = WithEditingForm(FormSignIn);

class LoginPage extends React.Component<Props & RouteComponentProps, State> {
  constructor(props: Props & RouteComponentProps) {
    super(props);

    this.state = {
      isSignUpOpen: false,
      isLoading: false,
      isLogin: true,
      confirmCodeForm: false,
      newPwdForm: false,
    };
  }

  componentDidMount() {
    const { createMemeber } = this.props;

    Hub.listen('auth', async ({ payload: { event } }) => {
      try {
        switch (event) {
          case 'signIn': {
            this.setState({ isLoading: true });

            const currentSession = await Auth.currentSession();
            const userToken = currentSession.getAccessToken().getJwtToken();
            const userAttributes = currentSession.getIdToken().payload;

            if (userToken) {
              const { name, email, sub } = userAttributes;

              localStorage.setItem('token', userToken);

              createMemeber(name, email, sub);

              this.props.history.push('/dashboard');
            }
            break;
          }
          case 'signUp': {
            Toasts.successToast(
              'Check your email to activate confirmation link. After that you can sign in to your account.'
            );

            break;
          }
        }
      } catch (err) {
        Toasts.errorToast(`${err.message}`);
      }
    });
  }

  onSignToggle = () => {
    this.setState(({ isSignUpOpen }) => ({ isSignUpOpen: !isSignUpOpen }));
  };

  toggleLogin = () => {
    this.setState(({ isLogin }) => ({ isLogin: !isLogin }))
  }

  resetPwd = async (email: string, confirmCode: string, newPwd: string) => {
    try {
      this.setState({ isLoading: true });
      await Auth.forgotPasswordSubmit(email, confirmCode, newPwd);
      this.setState({ isLoading: false, isLogin: true });
      Toasts.successToast(
        'Your Password Updated Successfully.'
      );
    } catch (error) {
      this.setState({ isLoading: false });
      Toasts.errorToast(`${error.message}`);
    }
  }

  onAuthSubmit = async (email: string, password: string) => {
    try {
      this.setState({ isLoading: true });

      await Auth.signIn(email, password);
    } catch (err) {
      this.setState({ isLoading: false });

      Toasts.errorToast(`${err.message}`);
    }
  };

  requestResetPassword = async (email: string) => {
    console.log(email)
    try {
      this.setState({ isLoading: true });

      await Auth.forgotPassword(email);
      this.setState({ isLoading: false, confirmCodeForm: true, newPwdForm: true });
      Toasts.successToast('Please check your email, we sent verification code.')
    } catch (error) {
      this.setState({ isLoading: false })

      Toasts.errorToast(`${error.message}`);
    }
  }

  onRegistrationSubmit = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          name: fullName,
        },
      });
    } catch (err) {
      Toasts.errorToast(`${err.message}`);
    }
  };

  onGoogleLogin = async () => {
    try {
      await Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Google,
      });
    } catch (err) {
      Toasts.errorToast(`${err.message}`);
    }
  };

  render() {
    const { isSignUpOpen, isLoading } = this.state;

    return (
      <main className={styles.page}>
        <h1 className="visually-hidden">Login or create account</h1>
        <section
          className={`sign-form ${isSignUpOpen ? 'sign-form--sign-up' : ''}`}
        >
          <FormSignUpWrapped
            onRegistrationSubmit={this.onRegistrationSubmit}
            onGoogleLogin={this.onGoogleLogin}
          />
          <FormSignInWrapped
            onAuthSubmit={this.onAuthSubmit}
            onGoogleLogin={this.onGoogleLogin}
            toggleLogin={this.toggleLogin}
            requestResetPassword={this.requestResetPassword}
            resetPwd={this.resetPwd}
            {...this.state}
          />
          {isLoading && <LoadingWrapper />}
          <div className="sign-form__overlay">
            <div className="sign-form__overlay-wrapper">
              <div className="sign-form__register">
                <p className={styles.logoLink}>
                  <img
                    src={logo}
                    width="200"
                    height="156"
                    alt="Tourney master logo"
                  />
                </p>
                <h2 className={styles.registerTitle}>Register now!</h2>
                <p className={styles.registerText}>
                  Enter your personal details and start your tourneys!
                </p>
                <button
                  onClick={this.onSignToggle}
                  className={styles.registerBtn}
                  type="button"
                >
                  Sign Up
                </button>
              </div>
              <div className="sign-form__register-already">
                <p className={styles.logoLink}>
                  <img
                    src={logo}
                    width="200"
                    height="156"
                    alt="Tourney master logo"
                  />
                </p>
                <h2 className={styles.registerTitle}>
                  Already have and account?
                </h2>
                <p className={styles.registerText}>
                  Sign in using your email and password
                </p>
                <button
                  onClick={this.onSignToggle}
                  className={styles.registerBtn}
                  type="button"
                >
                  Sign IN
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default connect(null, (dispatch: Dispatch) =>
  bindActionCreators({ createMemeber }, dispatch)
)(withRouter(LoginPage));
