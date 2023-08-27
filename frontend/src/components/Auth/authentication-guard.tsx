import { withAuthenticationRequired } from '@auth0/auth0-react';
import React, { ComponentType } from 'react';

import { PageLoader } from './page-loader';

interface AuthenticationGuardProps {
  component: ComponentType;
}

export const AuthenticationGuard: React.FC<AuthenticationGuardProps> = ({
  component,
}) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <PageLoader />
    ),
  });

  return <Component />;
};
