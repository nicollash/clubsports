import React from 'react';
import { Redirect } from 'react-router-dom';
import { Routes } from 'common/enums';

const withProtectedRoute = (Component: React.ComponentType<any>) => (
  props: any
) => {
  const userToken = localStorage.getItem('token');

  return Boolean(userToken) ? (
    <Component {...props} />
  ) : (
    <Redirect to={Routes.LOGIN} />
  );
};

export default withProtectedRoute;
