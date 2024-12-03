import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Quotes from './pages/Quotes';
import Products from './pages/Products';
import Payments from './pages/Payments';
import Tickets from './pages/Tickets';
import Clients from './pages/Clients';
import Notes from './pages/Notes';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { UpdateNotification } from './components/update/UpdateNotification';
import { useUpdateStore } from './services/updateService';
import emailService from './services/email/emailService';

try {
  emailService.init();
} catch (error) {
  console.error('Failed to initialize EmailJS:', error);
}

function App() {
  const { checkForUpdates } = useUpdateStore();

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="factures" element={<Invoices />} />
          <Route path="devis" element={<Quotes />} />
          <Route path="articles" element={<Products />} />
          <Route path="paiements" element={<Payments />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="clients" element={<Clients />} />
          <Route path="notes" element={<Notes />} />
          <Route path="rapports" element={<Reports />} />
          <Route path="parametres" element={<Settings />} />
        </Route>
      </Routes>
      <UpdateNotification />
    </BrowserRouter>
  );
}

export default App;