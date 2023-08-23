import { useAuth0 } from '@auth0/auth0-react';
import { Route, Routes } from 'react-router-dom';

import { AuthenticationGuard } from './components/Auth/authentication-guard';
import { PageLoader } from './components/Auth/page-loader';
import Import from './components/Import';
import ImportModal from './components/ImportModal';
import KeyboardModal from './components/KeyboardModal';
import KeyboardSettings from './components/KeyboardSettings';
import Layout from './components/Layout';
import { CallbackPage } from './pages/Callback';
import Documents from './pages/Documents';
import Home from './pages/Home';
import Me from './pages/Me';
import Projects from './pages/Projects';

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="page-layout">
        <PageLoader />
      </div>
    );
  }
  return (
    <div className="w-screen">
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Projects />} />
          <Route path="document/:documentID" element={<Home />} />
          <Route path="documents" element={<Documents />} />
          <Route path="me" element={<AuthenticationGuard component={Me} />} />
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
