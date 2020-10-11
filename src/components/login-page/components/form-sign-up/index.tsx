import React from 'react';
import styles from '../../style.module.scss';
import {
  BindingAction,
  BindingCbWithThree,
} from '../../../../common/models/callback';

enum FormFilds {
  NAME = 'name',
  SURNAME = 'surname',
  EMAIL = 'email',
  PASSWORD = 'password',
}

interface Props {
  name: string;
  surname: string;
  email: string;
  password: string;
  onChange: BindingAction;
  onGoogleLogin: BindingAction;
  onRegistrationSubmit: BindingCbWithThree<string, string, string>;
}

const FormSignUp = ({
  name,
  email,
  surname,
  password,
  onChange,
  onGoogleLogin,
  onRegistrationSubmit,
}: Props) => (
  <form
    onSubmit={evt => {
      evt.preventDefault();

      onRegistrationSubmit(`${name} ${surname}`, email, password);
    }}
    className="sign-form__create"
    autoComplete="off"
  >
    <h2 className={styles.loginTitle}>Create Account</h2>
    <button
      className={styles.googleButton}
      onClick={onGoogleLogin}
      type="button"
    >
      Sign in with Google
    </button>
    <p className={styles.accountText}>or use your email for registration</p>
    <p className={styles.fullnameWrapper}>
      <label className={styles.accountName}>
        <input
          onChange={onChange}
          value={name}
          name={FormFilds.NAME}
          type="text"
          placeholder="Name"
          minLength={3}
          required
        />
        <span className="visually-hidden">Your name</span>
      </label>
      <label className={styles.accountName}>
        <input
          onChange={onChange}
          value={surname}
          name={FormFilds.SURNAME}
          type="text"
          placeholder="Surname"
          minLength={3}
          required
        />
        <span className="visually-hidden">Your surname</span>
      </label>
    </p>
    <label className={styles.accountEmail}>
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
    <label className={styles.accountPassword}>
      <input
        onChange={onChange}
        value={password}
        name={FormFilds.PASSWORD}
        type="password"
        placeholder="Password"
        required
      />
      <span className="visually-hidden">Password</span>
    </label>
    <button className={styles.signIn} type="submit">
      Sign Up
    </button>
  </form>
);

export default FormSignUp;
