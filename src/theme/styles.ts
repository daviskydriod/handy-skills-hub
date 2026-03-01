// ── Dashboard Global Styles ────────────────────────────────────────────
// Injected via <style>{globalStyles}</style> in DashboardLayout.
//
// Covers EVERY className used across:
//   Sidebar, TopBar, MobileHeader, MobileBottomNav,
//   StudentDashboard, AdminDashboard, InstructorDashboard,
//   ContentBuilder, UIAtoms, PaymentModal
//
// Class inventory:
//   Layout:   sidebar-wrap, side-nib, bottom-nav, bnav-item, menu-dropdown
//   Cards:    dash-card, dash-row
//   Forms:    dash-inp, fgrid, g3, g4
//   Buttons:  btn-gold, btn-green, btn-red, btn-icon, add-btn, pill
//   Content:  part-block, mod-block, lesson-block, sec-head
//   Utils:    spin, hide-sm
//
// Colors use the NAVY/GOLD hex constants from theme/index.ts directly,
// so no conflict with Tailwind's CSS variable system.

const NAVY  = "#0b1f3a";
const GOLD  = "#EAB308";
const GOLD2 = "#CA8A04";

export const globalStyles = `
  /* ═══════════════════════════════════════════════════════════
     KEYFRAMES
  ═══════════════════════════════════════════════════════════ */
  @keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }

  /* ═══════════════════════════════════════════════════════════
     SIDEBAR
  ═══════════════════════════════════════════════════════════ */

  /* sidebar-wrap — the <aside> element */
  .sidebar-wrap {
    transition: width 220ms cubic-bezier(0.4,0,0.2,1);
    overflow: hidden;
    flex-shrink: 0;
  }
  .sidebar-wrap::-webkit-scrollbar { width: 0; }

  /* side-nib — each nav button in the sidebar */
  .side-nib {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 9px 12px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    transition:
      background 150ms ease,
      color      150ms ease,
      padding-left 150ms ease,
      box-shadow 150ms ease;
    white-space: nowrap;
    overflow: hidden;
  }
  .side-nib:hover {
    background: rgba(255,255,255,0.08) !important;
    color: rgba(255,255,255,0.92) !important;
  }
  /* Don't override the active gold gradient on hover */
  .side-nib[style*="linear-gradient"]:hover {
    opacity: 0.92;
  }

  /* ═══════════════════════════════════════════════════════════
     MOBILE BOTTOM NAV
  ═══════════════════════════════════════════════════════════ */

  /* bottom-nav — the fixed nav bar */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: #ffffff;
    border-top: 1px solid #e8edf2;
    display: flex;
    align-items: stretch;
    z-index: 100;
    box-shadow: 0 -2px 12px rgba(11,31,58,0.07);
  }

  /* bnav-item — each tab button */
  .bnav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
    transition: background 130ms;
    padding: 6px 4px;
  }
  .bnav-item:active {
    background: #f8fafc;
  }

  /* ═══════════════════════════════════════════════════════════
     MOBILE HAMBURGER DROPDOWN
  ═══════════════════════════════════════════════════════════ */
  .menu-dropdown {
    animation: fadeIn 160ms ease both;
  }
  .menu-dropdown button:hover {
    background: #f8fafc !important;
  }

  /* ═══════════════════════════════════════════════════════════
     CORE CARD — used everywhere as dash-card
  ═══════════════════════════════════════════════════════════ */
  .dash-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e8edf2;
    box-shadow: 0 1px 4px rgba(11,31,58,0.06), 0 1px 2px rgba(11,31,58,0.03);
    animation: fadeUp 240ms cubic-bezier(0.4,0,0.2,1) both;
    transition: box-shadow 160ms ease, transform 160ms ease;
  }
  .dash-card:hover {
    box-shadow: 0 4px 14px rgba(11,31,58,0.09), 0 2px 6px rgba(11,31,58,0.05);
  }

  /* ═══════════════════════════════════════════════════════════
     DASH ROW — list item row inside a card
  ═══════════════════════════════════════════════════════════ */
  .dash-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    border-bottom: 1px solid #f1f5f9;
    transition: background 120ms;
  }
  .dash-row:last-child {
    border-bottom: none;
  }
  .dash-row:hover {
    background: #fafbfc;
  }

  /* ═══════════════════════════════════════════════════════════
     FORM INPUT — dash-inp
  ═══════════════════════════════════════════════════════════ */
  .dash-inp {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    color: #0f172a;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 150ms, box-shadow 150ms;
    appearance: none;
    display: block;
    box-sizing: border-box;
  }
  .dash-inp:focus {
    border-color: ${NAVY};
    box-shadow: 0 0 0 3px rgba(11,31,58,0.09);
  }
  .dash-inp::placeholder {
    color: #94a3b8;
  }
  .dash-inp[type="number"]::-webkit-inner-spin-button,
  .dash-inp[type="number"]::-webkit-outer-spin-button {
    opacity: 1;
  }

  /* ═══════════════════════════════════════════════════════════
     RESPONSIVE GRID HELPERS — g3, g4, fgrid
  ═══════════════════════════════════════════════════════════ */

  /* g4 — 4-column stat grid (drops to 2 on mobile) */
  .g4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  @media (max-width: 900px) {
    .g4 { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .g4 { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  }

  /* g3 — 3-column grid (drops to 1 on mobile) */
  .g3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  @media (max-width: 768px) {
    .g3 { grid-template-columns: 1fr; }
  }

  /* fgrid — 2-col form grid (stacks on mobile) */
  .fgrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 540px) {
    .fgrid { grid-template-columns: 1fr; }
  }

  /* ═══════════════════════════════════════════════════════════
     BUTTONS
  ═══════════════════════════════════════════════════════════ */

  /* btn-gold — primary CTA (gold bg, navy text) */
  .btn-gold {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    background: ${GOLD};
    color: ${NAVY};
    border: none;
    border-radius: 10px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition:
      background  140ms ease,
      box-shadow  140ms ease,
      transform   110ms ease;
    box-shadow: 0 2px 8px rgba(234,179,8,0.28);
    white-space: nowrap;
    text-decoration: none;
  }
  .btn-gold:hover {
    background: ${GOLD2};
    box-shadow: 0 4px 14px rgba(234,179,8,0.38);
  }
  .btn-gold:active { transform: scale(0.97); }
  .btn-gold:disabled {
    opacity: 0.48;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* btn-green — approve action */
  .btn-green {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
    border-radius: 8px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background 130ms, transform 110ms;
    white-space: nowrap;
  }
  .btn-green:hover  { background: #a7f3d0; }
  .btn-green:active { transform: scale(0.97); }
  .btn-green:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

  /* btn-red — delete / reject action */
  .btn-red {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
    border-radius: 8px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background 130ms, transform 110ms;
    white-space: nowrap;
  }
  .btn-red:hover  { background: #fecaca; }
  .btn-red:active { transform: scale(0.97); }
  .btn-red:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

  /* btn-icon — small square icon button */
  .btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #e8edf2;
    background: #ffffff;
    cursor: pointer;
    transition: background 130ms, border-color 130ms, transform 110ms;
    flex-shrink: 0;
    padding: 0;
  }
  .btn-icon:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  .btn-icon:active  { transform: scale(0.94); }
  .btn-icon:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* add-btn — dashed "add section" button in ContentBuilder */
  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border: 1.5px dashed #cbd5e1;
    border-radius: 8px;
    background: transparent;
    color: #64748b;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 140ms, color 140ms, background 140ms;
  }
  .add-btn:hover {
    border-color: ${GOLD};
    color: ${GOLD2};
    background: ${GOLD}0f;
  }

  /* pill — filter chip (status / role filter rows) */
  .pill {
    display: inline-flex;
    align-items: center;
    padding: 5px 14px;
    border-radius: 99px;
    border: 1.5px solid #e2e8f0;
    background: #ffffff;
    color: #64748b;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 130ms, background 130ms, color 130ms;
    white-space: nowrap;
  }
  .pill:hover {
    border-color: ${GOLD};
    color: ${GOLD2};
  }

  /* ═══════════════════════════════════════════════════════════
     CONTENT BUILDER BLOCKS — part-block, mod-block, lesson-block, sec-head
  ═══════════════════════════════════════════════════════════ */

  /* part-block — top-level Part container */
  .part-block {
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    background: #ffffff;
    overflow: hidden;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(11,31,58,0.05);
  }

  /* mod-block — Module inside a Part */
  .mod-block {
    border: 1.5px solid #f1f5f9;
    border-radius: 10px;
    background: #fafbfc;
    overflow: hidden;
    margin: 8px 12px 8px;
  }

  /* lesson-block — Lesson inside a Module */
  .lesson-block {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid #f1f5f9;
    background: #ffffff;
    border-radius: 8px;
    margin: 6px 10px;
    box-shadow: 0 1px 2px rgba(11,31,58,0.04);
  }
  .lesson-block:last-child { border-bottom: none; }

  /* sec-head — the header row of a part or module block */
  .sec-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid #f1f5f9;
    background: #f8fafc;
    cursor: pointer;
    user-select: none;
    font-weight: 700;
    font-size: 13px;
    color: ${NAVY};
    transition: background 130ms;
  }
  .sec-head:hover { background: #f1f5f9; }

  /* ═══════════════════════════════════════════════════════════
     UTILITIES
  ═══════════════════════════════════════════════════════════ */

  /* spin — rotating loader icon */
  .spin {
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  /* hide-sm — hide on small screens */
  .hide-sm {
    display: inline;
  }
  @media (max-width: 540px) {
    .hide-sm { display: none !important; }
  }

  /* PaymentModal slide-up animation (used in inline style) */
  @keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  /* Custom scrollbar — dashboard panels */
  .dash-card ::-webkit-scrollbar,
  .sidebar-wrap::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .dash-card ::-webkit-scrollbar-track { background: transparent; }
  .dash-card ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 100px;
  }

  /* ═══════════════════════════════════════════════════════════
     STAGGER ANIMATION DELAY — for grid/list children
  ═══════════════════════════════════════════════════════════ */
  .g4 > *:nth-child(1), .g3 > *:nth-child(1) { animation-delay: 0ms;   }
  .g4 > *:nth-child(2), .g3 > *:nth-child(2) { animation-delay: 55ms;  }
  .g4 > *:nth-child(3), .g3 > *:nth-child(3) { animation-delay: 110ms; }
  .g4 > *:nth-child(4)                        { animation-delay: 165ms; }
`;
