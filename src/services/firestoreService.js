import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Helper to format Firestore dates safely
export function formatDate(timestamp) {
  if (!timestamp) return '—';
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  return '—';
}

export function formatINR(val) {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

/* ==========================================================================
   1. HERO BANNER
   ========================================================================== */
export async function getHeroBanner() {
  const snap = await getDoc(doc(db, 'site_hero', 'main'));
  if (snap.exists()) {
    return snap.data();
  }
  return {
    badge: 'Available for New Projects',
    headlinePart1: 'PLAN. BUILD.',
    headlinePart2: 'LAUNCH.',
    subcopy: 'We design and build websites and apps that are easy to use and built around your business goals.',
    primaryCtaText: 'EXPLORE SERVICES',
    primaryCtaLink: 'services',
    secondaryCtaText: 'VIEW OUR WORK',
    secondaryCtaLink: 'work',
    visibility: true
  };
}

export async function updateHeroBanner(data) {
  const ref = doc(db, 'site_hero', 'main');
  await setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/* ==========================================================================
   2. PROJECTS (CASE STUDIES & PORTFOLIO)
   ========================================================================== */
export function subscribeProjects(callback) {
  const q = collection(db, 'projects');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(items);
  });
}

export async function saveProject(projectData) {
  const { id, ...data } = projectData;
  const projectSlug = id || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const ref = doc(db, 'projects', projectSlug);

  const payload = {
    ...data,
    id: projectSlug,
    status: data.status || 'Published',
    updatedAt: serverTimestamp()
  };

  if (!data.createdAt) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(ref, payload, { merge: true });
  return projectSlug;
}

export async function deleteProject(id) {
  await deleteDoc(doc(db, 'projects', id));
}

/* ==========================================================================
   3. SERVICES & PRICING
   ========================================================================== */
export function subscribeServices(callback) {
  const q = collection(db, 'services');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(items);
  });
}

export async function saveService(serviceData) {
  const { id, ...data } = serviceData;
  const serviceId = id || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const ref = doc(db, 'services', serviceId);
  await setDoc(ref, {
    ...data,
    id: serviceId,
    status: data.status || 'Published',
    visibility: data.visibility !== false,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteService(id) {
  await deleteDoc(doc(db, 'services', id));
}

export function subscribePricingPackages(callback) {
  const q = collection(db, 'pricing_packages');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(items);
  });
}

export async function savePricingPackage(pkgData) {
  const { id, ...data } = pkgData;
  const pkgId = id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const ref = doc(db, 'pricing_packages', pkgId);
  await setDoc(ref, {
    ...data,
    id: pkgId,
    status: data.status || 'Published',
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deletePricingPackage(id) {
  await deleteDoc(doc(db, 'pricing_packages', id));
}

/* ==========================================================================
   4. TEAM MEMBERS
   ========================================================================== */
export function subscribeTeamMembers(callback) {
  const q = collection(db, 'team_members');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(items);
  });
}

export async function saveTeamMember(memberData) {
  const { id, ...data } = memberData;
  const memberId = id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const ref = doc(db, 'team_members', memberId);
  await setDoc(ref, {
    ...data,
    id: memberId,
    status: data.status || 'Published',
    visibility: data.visibility !== false,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteTeamMember(id) {
  await deleteDoc(doc(db, 'team_members', id));
}

/* ==========================================================================
   5. REVIEWS & TESTIMONIALS
   ========================================================================== */
export function subscribeReviews(callback) {
  const q = collection(db, 'reviews');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(items);
  });
}

export async function saveReview(reviewData) {
  const { id, ...data } = reviewData;
  if (id) {
    const ref = doc(db, 'reviews', String(id));
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } else {
    await addDoc(collection(db, 'reviews'), {
      ...data,
      status: data.status || 'Published',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

export async function deleteReview(id) {
  await deleteDoc(doc(db, 'reviews', String(id)));
}

/* ==========================================================================
   6. FAQS & PROCESS STEPS
   ========================================================================== */
export function subscribeFaqs(callback) {
  const q = collection(db, 'faqs');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(items);
  });
}

export async function saveFaq(faqData) {
  const { id, ...data } = faqData;
  if (id) {
    await setDoc(doc(db, 'faqs', String(id)), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } else {
    await addDoc(collection(db, 'faqs'), {
      ...data,
      status: data.status || 'Published',
      createdAt: serverTimestamp()
    });
  }
}

export async function deleteFaq(id) {
  await deleteDoc(doc(db, 'faqs', String(id)));
}

export function subscribeProcessSteps(callback) {
  const q = collection(db, 'process_steps');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(items);
  });
}

export async function saveProcessStep(stepData) {
  const { id, ...data } = stepData;
  const stepId = id || `step-${data.number || Date.now()}`;
  await setDoc(doc(db, 'process_steps', stepId), {
    ...data,
    status: data.status || 'Published',
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteProcessStep(id) {
  await deleteDoc(doc(db, 'process_steps', id));
}

/* ==========================================================================
   7. INQUIRIES CRM (LIVE SUBMISSIONS FROM WEBSITE)
   ========================================================================== */
export function subscribeInquiries(callback) {
  const q = collection(db, 'inquiries');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort newest first
    items.sort((a, b) => {
      const timeA = a.createdAt?.seconds || (a.submittedAt ? new Date(a.submittedAt).getTime() : 0);
      const timeB = b.createdAt?.seconds || (b.submittedAt ? new Date(b.submittedAt).getTime() : 0);
      return timeB - timeA;
    });
    callback(items);
  });
}

export async function updateInquiryStatus(inquiryId, status) {
  await updateDoc(doc(db, 'inquiries', inquiryId), {
    status,
    updatedAt: serverTimestamp()
  });
}

export async function addInquiryNote(inquiryId, noteText, author = 'Admin') {
  const snap = await getDoc(doc(db, 'inquiries', inquiryId));
  if (snap.exists()) {
    const existingNotes = snap.data().notes || [];
    const newNote = {
      text: noteText,
      author,
      createdAt: new Date().toISOString()
    };
    await updateDoc(doc(db, 'inquiries', inquiryId), {
      notes: [...existingNotes, newNote],
      updatedAt: serverTimestamp()
    });
  }
}

export async function deleteInquiry(id) {
  await deleteDoc(doc(db, 'inquiries', id));
}

/**
 * Converts an inquiry into an active Studio Client in the CRM
 */
export async function convertInquiryToClient(inquiry) {
  const clientRef = await addDoc(collection(db, 'clients'), {
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone || '',
    company: inquiry.name ? `${inquiry.name}'s Company` : 'New Client',
    status: 'Onboarding',
    tier: 'Growth',
    totalBilled: 0,
    outstanding: 0,
    projectsCount: 1,
    notes: `Converted from website inquiry (Service: ${inquiry.service}, Budget: ${inquiry.budget})`,
    convertedFromInquiryId: inquiry.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Update inquiry status
  await updateDoc(doc(db, 'inquiries', inquiry.id), {
    status: 'Converted',
    convertedToClientId: clientRef.id,
    updatedAt: serverTimestamp()
  });

  return clientRef.id;
}

/* ==========================================================================
   8. CLIENTS DIRECTORY
   ========================================================================== */
export function subscribeClients(callback) {
  const q = collection(db, 'clients');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(items);
  });
}

export async function saveClient(clientData) {
  const { id, ...data } = clientData;
  if (id) {
    await setDoc(doc(db, 'clients', id), {
      ...data,
      totalBilled: parseFloat(data.totalBilled) || 0,
      outstanding: parseFloat(data.outstanding) || 0,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return id;
  } else {
    const ref = await addDoc(collection(db, 'clients'), {
      ...data,
      totalBilled: parseFloat(data.totalBilled) || 0,
      outstanding: parseFloat(data.outstanding) || 0,
      status: data.status || 'Active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return ref.id;
  }
}

export async function deleteClient(id) {
  await deleteDoc(doc(db, 'clients', id));
}

/* ==========================================================================
   9. DELIVERY PROJECTS (ACTIVE CLIENT SPRINTS)
   ========================================================================== */
export function subscribeDeliveryProjects(callback) {
  const q = collection(db, 'delivery_projects');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(items);
  });
}

export async function saveDeliveryProject(projData) {
  const { id, ...data } = projData;
  const payload = {
    ...data,
    progress: parseInt(data.progress, 10) || 0,
    budget: parseFloat(data.budget) || 0,
    updatedAt: serverTimestamp()
  };

  if (id) {
    await setDoc(doc(db, 'delivery_projects', id), payload, { merge: true });
    return id;
  } else {
    payload.createdAt = serverTimestamp();
    payload.status = payload.status || 'Active';
    const ref = await addDoc(collection(db, 'delivery_projects'), payload);
    return ref.id;
  }
}

export async function deleteDeliveryProject(id) {
  await deleteDoc(doc(db, 'delivery_projects', id));
}

/* ==========================================================================
   10. TASKS & SPRINTS
   ========================================================================== */
export function subscribeTasks(callback) {
  const q = collection(db, 'tasks');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(items);
  });
}

export async function saveTask(taskData) {
  const { id, ...data } = taskData;
  const payload = {
    ...data,
    status: data.status || 'To Do',
    priority: data.priority || 'Medium',
    updatedAt: serverTimestamp()
  };

  if (id) {
    await setDoc(doc(db, 'tasks', id), payload, { merge: true });
    return id;
  } else {
    payload.createdAt = serverTimestamp();
    const ref = await addDoc(collection(db, 'tasks'), payload);
    return ref.id;
  }
}

export async function updateTaskStatus(taskId, status) {
  await updateDoc(doc(db, 'tasks', taskId), {
    status,
    updatedAt: serverTimestamp()
  });
}

export async function deleteTask(id) {
  await deleteDoc(doc(db, 'tasks', id));
}

/* ==========================================================================
   11. FINANCE: INVOICES & EXPENSES (WITH 18% GST ACCURACY)
   ========================================================================== */
export function subscribeInvoices(callback) {
  const q = collection(db, 'invoices');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(items);
  });
}

export async function saveInvoice(invData) {
  const { id, ...data } = invData;
  
  // Calculate subtotal from items if present
  let subtotal = parseFloat(data.amount) || 0;
  if (Array.isArray(data.items) && data.items.length > 0) {
    subtotal = data.items.reduce((acc, item) => acc + (parseFloat(item.rate || 0) * (parseInt(item.qty, 10) || 1)), 0);
  }

  // Exact 18% GST calculation
  const taxRate = 18;
  const taxAmount = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + taxAmount;

  const payload = {
    ...data,
    amount: subtotal,
    taxRate,
    taxAmount,
    totalAmount,
    status: data.status || 'Draft',
    updatedAt: serverTimestamp()
  };

  if (id) {
    await setDoc(doc(db, 'invoices', id), payload, { merge: true });
    return id;
  } else {
    payload.createdAt = serverTimestamp();
    payload.invoiceNumber = data.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const ref = await addDoc(collection(db, 'invoices'), payload);
    return ref.id;
  }
}

export async function updateInvoiceStatus(id, status) {
  await updateDoc(doc(db, 'invoices', id), {
    status,
    updatedAt: serverTimestamp()
  });
}

export async function deleteInvoice(id) {
  await deleteDoc(doc(db, 'invoices', id));
}

export function subscribeExpenses(callback) {
  const q = collection(db, 'expenses');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(items);
  });
}

export async function saveExpense(expData) {
  const { id, ...data } = expData;
  const amount = parseFloat(data.amount) || 0;
  const payload = {
    ...data,
    amount,
    taxAmount: data.taxAmount ? parseFloat(data.taxAmount) : Math.round(amount * 0.18),
    updatedAt: serverTimestamp()
  };

  if (id) {
    await setDoc(doc(db, 'expenses', id), payload, { merge: true });
    return id;
  } else {
    payload.createdAt = serverTimestamp();
    const ref = await addDoc(collection(db, 'expenses'), payload);
    return ref.id;
  }
}

export async function deleteExpense(id) {
  await deleteDoc(doc(db, 'expenses', id));
}

/* ==========================================================================
   12. DOCUMENTS (METADATA IN FIRESTORE, STORAGE INTEGRATED)
   ========================================================================== */
export function subscribeDocuments(callback) {
  const q = collection(db, 'documents');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(items);
  });
}

export async function saveDocumentRecord(docData) {
  const { id, ...data } = docData;
  const payload = {
    ...data,
    sizeBytes: parseInt(data.sizeBytes, 10) || 0,
    updatedAt: serverTimestamp()
  };

  if (id) {
    await setDoc(doc(db, 'documents', id), payload, { merge: true });
    return id;
  } else {
    payload.createdAt = serverTimestamp();
    const ref = await addDoc(collection(db, 'documents'), payload);
    return ref.id;
  }
}

export async function deleteDocumentRecord(id) {
  await deleteDoc(doc(db, 'documents', id));
}

/* ==========================================================================
   13. NOTES & CALL LOGS
   ========================================================================== */
export function subscribeNotes(callback) {
  const q = collection(db, 'notes');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(items);
  });
}

export async function saveNote(noteData) {
  const { id, ...data } = noteData;
  if (id) {
    await setDoc(doc(db, 'notes', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return id;
  } else {
    const ref = await addDoc(collection(db, 'notes'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return ref.id;
  }
}

export async function deleteNote(id) {
  await deleteDoc(doc(db, 'notes', id));
}

export function subscribeCallRecords(callback) {
  const q = collection(db, 'call_records');
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(items);
  });
}

export async function saveCallRecord(callData) {
  const { id, ...data } = callData;
  const payload = {
    ...data,
    durationMinutes: parseInt(data.durationMinutes, 10) || 15,
    updatedAt: serverTimestamp()
  };
  if (id) {
    await setDoc(doc(db, 'call_records', id), payload, { merge: true });
    return id;
  } else {
    payload.createdAt = serverTimestamp();
    const ref = await addDoc(collection(db, 'call_records'), payload);
    return ref.id;
  }
}

export async function deleteCallRecord(id) {
  await deleteDoc(doc(db, 'call_records', id));
}

/* ==========================================================================
   14. SITE SETTINGS & ADMIN ALLOWLIST
   ========================================================================== */
export async function getSiteSettings() {
  const snap = await getDoc(doc(db, 'site_settings', 'general'));
  if (snap.exists()) return snap.data();
  return {
    agencyName: 'LeoVantage Web Studio',
    tagline: 'PLAN. BUILD. LAUNCH.',
    supportEmail: 'hello@leovantage.com',
    phone: '+91 98765 43210',
    address: 'Bengaluru, Karnataka, India',
    primaryColor: '#C7F36B',
    secondaryColor: '#121A2E'
  };
}

export async function updateSiteSettings(data) {
  await setDoc(doc(db, 'site_settings', 'general'), {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export function subscribeAdminAllowlist(callback) {
  const q = collection(db, 'admin_allowlist');
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ email: d.id, ...d.data() }));
    callback(list);
  });
}

export async function addAdminToAllowlist(email, role = 'Admin', addedBy = 'Super Admin') {
  const cleanEmail = email.trim().toLowerCase();
  await setDoc(doc(db, 'admin_allowlist', cleanEmail), {
    role,
    addedBy,
    addedAt: serverTimestamp()
  });
}

export async function removeAdminFromAllowlist(email) {
  await deleteDoc(doc(db, 'admin_allowlist', email.trim().toLowerCase()));
}
