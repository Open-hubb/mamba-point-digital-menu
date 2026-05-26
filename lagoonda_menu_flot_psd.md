# Product Specification Document (PSD)

## 📑 Project Metadata
* **Project Name:** Lagoonda / Cape Leisure Club — Minimalist Menu & Embedded Checkout
* **Target Environment:** Mobile Web (iOS Safari, Android Chrome, In-App Webviews)
* **Architecture Style:** Choice B (Visual Wrapper Architecture)
* **Integration Model:** Universal Static Checkout (No Dynamic Table Parameterization)
* **Checkout Gateway:** Flot Payment System (`https://pay.flotme.ai/lagoonda`)

---

## 1. Executive Summary & Objective
The goal of this project is to consolidate the guest digital experience at Cape Leisure Club (Lagoonda / Mamba Point) into a single, high-end mobile-responsive web layout triggered by a single QR code on the tables. 

Instead of multiple QR codes for browsing and paying, this solution provides a premium, unified interface. Guests will browse an ultra-minimalist, fast-loading visual menu. When ready to settle their bill, a fixed global Call-To-Action (CTA) triggers an on-screen iframe checkout modal. The checkout process must occur completely inline without taking the user away from the application or opening secondary browser tabs.

---

## 2. Brand Architecture & Visual Guidelines

### 2.1 Design Aesthetic
* **Theme:** Gallery Minimalist / Modern Luxury.
* **Core Philosophy:** High spatial breathing room, crisp typographical hierarchies, and extreme intentional whitespace to evoke an upscale, clean lounge feeling.

### 2.2 Palette Configuration
* **Primary Canvas Background:** `#FFFFFF` (Pure White)
* **Secondary Surface/Card Background:** `#FAFAFA` (Soft Neutral White)
* **Primary Structural Text:** `#111111` (Rich Charcoal / True Off-Black)
* **Secondary/Muted Copy:** `#666666` (Slate Gray)
* **Borders, Dividers, Lines:** `#EAEAEA` or `#F5F5F5` (Ultra-Light Linear Dividers)

### 2.3 Typography Style & Weight
* **Headings (H1, H2, H3):** High-contrast Serif or geometric Sans-Serif (e.g., *Playfair Display*, *Cinzel*, or clean *Inter Bold*). Maximize letter-spacing slightly on category elements.
* **Body, Subtitles, Descriptions:** Geometric or Humanist Sans-Serif (e.g., *Inter*, *Montserrat*, or *SF Pro Text*). Font scaling optimized strictly for readability on 5.5" to 6.7" smartphone viewports.

---

## 3. Structural Layout & Interface Sections

The system will operate as a smooth single-page interface with a top sticky navigation system tracking user scrolling across the following categorical sections:

1. **Header Block:** Cape Leisure Club - Mamba Point branding, minimalist logo placeholder, phone contact hook (`tel://099100100`), and operational context.
2. **Category Selection Bar:** A horizontally scrollable tab list featuring:
   * Starters
   * Salads
   * Main Course
   * Cold Mezza
   * Hot Mezza
   * Charcoal Grilled Platter
   * Cape Sandwiches
   * Soups
   * Burger Section
   * African Dish
   * Pastry / Desserts
   * Beverages / Italian Bar
3. **Menu Flow Matrix:** Each item entry must display cleanly with structural whitespace separating name, short description, tags (e.g., *GF, V*), and right-aligned price presentation.

---

## 4. Technical Integration: Flot Checkout Popup Modal

### 4.1 Fixed Floating Action Anchor
* **Placement:** `position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 999;`
* **Styling:** Pill-shaped rounded container, white backdrop (`#FFFFFF`), solid thin border or high-end micro drop shadow (`box-shadow: 0 10px 30px rgba(0,0,0,0.08)`).
* **Typography:** Bold uppercase tracking text with clean iconography: `💳 PAY BILL`.

### 4.2 Modal Sheet Architecture (No New Tabs)
* **Trigger Event:** User clicks the floating `💳 PAY BILL` anchor.
* **Execution Logic:** 1. Instantiate a full-viewport modal overlay container over the current viewport state.
  2. Implement an HTML `<iframe>` object mapped directly to the permanent checkout endpoint:
     ```html
     <iframe src="https://pay.flotme.ai/lagoonda" style="width: 100%; height: 100%; border: none;"></iframe>
     ```
  3. Ensure a persistent, distinct dismiss control (`✕ Close`) sits prominently anchored in the top right or top left layer of the modal.
  4. On dismiss action click, destroy or hide the overlay layer immediately returning user context back to their exact scroll location on the menu interface.

### 4.3 Universal Tracking Mapping
* **Constraint Resolution:** In alignment with final production guidelines, **dynamic table tracking parameterization is decoupled**. The checkout button resolves explicitly to the global checkout endpoint across all terminal assets.

---

## 5. Engineering Constraints & Operational Checklist
* **Performance Baseline:** Light CSS footprint. Zero massive JavaScript bundle overhead. Images must use modern WebP compilation with explicit height/width bounds to eliminate cumulative layout shifts (CLS).
* **Network Tolerance:** Optimized to execute fluidly in outdoor terrace/beachside connectivity configurations.
* **Responsive Breakpoints:** Explicit optimization for Safari WebView (iOS Camera trigger/QR runtime) and Chrome Custom Tabs. Ensure full layout safety bounds preventing interface clippings at the base edge of modern notch displays.
