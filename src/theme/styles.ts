// ── Global Dashboard Styles ────────────────────────────────────────────
// Injected via <style>{globalStyles}</style> in DashboardLayout.
// Built to work WITH Tailwind — avoids conflicts by:
//  1. NOT resetting html/body (Tailwind handles that via @layer base)
//  2. All classes prefixed with "d-" to avoid collisions with Tailwind
//  3. Colors reference your index.css HSL tokens (hsl(var(--x)))
//  4. Only defines what Tailwind can't do inline (animations, scrollbars)

export const globalStyles = `
  /* ── Dashboard CSS Variables ──────────────────────────────── */
  :root {
    --d-navy:       hsl(220, 70%, 14%);
    --d-navy-hover: hsl(220, 70%, 18%);
    --d-gold:       hsl(43, 90%, 50%);
    --d-gold-hover: hsl(43, 85%, 44%);
    --d-shadow-sm:  0 1px 3px rgba(11,31,58,0.07), 0 1px 2px rgba(11,31,58,0.04);
    --d-shadow-md:  0 4px 14px rgba(11,31,58,0.10), 0 2px 6px rgba(11,31,58,0.05);
    --d-shadow-lg:  0 12px 36px rgba(11,31,58,0.14), 0 4px 12px rgba(11,31,58,0.08);
    --d-ease:       cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── Custom Scrollbar (scoped to dashboard) ───────────────── */
  .dashboard-root ::-webkit-scrollbar { width: 5px; height: 5px; }
  .dashboard-root ::-webkit-scrollbar-track { background: transparent; }
  .dashboard-root ::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 100px;
  }
  .dashboard-root ::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--muted-foreground));
  }

  /* ── Keyframes ────────────────────────────────────────────── */
  @keyframes d-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes d-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes d-fadeDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes d-scaleIn {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes d-slideLeft {
    from { opacity: 0; transform: translateX(-18px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes d-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes d-shimmer {
    0%   { background-position: -500px 0; }
    100% { background-position:  500px 0; }
  }
  @keyframes d-badgePop {
    0%   { transform: scale(0); }
    70%  { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  @keyframes d-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }

  /* ── Animation Utilities ──────────────────────────────────── */
  .d-fade-in    { animation: d-fadeIn    220ms var(--d-ease) both; }
  .d-fade-up    { animation: d-fadeUp    260ms var(--d-ease) both; }
  .d-fade-down  { animation: d-fadeDown  220ms var(--d-ease) both; }
  .d-scale-in   { animation: d-scaleIn   220ms cubic-bezier(0.34,1.28,0.64,1) both; }
  .d-slide-left { animation: d-slideLeft 260ms var(--d-ease) both; }
  .d-pulse      { animation: d-pulse 1.8s ease-in-out infinite; }

  .d-stagger > *:nth-child(1) { animation-delay: 0ms;   }
  .d-stagger > *:nth-child(2) { animation-delay: 55ms;  }
  .d-stagger > *:nth-child(3) { animation-delay: 110ms; }
  .d-stagger > *:nth-child(4) { animation-delay: 165ms; }
  .d-stagger > *:nth-child(5) { animation-delay: 220ms; }
  .d-stagger > *:nth-child(6) { animation-delay: 275ms; }

  /* ══════════════════════════════════════════════════════════
     LAYOUT
  ══════════════════════════════════════════════════════════ */

  /* ── Sidebar ──────────────────────────────────────────────── */
  .d-sidebar {
    background: var(--d-navy) !important;
    color: hsl(220, 20%, 92%);
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: sticky;
    top: 0;
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;
    transition: width 220ms var(--d-ease);
    border-right: 1px solid rgba(255,255,255,0.06);
    scrollbar-width: none;
  }
  .d-sidebar::-webkit-scrollbar { display: none; }

  .d-sidebar-logo {
    padding: 20px 16px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .d-sidebar-logo-mark {
    width: 36px; height: 36px;
    background: var(--d-gold);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 15px;
    color: var(--d-navy);
    flex-shrink: 0;
  }
  .d-sidebar-logo-text {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
  }
  .d-sidebar-nav {
    padding: 12px 10px;
    flex: 1;
  }
  .d-sidebar-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    padding: 10px 8px 4px;
  }
  .d-sidebar-footer {
    padding: 10px;
    border-top: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
  }

  /* ── Nav Item ─────────────────────────────────────────────── */
  .d-nav-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
    border-radius: 9px;
    cursor: pointer;
    color: rgba(255,255,255,0.58);
    font-size: 13.5px;
    font-weight: 500;
    transition:
      background  150ms var(--d-ease),
      color       150ms var(--d-ease),
      padding-left 150ms var(--d-ease);
    user-select: none;
    white-space: nowrap;
    overflow: hidden;
    margin-bottom: 2px;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
  }
  .d-nav-item:hover {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.92);
    padding-left: 16px;
  }
  .d-nav-item.active {
    background: var(--d-gold) !important;
    color: var(--d-navy) !important;
    font-weight: 700;
    box-shadow: 0 3px 12px rgba(234,179,8,0.28);
    padding-left: 12px;
  }
  .d-nav-item.active:hover {
    background: var(--d-gold-hover) !important;
    padding-left: 12px;
  }
  .d-nav-item svg { flex-shrink: 0; }

  /* Sidebar user row */
  .d-sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 9px;
    cursor: pointer;
    transition: background 140ms;
  }
  .d-sidebar-user:hover { background: rgba(255,255,255,0.07); }
  .d-sidebar-user-name {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .d-sidebar-user-role {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    white-space: nowrap;
  }

  /* ── TopBar ───────────────────────────────────────────────── */
  .d-topbar {
    position: sticky;
    top: 0;
    z-index: 50;
    height: 60px;
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid hsl(var(--border));
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 22px;
    flex-shrink: 0;
  }
  .dark .d-topbar {
    background: hsla(220, 50%, 9%, 0.88);
  }
  .d-topbar-title {
    font-size: 17px;
    font-weight: 700;
    color: hsl(var(--foreground));
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .d-topbar-btn {
    width: 36px; height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    transition: background 130ms, color 130ms;
    flex-shrink: 0;
    border: none;
    background: none;
  }
  .d-topbar-btn:hover {
    background: hsl(var(--muted));
    color: hsl(var(--foreground));
  }

  /* Alert chips inside topbar */
  .d-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid transparent;
    cursor: pointer;
    transition: filter 130ms, transform 120ms;
    white-space: nowrap;
    font-family: inherit;
  }
  .d-chip:hover  { filter: brightness(0.93); }
  .d-chip:active { transform: scale(0.97); }

  /* ── Mobile Header ────────────────────────────────────────── */
  .d-mobile-header {
    background: var(--d-navy);
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
    flex-shrink: 0;
  }
  .d-mobile-header-subtitle {
    font-size: 11px;
    color: rgba(255,255,255,0.48);
    font-weight: 500;
  }
  .d-mobile-header-title {
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.025em;
  }
  .d-mobile-header-btn {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    border: none;
    transition: background 130ms;
    flex-shrink: 0;
  }
  .d-mobile-header-btn:hover { background: rgba(255,255,255,0.18); }
  .d-mobile-menu {
    background: var(--d-navy);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 6px 12px 14px;
    animation: d-fadeDown 200ms var(--d-ease) both;
  }

  /* ── Mobile Bottom Nav ────────────────────────────────────── */
  .d-bottom-nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 62px;
    background: hsl(var(--card));
    border-top: 1px solid hsl(var(--border));
    display: flex;
    z-index: 200;
    box-shadow: 0 -3px 14px rgba(11,31,58,0.07);
  }
  .d-bottom-nav-item {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    transition: color 130ms, background 130ms;
    border: none;
    background: none;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }
  .d-bottom-nav-item.active { color: var(--d-navy); }
  .d-bottom-nav-item.active svg { color: var(--d-gold); }
  .d-bottom-nav-item:active { background: hsl(var(--muted)); }
  .d-bottom-nav-item.active::before {
    content: '';
    position: absolute;
    top: 0;
    width: 26px; height: 2px;
    background: var(--d-gold);
    border-radius: 0 0 3px 3px;
  }

  /* ══════════════════════════════════════════════════════════
     COMPONENTS
  ══════════════════════════════════════════════════════════ */

  /* ── Card ─────────────────────────────────────────────────── */
  .d-card {
    background: hsl(var(--card));
    border-radius: var(--radius, 0.75rem);
    border: 1px solid hsl(var(--border));
    box-shadow: var(--d-shadow-sm);
    padding: 22px 24px;
    animation: d-fadeUp 260ms var(--d-ease) both;
  }
  .d-card-hover {
    transition: box-shadow 160ms var(--d-ease), transform 160ms var(--d-ease);
  }
  .d-card-hover:hover {
    box-shadow: var(--d-shadow-md);
    transform: translateY(-2px);
  }

  /* ── Stat Card ────────────────────────────────────────────── */
  .d-stat {
    position: relative;
    overflow: hidden;
    background: hsl(var(--card));
    border-radius: var(--radius, 0.75rem);
    border: 1px solid hsl(var(--border));
    box-shadow: var(--d-shadow-sm);
    padding: 20px 22px;
    transition: box-shadow 160ms var(--d-ease), transform 160ms var(--d-ease);
    animation: d-fadeUp 260ms var(--d-ease) both;
  }
  .d-stat::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    background: var(--d-gold);
  }
  .d-stat:hover {
    box-shadow: var(--d-shadow-md);
    transform: translateY(-2px);
  }
  .d-stat-value {
    font-size: 28px;
    font-weight: 800;
    color: hsl(var(--foreground));
    line-height: 1;
    letter-spacing: -0.03em;
  }
  .d-stat-label {
    font-size: 12.5px;
    color: hsl(var(--muted-foreground));
    font-weight: 500;
    margin-top: 5px;
  }
  .d-stat-icon {
    width: 42px; height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .d-stat-icon-gold  { background: hsl(43, 90%, 92%); color: hsl(43, 90%, 32%); }
  .d-stat-icon-navy  { background: hsl(220, 60%, 92%); color: var(--d-navy); }
  .d-stat-icon-green { background: hsl(143, 60%, 92%); color: hsl(143, 60%, 28%); }
  .d-stat-icon-red   { background: hsl(0, 75%, 94%);   color: hsl(0, 75%, 40%); }

  /* ── Buttons ──────────────────────────────────────────────── */
  .d-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: 9px;
    font-weight: 600;
    font-size: 13.5px;
    cursor: pointer;
    border: none;
    transition:
      background  140ms var(--d-ease),
      box-shadow  140ms var(--d-ease),
      transform   110ms var(--d-ease);
    white-space: nowrap;
    font-family: inherit;
    text-decoration: none;
    line-height: 1;
  }
  .d-btn:active  { transform: scale(0.97); }
  .d-btn:disabled {
    opacity: 0.48;
    cursor: not-allowed;
    pointer-events: none;
  }

  .d-btn-primary {
    background: var(--d-navy);
    color: #fff;
    box-shadow: 0 2px 8px rgba(11,31,58,0.22);
  }
  .d-btn-primary:hover {
    background: var(--d-navy-hover);
    box-shadow: 0 4px 16px rgba(11,31,58,0.30);
  }

  .d-btn-gold {
    background: var(--d-gold);
    color: var(--d-navy);
    box-shadow: 0 2px 8px rgba(234,179,8,0.28);
  }
  .d-btn-gold:hover {
    background: var(--d-gold-hover);
    box-shadow: 0 4px 16px rgba(234,179,8,0.38);
  }

  .d-btn-outline {
    background: transparent;
    color: hsl(var(--foreground));
    border: 1.5px solid hsl(var(--border));
  }
  .d-btn-outline:hover { background: hsl(var(--muted)); }

  .d-btn-ghost {
    background: transparent;
    color: hsl(var(--muted-foreground));
  }
  .d-btn-ghost:hover {
    background: hsl(var(--muted));
    color: hsl(var(--foreground));
  }

  .d-btn-danger {
    background: hsl(0, 75%, 95%);
    color: hsl(0, 75%, 35%);
    border: 1px solid hsl(0, 75%, 85%);
  }
  .d-btn-danger:hover { background: hsl(0, 75%, 90%); }

  .d-btn-sm { padding: 6px 13px;  font-size: 12.5px; border-radius: 7px; }
  .d-btn-lg { padding: 12px 26px; font-size: 15px;   border-radius: 11px; }

  /* ── Form ─────────────────────────────────────────────────── */
  .d-input, .d-select, .d-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid hsl(var(--border));
    border-radius: 9px;
    background: hsl(var(--card));
    color: hsl(var(--foreground));
    font-size: 14px;
    font-family: inherit;
    transition: border-color 150ms, box-shadow 150ms;
    outline: none;
    appearance: none;
    display: block;
  }
  .d-input:focus, .d-select:focus, .d-textarea:focus {
    border-color: var(--d-navy);
    box-shadow: 0 0 0 3px rgba(11,31,58,0.09);
  }
  .d-input::placeholder, .d-textarea::placeholder {
    color: hsl(var(--muted-foreground));
    opacity: 0.7;
  }
  .d-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: hsl(var(--muted-foreground));
    margin-bottom: 6px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .d-field {
    display: flex;
    flex-direction: column;
    margin-bottom: 18px;
  }
  .d-hint  { font-size: 12px; color: hsl(var(--muted-foreground)); margin-top: 5px; }
  .d-error { font-size: 12px; color: hsl(var(--destructive));      margin-top: 5px; }

  /* ── Badge ────────────────────────────────────────────────── */
  .d-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 11.5px;
    font-weight: 600;
    border: 1px solid transparent;
    white-space: nowrap;
    line-height: 1.4;
  }
  .d-badge-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
  .d-badge-notify { animation: d-badgePop 280ms cubic-bezier(0.34,1.56,0.64,1) both; }

  /* Status colours match your STATUS tokens in index.ts */
  .d-badge-approved, .d-badge-live {
    background: #d1fae5; color: #065f46; border-color: #a7f3d0;
  }
  .d-badge-pending, .d-badge-draft {
    background: #fef3c7; color: #92400e; border-color: #fde68a;
  }
  .d-badge-rejected {
    background: #fee2e2; color: #991b1b; border-color: #fca5a5;
  }
  .d-badge-gold {
    background: hsl(43, 90%, 92%); color: hsl(43, 90%, 28%); border-color: hsl(43, 90%, 80%);
  }
  .d-badge-navy {
    background: hsl(220, 60%, 92%); color: var(--d-navy); border-color: hsl(220, 60%, 80%);
  }

  /* ── Table ────────────────────────────────────────────────── */
  .d-table-wrap {
    overflow-x: auto;
    border-radius: var(--radius, 0.75rem);
    border: 1px solid hsl(var(--border));
    box-shadow: var(--d-shadow-sm);
    background: hsl(var(--card));
  }
  .d-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }
  .d-table th {
    background: hsl(var(--muted));
    padding: 11px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: hsl(var(--muted-foreground));
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-bottom: 1px solid hsl(var(--border));
    white-space: nowrap;
  }
  .d-table td {
    padding: 13px 16px;
    border-bottom: 1px solid hsl(var(--border));
    color: hsl(var(--foreground));
    vertical-align: middle;
  }
  .d-table tbody tr:last-child td { border-bottom: none; }
  .d-table tbody tr { transition: background 120ms; }
  .d-table tbody tr:hover { background: hsl(var(--muted) / 0.5); }

  /* ── Skeleton Loader ──────────────────────────────────────── */
  .d-skeleton {
    background: linear-gradient(
      90deg,
      hsl(var(--muted))  25%,
      hsl(var(--border)) 50%,
      hsl(var(--muted))  75%
    );
    background-size: 500px 100%;
    animation: d-shimmer 1.5s ease-in-out infinite;
    border-radius: 6px;
  }

  /* ── Spinner ──────────────────────────────────────────────── */
  .d-spinner {
    display: inline-block;
    width: 18px; height: 18px;
    border: 2px solid hsl(var(--border));
    border-top-color: var(--d-navy);
    border-radius: 50%;
    animation: d-spin 0.65s linear infinite;
    flex-shrink: 0;
  }
  .d-spinner-gold  { border-top-color: var(--d-gold) !important; }
  .d-spinner-white { border-color: rgba(255,255,255,0.25) !important; border-top-color: #fff !important; }
  .d-spinner-sm    { width: 14px; height: 14px; }
  .d-spinner-lg    { width: 28px; height: 28px; border-width: 3px; }

  /* ── Alert Banner ─────────────────────────────────────────── */
  .d-alert {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding: 13px 16px;
    border-radius: 10px;
    border-left: 4px solid transparent;
    font-size: 13.5px;
    animation: d-fadeDown 200ms var(--d-ease) both;
  }
  .d-alert-info    { background: hsl(213, 94%, 95%); border-color: hsl(213, 94%, 55%); color: hsl(213, 94%, 28%); }
  .d-alert-success { background: hsl(143, 72%, 94%); border-color: hsl(143, 72%, 38%); color: hsl(143, 72%, 24%); }
  .d-alert-warning { background: hsl(43,  90%, 93%); border-color: var(--d-gold);       color: hsl(43,  90%, 28%); }
  .d-alert-error   { background: hsl(0,   75%, 95%); border-color: hsl(0,   75%, 50%); color: hsl(0,   75%, 30%); }

  /* ── Modal ────────────────────────────────────────────────── */
  .d-overlay {
    position: fixed;
    inset: 0;
    background: rgba(11,31,58,0.52);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: d-fadeIn 180ms ease both;
  }
  .d-modal {
    background: hsl(var(--card));
    border-radius: calc(var(--radius, 0.75rem) + 2px);
    box-shadow: var(--d-shadow-lg);
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    animation: d-scaleIn 200ms cubic-bezier(0.34,1.3,0.64,1) both;
    border: 1px solid hsl(var(--border));
  }
  .d-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid hsl(var(--border));
  }
  .d-modal-title  { font-size: 16px; font-weight: 700; color: hsl(var(--foreground)); }
  .d-modal-body   { padding: 20px 24px; }
  .d-modal-footer {
    padding: 16px 24px 20px;
    border-top: 1px solid hsl(var(--border));
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  /* ── Section Header ───────────────────────────────────────── */
  .d-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .d-section-title {
    font-size: 17px;
    font-weight: 700;
    color: hsl(var(--foreground));
    letter-spacing: -0.02em;
  }
  .d-section-sub {
    font-size: 13px;
    color: hsl(var(--muted-foreground));
    margin-top: 2px;
  }

  /* ── Gold underline accent ────────────────────────────────── */
  .d-gold-line {
    display: inline-block;
    position: relative;
  }
  .d-gold-line::after {
    content: '';
    position: absolute;
    bottom: -4px; left: 0;
    width: 100%; height: 3px;
    background: var(--d-gold);
    border-radius: 2px;
  }

  /* ── Progress ─────────────────────────────────────────────── */
  .d-progress-track {
    height: 6px;
    background: hsl(var(--muted));
    border-radius: 100px;
    overflow: hidden;
    flex: 1;
  }
  .d-progress-fill {
    height: 100%;
    border-radius: 100px;
    background: var(--d-gold);
    transition: width 600ms var(--d-ease);
  }
  .d-progress-navy  { background: var(--d-navy) !important; }
  .d-progress-green { background: hsl(143, 72%, 38%) !important; }

  /* ── Avatar ───────────────────────────────────────────────── */
  .d-avatar {
    border-radius: 50%;
    object-fit: cover;
    background: var(--d-navy);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    letter-spacing: -0.02em;
    flex-shrink: 0;
    font-size: 13px;
  }
  .d-avatar-sm { width: 28px; height: 28px; font-size: 11px; }
  .d-avatar-md { width: 36px; height: 36px; font-size: 13px; }
  .d-avatar-lg { width: 48px; height: 48px; font-size: 17px; }

  /* ── Empty State ──────────────────────────────────────────── */
  .d-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 52px 24px;
    text-align: center;
    color: hsl(var(--muted-foreground));
    gap: 10px;
  }
  .d-empty-icon {
    width: 60px; height: 60px;
    background: hsl(var(--muted));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }
  .d-empty-title {
    font-size: 15px;
    font-weight: 700;
    color: hsl(var(--foreground));
  }
  .d-empty-desc {
    font-size: 13px;
    max-width: 280px;
    line-height: 1.5;
  }

  /* ── Divider ──────────────────────────────────────────────── */
  .d-divider { height: 1px; background: hsl(var(--border)); margin: 16px 0; }

  /* ── Tooltip (CSS-only via data-d-tip="...") ──────────────── */
  [data-d-tip] { position: relative; }
  [data-d-tip]::after {
    content: attr(data-d-tip);
    position: absolute;
    bottom: calc(100% + 7px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--d-navy);
    color: #fff;
    font-size: 11.5px;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 130ms;
    z-index: 999;
  }
  [data-d-tip]:hover::after { opacity: 1; }

  /* ── Responsive ───────────────────────────────────────────── */
  @media (max-width: 768px) {
    .d-hide-mobile { display: none !important; }
    .d-card, .d-stat { padding: 16px; }
    .d-modal {
      max-height: 96vh;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      align-self: flex-end;
      margin-top: auto;
    }
  }
  @media (min-width: 769px) {
    .d-hide-desktop { display: none !important; }
  }
`;
