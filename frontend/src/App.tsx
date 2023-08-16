import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import KeyboardModal from './components/KeyboardModal';
import KeyboardSettings from './components/KeyboardSettings';
import ImportModal from './components/ImportModal';
import Import from './components/Import';
import Drawer from './components/Drawer';
function App() {
  return (
    <div className="w-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Drawer />} />
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
