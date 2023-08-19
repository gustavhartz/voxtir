import React from 'react';

import withAccessToken from '../components/Auth/with-access-token.tsx';
import { useGetMeQuery } from '../graphql/generated/graphql.ts';

function Me({ token }: { token: string }) {
  const { data, loading } = useGetMeQuery({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data?.me) {
    return <div>Not found</div>;
  }

  return (
    <div>
      {data.me.email} + {data.me.id}
    </div>
  );
}

const MeWithAccessToken = withAccessToken(Me);

export default MeWithAccessToken;
