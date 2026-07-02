// ============================================================
// MAIN APP ROUTER
// ============================================================

function App() {
  const { state, actions } = window.useApp();
  const { currentRole, currentUserId, students, advisors } = state;

  // Nav configs per role
  const navConfigs = {
    admin: [
      { key: 'curriculum', label: 'จัดการหลักสูตร', icon: '📚' },
      { key: 'users',      label: 'จัดการผู้ใช้',   icon: '👥' },
    ],
    student: [
      { key: 'quick-input', label: 'บันทึกรายวิชา',    icon: '📋' },
      { key: 'checklist',   label: 'ตรวจสอบหลักสูตร', icon: '✅' },
      { key: 'simulator',   label: 'จำลองเกรด/GPAX',  icon: '🧮' },
      { key: 'license',     label: 'ใบประกอบวิชาชีพ',  icon: '📜' },
    ],
    advisor: [
      { key: 'dashboard', label: 'Dashboard',          icon: '📊' },
      { key: 'tracking',  label: 'ติดตามรายบุคคล',    icon: '🔍' },
      { key: 'warning',   label: 'Early Warning',       icon: '🚨' },
      { key: 'export',    label: 'Export รายงาน',      icon: '📤' },
      { key: 'license',   label: 'ใบประกอบวิชาชีพ',   icon: '📜' },
    ],
  };

  const defaultPages = { admin: 'curriculum', student: 'quick-input', advisor: 'dashboard' };
  const [currentPage, setCurrentPage] = React.useState(null);

  // Reset page when role changes
  React.useEffect(() => {
    if (currentRole) setCurrentPage(defaultPages[currentRole]);
  }, [currentRole]);

  // Resolve display name
  const getUserName = () => {
    if (currentRole === 'admin') return 'ผู้บริหารหลักสูตร';
    if (currentRole === 'student') {
      const s = students.find(st => st.id === currentUserId);
      return s ? s.name : '';
    }
    if (currentRole === 'advisor') {
      const a = advisors.find(av => av.id === currentUserId);
      return a ? a.name : '';
    }
    return '';
  };

  // Render current page content
  const renderPage = () => {
    if (!currentRole || !currentPage) return null;

    if (currentRole === 'admin') {
      if (currentPage === 'curriculum') return React.createElement(window.AdminCurriculumView);
      if (currentPage === 'users')      return React.createElement(window.AdminUserView);
    }

    if (currentRole === 'student') {
      const s = students.find(st => st.id === currentUserId);
      if (currentPage === 'quick-input') return React.createElement(window.StudentQuickInputView);
      if (currentPage === 'checklist')   return React.createElement(window.StudentChecklistView);
      if (currentPage === 'simulator')   return React.createElement(window.StudentSimulatorView);
      if (currentPage === 'license')     return React.createElement(window.StudentLicenseView, { student: s, actions: actions });
    }

    if (currentRole === 'advisor') {
      if (currentPage === 'dashboard') return React.createElement(window.AdvisorDashboardView);
      if (currentPage === 'tracking')  return React.createElement(window.AdvisorTrackingView);
      if (currentPage === 'warning')   return React.createElement(window.AdvisorEarlyWarningView);
      if (currentPage === 'export')    return React.createElement(window.AdvisorExportView);
      if (currentPage === 'license')   return React.createElement(window.AdvisorLicenseView, { students: state.students, courses: state.courses, advisorId: currentUserId });
    }

    return null;
  };

  // Not logged in → show login screen
  if (!currentRole) {
    return React.createElement(window.LoginScreen);
  }

  return React.createElement(window.AppLayout, {
    role:        currentRole,
    userName:    getUserName(),
    navItems:    navConfigs[currentRole] || [],
    currentPage: currentPage,
    onNavigate:  setCurrentPage,
    onLogout:    actions.logout,
  }, renderPage());
}

// ---- Mount ----
const rootEl = document.getElementById('root');
const root   = ReactDOM.createRoot(rootEl);
root.render(
  React.createElement(window.AppProvider, null,
    React.createElement(App)
  )
);

console.log('✅ App mounted');
