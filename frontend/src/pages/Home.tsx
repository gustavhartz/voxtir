import React from 'react';

import withAccessToken from '../components/Auth/with-access-token.tsx';
import Editor from '../components/Editor';

function Home({ token }: { token: string }) {
  return (
    <div className="w-full h-full">
      <Editor
        documentID={'2a3137c7-d384-4ccf-b988-1fba8b959b9b'}
        token={token}
      />
    </div>
  );
}

const HomeWithAccessToken = withAccessToken(Home);

export default HomeWithAccessToken;
