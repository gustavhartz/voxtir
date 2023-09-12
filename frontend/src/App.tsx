import { Route, Routes } from 'react-router-dom';

import KeyboardModal from './components/KeyboardModal';
import KeyboardSettings from './components/KeyboardSettings';
import Layout from './components/Layout';
import AcceptInvitation from './pages/AcceptInvitation';
import { CallbackPage } from './pages/Callback';
import CreateProject from './pages/CreateProject';
import DocumentEditor from './pages/DocumentEditor';
import Documents from './pages/Documents';
import Me from './pages/Me';
import Projects from './pages/Projects';

function App(): JSX.Element {
  return (
    <div className="w-screen">
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Projects />} />
          <Route path="accept-invitation/:token" element={<AcceptInvitation />} />
          <Route path="document/:documentID" element={<DocumentEditor />} />
          <Route path="project/new" element={<CreateProject />} />
          <Route path="project/:projectID" element={<Documents />} />
          <Route path="me" element={<Me />} />
        </Route>
      </Routes>
      <KeyboardModal>
        <KeyboardSettings />
      </KeyboardModal>
    </div>
  );
}

export default App;
