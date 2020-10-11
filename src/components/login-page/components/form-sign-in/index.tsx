import React from 'react';
import styles from '../../style.module.scss';
import {
  BindingAction,
  BindingCbWithTwo,
  BindingCbWithOne,
  BindingCbWithThree
} from '../../../../common/models/callback';

enum FormFilds {
  EMAIL = 'email',
  PASSWORD = 'password',
  NEW_PASSWORD = 'newPwd',
  CONFIRM_CODE = 'confirmCode',
  SEND_REQUEST = 'Send Request',
  RESET = 'Reset Password',
}

interface Props {
  name: string;
  email: string;
  confirmCode: string;
  password: string;
  newPwd: string;
  isLogin: boolean;
  confirmCodeForm: boolean;
  newPwdForm: boolean;
  onChange: BindingAction;
  onGoogleLogin: BindingAction;
  toggleLogin: BindingAction;
  requestResetPassword: BindingCbWithOne<string>;
  onAuthSubmit: BindingCbWithTwo<string, string>;
  resetPwd: BindingCbWithThree<string, string, string>;
}

const FormSignIn = ({
  email,
  password,
  onChange,
  confirmCode,
  newPwd,
  isLogin,
  toggleLogin,
  onGoogleLogin,
  requestResetPassword,
  onAuthSubmit,
  newPwdForm,
  resetPwd,
  confirmCodeForm
}: Props) => isLogin ? (
  <form
    onSubmit={evt => {
      evt.preventDefault();

      onAuthSubmit(email, password);
    }}
    className="sign-form__login"
  >
    <h2 className={styles.loginTitle}>Sign in</h2>
    <button
      type="button"
      onClick={onGoogleLogin}
      className={styles.googleButton}
    >
      Sign in with Google
    </button>
    <p className={styles.accountText}>Or use your account</p>
    <label className={styles.accountEmail}>
      <input
        onChange={onChange}
        value={email}
        name={FormFilds.EMAIL}
        type="email"
        inputMode="email"
        placeholder="Email (Case Sensitive)"
        required
      />
      <span className="visually-hidden">Email Adddress</span>
    </label>
    <label className={styles.accountPassword}>
      <input
        onChange={onChange}
        value={password}
        name={FormFilds.PASSWORD}
        type="password"
        placeholder="Password (Case Sensitive)"
        required
      />
      <span className="visually-hidden">Password</span>
    </label>
    {/* <span className={styles.forgotPassword}>Forgot your password?</span> */}
    <button className={styles.signIn} type="submit">
      Sign In
      </button>
    <button
      className={styles.forgot}
      type="button"
      onClick={toggleLogin}
    >Forgot password</button>
  </form>
) : (
      <form
        onSubmit={evt => {
          evt.preventDefault();
          if (confirmCodeForm && newPwdForm) {
            resetPwd(email, confirmCode, newPwd)
          } else {
            requestResetPassword(email);
          }
        }}
        className="sign-form__login"
      >
        <h3 className={styles.loginTitle}>{newPwdForm && confirmCodeForm ? FormFilds.RESET : FormFilds.SEND_REQUEST}</h3>
        <label className={styles.resetEmail}>
          <input
            onChange={onChange}
            value={email}
            name={FormFilds.EMAIL}
            type="email"
            inputMode="email"
            placeholder="Email"
            required
          />
          <span className="visually-hidden">Email Adddress</span>
        </label>
        {newPwdForm ? (<div>
          <label className={styles.accountEmail}>
            <input
              onChange={onChange}
              value={confirmCode}
              name={FormFilds.CONFIRM_CODE}
              inputMode="text"
              type="number"
              placeholder="Confrm Code"
              required
            />
            <span className="visually-hidden">Insert confirm code</span>
          </label>
          <label className={styles.resetPassword}>
            <input
              className={styles.newpwdInput}
              onChange={onChange}
              value={newPwd}
              name={FormFilds.NEW_PASSWORD}
              type="password"
              placeholder="New password"
              required
            />
            <span className="visually-hidden">New password</span>
          </label>
        </div>
        ) : ''}
        <button className={styles.reset} type="submit">
          {newPwdForm && confirmCodeForm ? FormFilds.RESET : FormFilds.SEND_REQUEST}
        </button>
        <button
          className={styles.forgot}
          type="button"
          onClick={toggleLogin}
        >Sign In</button>
      </form>
    );

export default FormSignIn;
