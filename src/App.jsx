import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';

const App = () => {
  // Safely access the auth state
  const { accessToken } = useSelector((state) => state.auth || {});

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={accessToken ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={!accessToken ? <Login /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;