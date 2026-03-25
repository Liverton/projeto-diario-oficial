import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import EdicoesPage from './pages/EdicoesPage';
import EdicaoDetalhePage from './pages/EdicaoDetalhePage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<EdicoesPage onLogout={handleLogout} />} 
        />
        <Route 
          path="/edicao/:id" 
          element={<EdicaoDetalhePage />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
