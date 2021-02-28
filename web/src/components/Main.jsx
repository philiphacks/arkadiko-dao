import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import { Governance } from './Governance';
import { Market } from './Market';
import { Profile } from './Profile';

export const Main = () => {
  return (
    <Switch>
      <Route exact path="/" component={Market} />
      <Route path="/governance" component={Governance} />
      <Route path="/profile" component={Profile} />
      <Redirect to="/" />
    </Switch>
  );
};
