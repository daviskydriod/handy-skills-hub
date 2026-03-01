// ── Global Styles ──────────────────────────────────────────────────────
// Injected via <style>{globalStyles}</style> in DashboardLayout.
// Covers resets, scrollbars, animations, utility classes, and
// component-level micro-interaction styles used across all dashboards.

import { NAVY, NAVY2, GOLD, GOLD2 } from "./index";

export const globalStyles = `
  /* ── Reset & Base ─────────────────────────────────────────── */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    font-size: 15px;
    color: #1e293b;
    background: #f4f7fb;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
    font-size: inherit;
  }

  img {
    max-width: 100%;
    display: block;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* ── CSS Variables ────────────────────────────────────────── */
  :root {
    --navy:  ${NAVY};
    --navy2: ${NAVY2};
    --gold:  ${GOLD};
    --gold2: ${GOLD2};
    --bg:    #f4f7fb;
    --surface: #ffffff;
    --border: #e2e8f0;
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --text-muted: #94a3b8;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --shadow-sm: 0 1px 3px rgba(11,31,58,0.08), 0 1px 2px rgba(11,31,58,0.04);
    --shadow-md: 0 4px 12px rgba(11,31,58,0.10), 0 2px 6px rgba(11,31,58,0.06);
    --shadow-lg: 0 12px 32px rgba(11,31,58,0.14), 0 4px 12px rgba(11,31,58,0.08);
    --transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-md: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --sidebar-width: 240px;
  }

  /* ── Custom Scrollbar ─────────────────────────────────────── */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 100px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* ── Keyframe Animations ──────────────────────────────────── */
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  @keyframes badgePop {
    0%   { transform: scale(0); }
    70%  { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  /* ── Animation Utility Classes ────────────────────────────── */
  .animate-fade-in  { animation: fadeIn  var(--transition-md) both; }
  .animate-fade-up  { animation: fadeUp  var(--transition-md) both; }
  .animate-fade-down{ animation: fadeDown var(--transition-md) both; }
  .animate-scale-in { animation: scaleIn var(--transition-md) both; }
  .animate-slide-left { animation: slideInLeft var(--transition-md) both; }

  /* Staggered children — add .stagger to parent */
  .stagger > *:nth-child(1) { animation-delay: 0ms; }
  .stagger > *:nth-child(2) { animation-delay: 60ms; }
  .stagger > *:nth-child(3) { animation-delay: 120ms; }
  .stagger > *:nth-child(4) { animation-delay: 180ms; }
  .stagger > *:nth-child(5) { animation-delay: 240ms; }
  .stagger > *:nth-child(6) { animation-delay: 300ms; }

  /* ── Card / Surface ───────────────────────────────────────── */
  .card {
    background: var(--surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    padding: 20px 24px;
    animation: fadeUp var(--transition-md) both;
  }

  .card-hover {
    transition: box-shadow var(--transition), transform var(--transition);
  }
  .card-hover:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  /* ── Stat Card Accent Bars ────────────────────────────────── */
  .stat-card {
    position: relative;
    overflow: hidden;
    background: var(--surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    padding: 20px 24px;
    transition: box-shadow var(--transition), transform var(--transition);
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px; height: 100%;
    background: var(--gold);
    border-radius: 0 0 0 var(--radius-lg);
  }
  .stat-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  /* ── Buttons ──────────────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 14px;
    transition: background var(--transition), box-shadow var(--transition),
                transform var(--transition), opacity var(--transition);
  }
  .btn:active { transform: scale(0.97); }

  .btn-primary {
    background: var(--navy);
    color: #fff;
    box-shadow: 0 2px 8px rgba(11,31,58,0.25);
  }
  .btn-primary:hover {
    background: var(--navy2);
    box-shadow: 0 4px 14px rgba(11,31,58,0.35);
  }

  .btn-gold {
    background: var(--gold);
    color: var(--navy);
    box-shadow: 0 2px 8px rgba(234,179,8,0.30);
  }
  .btn-gold:hover {
    background: var(--gold2);
    box-shadow: 0 4px 14px rgba(234,179,8,0.40);
  }

  .btn-outline {
    background: transparent;
    color: var(--navy);
    border: 1.5px solid var(--border);
  }
  .btn-outline:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }

  .btn-ghost {
    background: transparent;
    color: var(--text-secondary);
    padding: 8px 12px;
  }
  .btn-ghost:hover {
    background: #f1f5f9;
    color: var(--text-primary);
  }

  .btn-danger {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  }
  .btn-danger:hover {
    background: #fecaca;
  }

  .btn-sm {
    padding: 6px 12px;
    font-size: 13px;
    border-radius: var(--radius-sm);
  }
  .btn-lg {
    padding: 12px 24px;
    font-size: 15px;
    border-radius: var(--radius-lg);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* ── Form Inputs ──────────────────────────────────────────── */
  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color var(--transition), box-shadow var(--transition);
    outline: none;
  }
  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    border-color: var(--navy);
    box-shadow: 0 0 0 3px rgba(11,31,58,0.08);
  }
  .form-input::placeholder,
  .form-textarea::placeholder {
    color: var(--text-muted);
  }
  .form-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 6px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 16px;
  }

  /* ── Badges / Status Chips ────────────────────────────────── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
  /* Notification badge pop animation */
  .badge-notify {
    animation: badgePop 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  /* ── Table ────────────────────────────────────────────────── */
  .table-wrapper {
    overflow-x: auto;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    background: var(--surface);
  }
  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .table th {
    background: #f8fafc;
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  .table td {
    padding: 13px 16px;
    border-bottom: 1px solid #f1f5f9;
    color: var(--text-primary);
    vertical-align: middle;
  }
  .table tbody tr:last-child td {
    border-bottom: none;
  }
  .table tbody tr {
    transition: background var(--transition);
  }
  .table tbody tr:hover {
    background: #f8fafc;
  }

  /* ── Skeleton Loader ──────────────────────────────────────── */
  .skeleton {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s ease-in-out infinite;
    border-radius: var(--radius-sm);
  }

  /* ── Spinner ──────────────────────────────────────────────── */
  .spinner {
    display: inline-block;
    width: 18px; height: 18px;
    border: 2px solid rgba(11,31,58,0.15);
    border-top-color: var(--navy);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  .spinner-gold {
    border-color: rgba(234,179,8,0.25);
    border-top-color: var(--gold);
  }
  .spinner-white {
    border-color: rgba(255,255,255,0.3);
    border-top-color: #fff;
  }

  /* ── Alert / Toast Banners ────────────────────────────────── */
  .alert {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border-radius: var(--radius-md);
    border-left: 4px solid transparent;
    font-size: 14px;
    animation: fadeDown var(--transition-md) both;
  }
  .alert-info    { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }
  .alert-success { background: #f0fdf4; border-color: #22c55e; color: #15803d; }
  .alert-warning { background: #fffbeb; border-color: var(--gold); color: #92400e; }
  .alert-error   { background: #fef2f2; border-color: #ef4444; color: #b91c1c; }

  /* ── Modal Overlay ────────────────────────────────────────── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(11,31,58,0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: fadeIn 200ms ease both;
  }
  .modal-box {
    background: var(--surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    animation: scaleIn 200ms cubic-bezier(0.34, 1.3, 0.64, 1) both;
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border);
  }
  .modal-body    { padding: 20px 24px; }
  .modal-footer  {
    padding: 16px 24px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  /* ── Sidebar Nav Item ─────────────────────────────────────── */
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    cursor: pointer;
    color: rgba(255,255,255,0.65);
    font-size: 14px;
    font-weight: 500;
    transition: background var(--transition), color var(--transition),
                padding-left var(--transition);
    user-select: none;
  }
  .nav-item:hover {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.95);
    padding-left: 18px;
  }
  .nav-item.active {
    background: var(--gold);
    color: var(--navy);
    font-weight: 700;
    box-shadow: 0 2px 10px rgba(234,179,8,0.35);
  }
  .nav-item.active:hover {
    background: var(--gold2);
    padding-left: 14px;
  }

  /* ── TopBar ───────────────────────────────────────────────── */
  .topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255,255,255,0.90);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* ── Mobile Bottom Nav ────────────────────────────────────── */
  .mobile-bottom-nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 64px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    display: flex;
    z-index: 200;
    box-shadow: 0 -4px 16px rgba(11,31,58,0.08);
  }
  .mobile-bottom-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-muted);
    transition: color var(--transition), background var(--transition);
    cursor: pointer;
    border-radius: 0;
  }
  .mobile-bottom-nav-item.active {
    color: var(--navy);
  }
  .mobile-bottom-nav-item.active svg {
    color: var(--gold);
  }
  .mobile-bottom-nav-item:active {
    background: #f1f5f9;
  }

  /* ── Divider ──────────────────────────────────────────────── */
  .divider {
    height: 1px;
    background: var(--border);
    margin: 16px 0;
  }

  /* ── Avatar ───────────────────────────────────────────────── */
  .avatar {
    border-radius: 50%;
    object-fit: cover;
    background: var(--navy);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  /* ── Empty State ──────────────────────────────────────────── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    text-align: center;
    color: var(--text-muted);
    gap: 12px;
  }
  .empty-state-icon {
    width: 56px; height: 56px;
    background: #f1f5f9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
  }

  /* ── Progress Bar ─────────────────────────────────────────── */
  .progress-track {
    height: 6px;
    background: #e2e8f0;
    border-radius: 100px;
    overflow: hidden;
    flex: 1;
  }
  .progress-fill {
    height: 100%;
    border-radius: 100px;
    background: var(--gold);
    transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .progress-fill-navy {
    background: var(--navy);
  }
  .progress-fill-green {
    background: #22c55e;
  }

  /* ── Tooltip ──────────────────────────────────────────────── */
  [data-tooltip] {
    position: relative;
  }
  [data-tooltip]::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--navy);
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: var(--radius-sm);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--transition);
    z-index: 999;
  }
  [data-tooltip]:hover::after {
    opacity: 1;
  }

  /* ── Section Heading ──────────────────────────────────────── */
  .section-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }
  .section-subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  /* ── Gold Underline Accent ────────────────────────────────── */
  .gold-underline {
    display: inline-block;
    position: relative;
  }
  .gold-underline::after {
    content: '';
    position: absolute;
    bottom: -3px; left: 0;
    width: 100%; height: 3px;
    background: var(--gold);
    border-radius: 2px;
  }

  /* ── Responsive Helpers ───────────────────────────────────── */
  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .card, .stat-card {
      padding: 16px;
      border-radius: var(--radius-md);
    }
    .modal-box {
      max-height: 95vh;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      align-self: flex-end;
      margin-top: auto;
    }
  }
  @media (min-width: 769px) {
    .hide-desktop { display: none !important; }
  }
`;
