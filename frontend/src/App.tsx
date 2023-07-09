import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import KeyboardModal from './components/KeyboardModal';
import KeyboardSettings from './components/KeyboardSettings';
function App() {
  return (
    <div className="w-screen">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <KeyboardModal>
        <KeyboardSettings />
      </KeyboardModal>
    </div>
  );
}

export default App;
