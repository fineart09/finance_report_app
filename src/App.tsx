import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import CreateExpensePage from './pages/CreateExpensePage';
import ExpensePage from './pages/ExpensePage';
import PartnerPage from './pages/PartnerPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/create-expense" element={<CreateExpensePage />} />
          <Route path="/expense" element={<ExpensePage />} />
          <Route path="/partner" element={<PartnerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

