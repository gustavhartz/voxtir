import React from 'react';
import Editor from '../components/Editor';
import Layout from '../components/Layout';
function Home() {
  return (
    <div className="w-full h-full">
      <Layout>
        <Editor />
      </Layout>
    </div>
  );
}

export default Home;
