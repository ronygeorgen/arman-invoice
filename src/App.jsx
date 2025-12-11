import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import PayrollPage from './components/PayrollPage';
import InvoiceView from './pages/InvoiceView';

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/payroll"
          element={isAuthenticated ? <PayrollPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/invoice/:token"
          element={<InvoiceView />}
        />
      </Routes>
    </Router>
  );
};

export default App;