import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { Header } from './components/Layout';
import { AppErrorBoundary } from './components/ErrorBoundary/AppErrorBoundary';
import { Footer } from './components/Footer/Footer';
import { Landing } from './pages/Landing/Landing';
import { OwnerInterview } from './pages/Owner/OwnerInterview';
import { OwnerResult } from './pages/Owner/OwnerResult';
import { IntegratorWorkspace } from './pages/Integrator/IntegratorWorkspace';
import { IntegratorResult } from './pages/Integrator/IntegratorResult';
import { VendorCapability } from './pages/Vendor/VendorCapability';
import { VendorResult } from './pages/Vendor/VendorResult';
import { SelectionMatrix } from './pages/Selection/SelectionMatrix';
import { ReportCenter } from './pages/Report/ReportCenter';
import { LearningMode } from './pages/Learning/LearningMode';
import { PlatformGuide } from './pages/PlatformGuide/PlatformGuide';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { DeveloperView } from './pages/Developer/DeveloperView';
import { MaintenanceView } from './pages/Maintenance/MaintenanceView';
import { AssessorView } from './pages/Assessor/AssessorView';
import { TranslationCenter } from './pages/TranslationCenter/TranslationCenter';
import { GapCenter } from './pages/Gap/GapCenter';
import './index.css';

const basename = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '');
const redirectPath = new URLSearchParams(window.location.search).get('redirect');

if (redirectPath) {
  const normalized = redirectPath.startsWith('/') ? redirectPath.slice(1) : redirectPath;
  window.history.replaceState(null, '', `${basename}/${normalized}`.replace(/\/+/g, '/'));
}

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter basename={basename}>
        <Header />
        <AppErrorBoundary>
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/owner" element={<OwnerInterview />} />
              <Route path="/owner/result" element={<OwnerResult />} />
              <Route path="/integrator" element={<IntegratorWorkspace />} />
              <Route path="/integrator/result" element={<IntegratorResult />} />
              <Route path="/vendor" element={<VendorCapability />} />
              <Route path="/vendor/result" element={<VendorResult />} />
              <Route path="/selection" element={<SelectionMatrix />} />
              <Route path="/gap" element={<GapCenter />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/developer" element={<DeveloperView />} />
              <Route path="/maintenance" element={<MaintenanceView />} />
              <Route path="/assessor" element={<AssessorView />} />
              <Route path="/translation-center" element={<TranslationCenter />} />
              <Route path="/report" element={<ReportCenter />} />
              <Route path="/learning" element={<LearningMode />} />
              <Route path="/platform-guide" element={<PlatformGuide />} />
            </Routes>
          </main>
        </AppErrorBoundary>
        <Footer />
      </BrowserRouter>
    </ProjectProvider>
  );
}
