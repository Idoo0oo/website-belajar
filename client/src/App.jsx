import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Dashboard    from './pages/Dashboard';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Materials    from './pages/Materials';
import DocumentViewer from './pages/DocumentViewer';
import Flashcards   from './pages/Flashcards';
import Calendar     from './pages/Calendar';
import AdminDashboard from './pages/AdminDashboard';
import Quiz         from './pages/Quiz';

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes — wrapped in Layout shell */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/"              element={<Dashboard />} />
        <Route path="/materials"     element={<Materials />} />
        <Route path="/viewer/:id"    element={<DocumentViewer />} />
        <Route path="/quiz/:materialId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/flashcards"    element={<Flashcards />} />
        <Route path="/calendar"      element={<Calendar />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
