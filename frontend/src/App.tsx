import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// state for sidebar

function App() {
  // add sidebar to about and home page

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
