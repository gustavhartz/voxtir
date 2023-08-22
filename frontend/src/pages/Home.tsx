import React from 'react';

import Editor from '../components/Editor';
import Layout from '../components/Layout';
function Home() {
  return (
    <div className="w-full h-full">
      <Layout>
        <Editor
          documentID={'2a3137c7-d384-4ccf-b988-1fba8b959b9b'}
          token={'YOUR_AUTH_TOKEN'}
        />
      </Layout>
    </div>
  );
}

export default Home;
