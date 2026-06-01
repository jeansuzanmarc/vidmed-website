import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@/theme';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { DailyReportsPage } from '@/pages/DailyReportsPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { PatientDebtsPage } from '@/pages/PatientDebtsPage';
import { CompanyDebtsPage } from '@/pages/CompanyDebtsPage';
import { OwnerTransactionsPage } from '@/pages/OwnerTransactionsPage';
import { CashFlowPage } from '@/pages/CashFlowPage';
import { ComparisonPage } from '@/pages/ComparisonPage';
import { BalancePage } from '@/pages/BalancePage';
import { AlertsPage } from '@/pages/AlertsPage';
import { UsersPage } from '@/pages/UsersPage';
import { ClinicsPage } from '@/pages/ClinicsPage';
import { AccountCodesPage } from '@/pages/AccountCodesPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications } from '@/hooks/useNotifications';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Initialize notifications
const AppContent: React.FC = () => {
  useNotifications();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="daily-reports" element={<DailyReportsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="patient-debts" element={<PatientDebtsPage />} />
        <Route path="company-debts" element={<CompanyDebtsPage />} />
        <Route path="owner-transactions" element={<OwnerTransactionsPage />} />
        <Route path="cash-flow" element={<CashFlowPage />} />
        <Route path="comparison" element={<ComparisonPage />} />
        <Route path="balance" element={<BalancePage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="clinics" element={<ClinicsPage />} />
        <Route path="account-codes" element={<AccountCodesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={3000}
        >
          <AppContent />
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
