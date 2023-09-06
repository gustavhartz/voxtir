import React from 'react';
import { useParams } from 'react-router-dom';

import withAccessToken from '../components/Auth/with-access-token.tsx';
import Editor from '../components/Editor';

function Home({ token }: { token: string }) {
  const documentID = useParams().documentID;
  return (
    <div className="w-full h-full">
      {documentID && <Editor documentID={documentID} token={token} />}
    </div>
  );
}

const HomeWithAccessToken = withAccessToken(Home);

export default HomeWithAccessToken;
