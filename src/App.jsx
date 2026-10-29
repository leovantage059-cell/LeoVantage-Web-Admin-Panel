import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ToastContainer from './components/ToastContainer';

// Views
import DashboardView from './views/DashboardView';
import HeroEditorView from './views/HeroEditorView';
import ProjectsView from './views/ProjectsView';
import ServicesView from './views/ServicesView';
import TeamView from './views/TeamView';
import ReviewsView from './views/ReviewsView';
import FaqsView from './views/FaqsView';
import InquiriesView from './views/InquiriesView';
import ClientsView from './views/ClientsView';
import DeliveryView from './views/DeliveryView';
import TasksView from './views/TasksView';
import FinanceView from './views/FinanceView';
import DocumentsView from './views/DocumentsView';
import NotesCallsView from './views/NotesCallsView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';
import LoginView from './views/LoginView';

// Real-time Firestore subscriptions
import {
  subscribeProjects,
  subscribeServices,
  subscribePricingPackages,
  subscribeTeamMembers,
  subscribeReviews,
  subscribeFaqs,
  subscribeProcessSteps,
  subscribeInquiries,
  subscribeClients,
  subscribeDeliveryProjects,
  subscribeTasks,
  subscribeInvoices,
  subscribeExpenses,
  subscribeDocuments,
  subscribeNotes,
  subscribeCallRecords
} from './services/firestoreService';

function AdminShell() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Toast Notification System
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };
  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time Data Stores
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [pricingPackages, setPricingPackages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [processSteps, setProcessSteps] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [clients, setClients] = useState([]);
  const [deliveryProjects, setDeliveryProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [callRecords, setCallRecords] = useState([]);

  // Modal Triggers for Quick Add
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Subscribe to collections only when authenticated as Admin
  useEffect(() => {
    if (!isAdmin) return;

    const unsubs = [
      subscribeProjects(setProjects),
      subscribeServices(setServices),
      subscribePricingPackages(setPricingPackages),
      subscribeTeamMembers(setTeamMembers),
      subscribeReviews(setReviews),
      subscribeFaqs(setFaqs),
      subscribeProcessSteps(setProcessSteps),
      subscribeInquiries(setInquiries),
      subscribeClients(setClients),
      subscribeDeliveryProjects(setDeliveryProjects),
      subscribeTasks(setTasks),
      subscribeInvoices(setInvoices),
      subscribeExpenses(setExpenses),
      subscribeDocuments(setDocuments),
      subscribeNotes(setNotes),
      subscribeCallRecords(setCallRecords)
    ];

    return () => {
      unsubs.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [isAdmin]);

  const handleQuickAdd = (type) => {
    if (type === 'project') {
      setCurrentView('projects');
      setProjectModalOpen(true);
    } else if (type === 'client') {
      setCurrentView('clients');
      setClientModalOpen(true);
    } else if (type === 'invoice') {
      setCurrentView('finance');
      setInvoiceModalOpen(true);
    } else if (type === 'task') {
      setCurrentView('tasks');
      setTaskModalOpen(true);
    }
  };

  // Auth Guard
  if (authLoading) {
    return (
      <div className="auth-page-wrap">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Initializing LeoVantage Admin OS Security &amp; Authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return <LoginView />;
  }

  // Filter lists based on global search if query present
  const term = searchTerm.trim().toLowerCase();
  const searchFilteredProjects = term 
    ? projects.filter((p) => p.title?.toLowerCase().includes(term) || p.client?.toLowerCase().includes(term)) 
    : projects;
  const searchFilteredInquiries = term 
    ? inquiries.filter((i) => i.name?.toLowerCase().includes(term) || i.email?.toLowerCase().includes(term) || i.service?.toLowerCase().includes(term)) 
    : inquiries;
  const searchFilteredClients = term 
    ? clients.filter((c) => c.name?.toLowerCase().includes(term) || c.company?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term)) 
    : clients;
  const searchFilteredInvoices = term 
    ? invoices.filter((inv) => inv.clientName?.toLowerCase().includes(term) || inv.invoiceNumber?.toLowerCase().includes(term)) 
    : invoices;

  // Dynamic Sidebar Badge Counts
  const counts = {
    newInquiries: inquiries.filter((i) => (i.status || 'New') === 'New').length,
    projects: projects.length,
    services: services.length,
    reviews: reviews.length,
    clients: clients.length,
    activeProjects: deliveryProjects.filter((d) => d.stage !== 'Launched').length,
    tasks: tasks.filter((t) => t.status !== 'Done').length,
    documents: documents.length,
    pendingInvoices: invoices.filter((i) => i.status === 'Sent' || i.status === 'Draft').length
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            inquiries={searchFilteredInquiries}
            clients={searchFilteredClients}
            projects={searchFilteredProjects}
            deliveryProjects={deliveryProjects}
            invoices={searchFilteredInvoices}
            tasks={tasks}
            setCurrentView={setCurrentView}
            onQuickAdd={handleQuickAdd}
          />
        );
      case 'hero':
        return <HeroEditorView showToast={showToast} />;
      case 'projects':
        return (
          <ProjectsView
            projects={searchFilteredProjects}
            showToast={showToast}
            modalOpen={projectModalOpen}
            setModalOpen={setProjectModalOpen}
          />
        );
      case 'services':
        return (
          <ServicesView
            services={services}
            pricingPackages={pricingPackages}
            showToast={showToast}
          />
        );
      case 'team':
        return <TeamView teamMembers={teamMembers} showToast={showToast} />;
      case 'reviews':
        return <ReviewsView reviews={reviews} showToast={showToast} />;
      case 'faqs':
        return <FaqsView faqs={faqs} processSteps={processSteps} showToast={showToast} />;
      case 'inquiries':
        return (
          <InquiriesView
            inquiries={searchFilteredInquiries}
            showToast={showToast}
            setCurrentView={setCurrentView}
          />
        );
      case 'clients':
        return (
          <ClientsView
            clients={searchFilteredClients}
            showToast={showToast}
            modalOpen={clientModalOpen}
            setModalOpen={setClientModalOpen}
          />
        );
      case 'delivery':
        return (
          <DeliveryView
            deliveryProjects={deliveryProjects}
            clients={clients}
            showToast={showToast}
            modalOpen={false}
            setModalOpen={() => {}}
          />
        );
      case 'tasks':
        return (
          <TasksView
            tasks={tasks}
            clients={clients}
            showToast={showToast}
            modalOpen={taskModalOpen}
            setModalOpen={setTaskModalOpen}
          />
        );
      case 'finance':
        return (
          <FinanceView
            invoices={searchFilteredInvoices}
            expenses={expenses}
            clients={clients}
            showToast={showToast}
            modalOpen={invoiceModalOpen}
            setModalOpen={setInvoiceModalOpen}
          />
        );
      case 'documents':
        return (
          <DocumentsView
            documents={documents}
            clients={clients}
            showToast={showToast}
          />
        );
      case 'notes_calls':
        return (
          <NotesCallsView
            notes={notes}
            callRecords={callRecords}
            showToast={showToast}
          />
        );
      case 'reports':
        return (
          <ReportsView
            inquiries={inquiries}
            clients={clients}
            invoices={invoices}
            deliveryProjects={deliveryProjects}
            tasks={tasks}
          />
        );
      case 'settings':
        return <SettingsView showToast={showToast} />;
      case 'calendar':
        return (
          <DeliveryView
            deliveryProjects={deliveryProjects}
            clients={clients}
            showToast={showToast}
            modalOpen={false}
            setModalOpen={() => {}}
          />
        );
      default:
        return (
          <DashboardView
            inquiries={searchFilteredInquiries}
            clients={searchFilteredClients}
            projects={searchFilteredProjects}
            deliveryProjects={deliveryProjects}
            invoices={searchFilteredInvoices}
            tasks={tasks}
            setCurrentView={setCurrentView}
            onQuickAdd={handleQuickAdd}
          />
        );
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        counts={counts}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="main-wrapper">
        <Topbar
          currentView={currentView}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setMobileOpen={setMobileOpen}
          onQuickAdd={handleQuickAdd}
        />

        <div className="view-container">
          {renderActiveView()}
        </div>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
