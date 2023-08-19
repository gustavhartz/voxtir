import { useAuth0 } from '@auth0/auth0-react';
import { Route,Routes } from 'react-router-dom';

import { AuthenticationGuard } from './components/Auth/authentication-guard';
import { PageLoader } from './components/Auth/page-loader';
import Drawer from './components/Drawer';
import Import from './components/Import';
import ImportModal from './components/ImportModal';
import KeyboardModal from './components/KeyboardModal';
import KeyboardSettings from './components/KeyboardSettings';
import { CallbackPage } from './pages/Callback';
import Home from './pages/Home';
import Me from './pages/Me';

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
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Drawer />} />
        <Route path="/me" element={<AuthenticationGuard component={Me} />} />
        <Route path="/callback" element={<CallbackPage />} />
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
