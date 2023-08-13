import React from 'react';
import { useGetMeQuery } from '../graphql/generated/graphql.ts';

function App() {
  const { data, loading } = useGetMeQuery({
    context: {
      headers: {
        authorization: `Bearer ${'<AUTH0_TOKEN>'}`,
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

export default App;
