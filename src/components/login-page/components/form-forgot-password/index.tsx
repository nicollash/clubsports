import React from 'react';
import styles from '../../style.module.scss';
import {
  BindingAction,
  BindingCbWithTwo,
} from '../../../../common/models/callback';

enum FormFilds {
  EMAIL = 'email',
  PASSWORD = 'password',
}

interface Props {
  name: string;
  email: string;
  password: string;
  onChange: BindingAction;
  onGoogleLogin: BindingAction;
  onAuthSubmit: BindingCbWithTwo<string, string>;
}

const FormSignIn = ({
  email,
  password,
  onChange,
  onGoogleLogin,
  onAuthSubmit,
}: Props) => (
    <form
      onSubmit={evt => {
        evt.preventDefault();

        onAuthSubmit(email, password);
      }}
      className="sign-form__login"
    >
      <h2 className={styles.loginTitle}>Forgot Password</h2>
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
          placeholder="Password  (Case Sensitive)"
          required
        />
        <span className="visually-hidden">Password</span>
      </label>
      {/* <span className={styles.forgotPassword}>Forgot your password?</span> */}
      <button className={styles.signIn} type="submit">
        Sign In
      </button>
      <button className={styles.forgot} type="button">Forgot password</button>
    </form>
  );

export default FormSignIn;
