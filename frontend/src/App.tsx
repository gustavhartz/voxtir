import { Route, Routes } from 'react-router-dom';

import Import from './components/Import';
import ImportModal from './components/ImportModal';
import KeyboardModal from './components/KeyboardModal';
import KeyboardSettings from './components/KeyboardSettings';
import Layout from './components/Layout';
import { CallbackPage } from './pages/Callback';
import CreateProject from './pages/CreateProject';
import Documents from './pages/Documents';
import Home from './pages/Home';
import Me from './pages/Me';
import Projects from './pages/Projects';

function App() {
  return (
    <div className="w-screen">
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Projects />} />
          <Route path="document/:documentID" element={<Home />} />
          <Route path="project/new" element={<CreateProject />} />
          <Route path="project/:projectID" element={<Documents />} />
          <Route path="me" element={<Me />} />
        </Route>
      </Routes>
      <KeyboardModal>
        <KeyboardSettings />
      </KeyboardModal>
      <ImportModal>
        <Import />
      </ImportModal>
    </div>
  );
}

export default App;
