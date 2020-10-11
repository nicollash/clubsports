import React from 'react';
import { Redirect } from 'react-router-dom';
import { Routes } from 'common/enums';

const withUnprotectedRoute = (Component: React.ComponentType<any>) => (
  props: any
) => {
  const userToken = localStorage.getItem('token');

  return Boolean(userToken) ? (
    <Redirect to={Routes.DEFAULT} />
  ) : (
    <Component {...props} />
  );
};

export default withUnprotectedRoute;
