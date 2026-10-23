# LeoVantage Web Studio — Admin Panel Prototype

A standalone, UI-first admin operating system prototype for **LeoVantage Web Studio**.

## 🚀 Live Preview / Quick Start

- Open [`admin-preview.html`](admin-preview.html) directly in any modern browser (Chrome, Edge, Firefox, Safari).
- Zero dependencies, no Node.js / build steps required, no Firebase or external API keys needed.
- All styles, vector brand graphics, interactive state, and mock data engines are bundled within the standalone HTML document.

---

## 🎨 Brand Identity & Design System

- **Primary Colors**: Midnight Navy (`#121A2E`), Deep Tech Navy (`#1C2740`), Electric Lime (`#C7F36B`), and Soft Off-White (`#F5F7F2`).
- **Typography**: Google Fonts **Sora** (Headings) & **Inter** (Data tables & body text).
- **Aesthetic**: Dark-mode glassmorphic interface, tactile micro-animations, accessible contrast ratios, and responsive mobile drawer navigation.

---

## 📂 Information Architecture

1. **Overview**
   - **Dashboard**: Studio Command Center with KPI summary cards, lead velocity snapshot, monthly cash flow charts, and active sprint milestones.
   - **Activity & Tasks**: Operational checklist with priority tags and assignee tracking.
   - **Calendar**: Sprint deadlines, client discovery calls, and milestone dates.

2. **Website Content Management**
   - **Homepage Hero**: Real-time split-screen visual preview with live headline and CTA updates.
   - **Featured Projects**: Re-order and toggle homepage showcase cards.
   - **All Projects / Case Studies**: Table & Grid views, search/filter, and deep Case Study Drawer.
   - **Services**: Service deliverables checklist and pricing packages.
   - **Team**: Strict separation of public portfolio profile fields from confidential internal agency records.
   - **Reviews**: Verified client quotes with 1-click Approval & Live Publishing toggles.
   - **FAQs & Process**: Methodologies and accordion editors.
   - **Site Settings**: Agency legal details, GSTIN, SEO metadata, and social links.

3. **Agency Operations**
   - **Inquiries / Leads CRM**: Pipeline board & table views with **"Convert to Client & Project"** deal transformation.
   - **Clients**: 360° client directory with lifetime value (LTV) in INR (`₹`) and outstanding balances.
   - **Project Delivery**: Internal engineering & design sprint board with dynamic progress bars.
   - **Documents Vault**: Categorized deliverables and agreements with file security disclaimers.
   - **Notes & Call Records**: Pinned strategy notes, meeting summaries, and key decisions.
   - **Finance**: Financial ledger in INR (`₹`), 18% GST invoice generator, and operating overhead.

4. **Growth & Marketing**
   - **Social Media**: Multi-channel announcement composer and editorial schedule feed.
   - **Content Planner**: Multi-stage publication pipeline (Idea, Writing, Review, Ready).
   - **Reports**: Executive summaries, service demand breakdowns, and PDF export simulation.

---

## 🔒 Security & Demo Data Notice

- Non-sensitive changes persist in browser `localStorage` (`leovantage_admin_store_v2`).
- Reset demo data at any time via **Profile Menu → Reset Demo Data Store**.
- Features requiring cloud databases or external APIs (e.g. S3 uploads, OAuth publishing) are clearly labeled with *"Integration coming later"*.

---

© 2026 LeoVantage Web Studio. All rights reserved.
