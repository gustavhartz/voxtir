import React from 'react';
import Editor from '../components/Editor';
import Layout from '../components/Layout';
function Home() {

  return (
    <div className="w-full h-full">
      <Layout>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-light">Interview with Andrew</h1>
          <span className="mt-[2px] text-sm italic">Last edit: Now</span>
        </div>
        <Editor />
      </Layout>
    </div>
  );
}

export default Home;
