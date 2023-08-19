import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect, useState } from 'react';

function withAccessToken<T extends { token: string | null }>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithAccessToken(props: Omit<T, 'token'>) {
    const { getAccessTokenSilently } = useAuth0();
    const [token, setToken] = useState<string | null>(null);
    const [loadingToken, setLoadingToken] = useState(true);

    useEffect(() => {
      const fetchToken = async (): Promise<void> => {
        try {
          const accessToken = await getAccessTokenSilently();
          setToken(accessToken);
        } catch (error) {
          console.error('Error fetching access token:', error);
        } finally {
          setLoadingToken(false);
        }
      };
      fetchToken();
    });

    if (loadingToken) {
      return <div>Loading...</div>;
    }

    if (!token) {
      return <div>Error fetching access token</div>;
    }

    // Pass the fetched token as a prop to the wrapped component
    return <WrappedComponent {...(props as T)} token={token} />;
  };
}

export default withAccessToken;
