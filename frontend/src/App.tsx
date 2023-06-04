import { Routes, Route } from 'react-router-dom';
import TipTapEditor from './pages/Documents';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import AdminLayout from './components/AdminLayout';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import UploadPageSample from './pages/UploadSample';
// state for sidebar

function App() {
  // add sidebar to about and home page

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/billing" element={<Billing />} />
        </Route>
        <Route path="/uploadSample" element={<UploadPageSample />} />
        <Route path="documents" element={<TipTapEditor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
