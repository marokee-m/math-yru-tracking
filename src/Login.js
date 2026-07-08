// ============================================================
// LOGIN SCREEN + SHARED UI COMPONENTS
// ============================================================

// ---- MATH-YRU Logo (defined first — used in loading screen) ----
window.MathYruLogo = function({ size }) {
  var sz = size || 56;
  return React.createElement('div', {
    style: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: sz, height: sz, borderRadius: sz * 0.22,
      background: 'linear-gradient(135deg, #db2777, #9333ea)',
      boxShadow: '0 4px 18px rgba(219,39,119,0.35)',
      flexShrink: 0
    }
  },
    React.createElement('div', { style: { textAlign: 'center', lineHeight: 1.05 } },
      React.createElement('div', { style: { fontSize: sz * 0.32, fontWeight: 900, color: '#fff', letterSpacing: '0.04em', fontFamily: 'Sarabun, sans-serif' } }, 'MATH'),
      React.createElement('div', { style: { fontSize: sz * 0.22, fontWeight: 700, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.08em' } }, 'YRU')
    )
  );
};

// ---- Shared Utility Functions ----
window.Utils = {
  // Calculate GPAX from enrollments
  calcGPAX: function(enrollments, courses) {
    const gradePoints = window.AppData.GRADE_POINTS;
    let totalPoints = 0, totalCredits = 0;
    const seen = {};
    // Use latest enrollment for each course (retaken courses)
    const latest = {};
    enrollments.forEach(e => {
      const key = e.courseCode;
      if (!latest[key] || (e.year > latest[key].year) || (e.year === latest[key].year && e.semester > latest[key].semester)) {
        latest[key] = e;
      }
    });
    Object.values(latest).forEach(e => {
      const gp = gradePoints[e.grade];
      if (gp === null || gp === undefined) return;
      const course = courses.find(c => c.code === e.courseCode);
      if (!course) return;
      totalPoints += gp * course.credits;
      totalCredits += course.credits;
    });
    if (totalCredits === 0) return 0;
    return (totalPoints / totalCredits).toFixed(2);
  },

  // Get grade status
  getGradeStatus: function(grade) {
    if (!grade || grade === 'ยังไม่ได้เรียน') return 'not-taken';
    if (grade === 'กำลังเรียน') return 'studying';
    if (grade === 'W') return 'withdraw';
    if (grade === 'E' || grade === 'F') return 'fail';
    return 'pass';
  },

  // Get latest enrollment for a course code
  getLatestEnrollment: function(enrollments, courseCode) {
    const courseEnrollments = enrollments.filter(e => e.courseCode === courseCode);
    if (courseEnrollments.length === 0) return null;
    return courseEnrollments.sort((a, b) => (b.year * 10 + b.semester) - (a.year * 10 + a.semester))[0];
  },

  // Compute curriculum status for a student
  computeCurriculumStatus: function(student, courses) {
    const categories = window.AppData.CURRICULUM_META.categories;
    const result = {};
    categories.forEach(cat => {
      const catCourses = courses.filter(c => c.category === cat.id);
      let earnedCredits = 0;
      let studyingCredits = 0;
      let failedCourses = [];
      let passCourses = [];
      let studyingCoursesList = [];
      let notTakenCourses = [];

      catCourses.forEach(course => {
        const enr = Utils.getLatestEnrollment(student.enrollments, course.code);
        if (!enr) {
          notTakenCourses.push(course);
          return;
        }
        const status = Utils.getGradeStatus(enr.grade);
        if (status === 'pass') {
          earnedCredits += course.credits;
          passCourses.push({ course, enrollment: enr });
        } else if (status === 'studying') {
          studyingCredits += course.credits;
          studyingCoursesList.push({ course, enrollment: enr });
        } else if (status === 'fail') {
          failedCourses.push({ course, enrollment: enr });
        } else if (status === 'not-taken') {
          notTakenCourses.push(course);
        }
      });

      result[cat.id] = {
        category: cat,
        earnedCredits,
        studyingCredits,
        required: cat.requiredCredits,
        completed: earnedCredits >= cat.requiredCredits,
        passCourses,
        studyingCoursesList,
        failedCourses,
        notTakenCourses
      };
    });
    return result;
  },

  // Total earned credits for student
  totalEarnedCredits: function(student, courses) {
    let total = 0;
    const latest = {};
    student.enrollments.forEach(e => {
      const key = e.courseCode;
      if (!latest[key] || (e.year * 10 + e.semester) > (latest[key].year * 10 + latest[key].semester)) {
        latest[key] = e;
      }
    });
    Object.values(latest).forEach(e => {
      const status = Utils.getGradeStatus(e.grade);
      if (status === 'pass') {
        const course = courses.find(c => c.code === e.courseCode);
        if (course) total += course.credits;
      }
    });
    return total;
  },

  // Count at-risk indicators
  getAtRiskIndicators: function(student, courses) {
    let failCount = 0;
    let pendingRetake = [];
    const latest = {};
    student.enrollments.forEach(e => {
      const key = e.courseCode;
      if (!latest[key] || (e.year * 10 + e.semester) > (latest[key].year * 10 + latest[key].semester)) {
        latest[key] = e;
      }
    });
    Object.values(latest).forEach(e => {
      if (e.grade === 'E' || e.grade === 'F') {
        failCount++;
        const course = courses.find(c => c.code === e.courseCode);
        if (course) pendingRetake.push(course.name);
      }
    });
    return { failCount, pendingRetake };
  },

  // Parse Quick Registration text (Thai university format)
  parseRegistrationText: function(text) {
    const lines = text.trim().split('\n');
    const results = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      // Pattern: "4204105-1   ชื่อวิชา   Credit   2   01"
      // Split by multiple spaces or tabs
      const parts = trimmed.split(/\s{2,}|\t/).map(p => p.trim()).filter(p => p);
      if (parts.length >= 4) {
        let code = parts[0];
        // Remove section suffix like -1, -2
        code = code.replace(/-\d+$/, '');
        const name = parts[1];
        const type = parts[2] || 'Credit';
        const credits = parseInt(parts[3]) || 3;
        const sec = parts[4] || '01';
        results.push({ code, name, type, credits, sec });
      }
    });
    return results;
  },

  // Format grade with color class
  gradeColorClass: function(grade) {
    const map = {
      'A': 'grade-A', 'B+': 'grade-Bplus', 'B': 'grade-B',
      'C+': 'grade-Cplus', 'C': 'grade-C', 'D+': 'grade-Dplus',
      'D': 'grade-D', 'F': 'grade-F', 'E': 'grade-E',
      'W': 'grade-W', 'กำลังเรียน': 'grade-studying'
    };
    return map[grade] || 'grade-W';
  },

  // Check teaching practice (ฝึกสอน) eligibility
  // Rule: E/F courses with total credits >= 9 → ineligible
  checkTeachingPractice: function(student, courses) {
    var latest = {};
    (student.enrollments || []).forEach(function(e) {
      var key = e.courseCode;
      if (!latest[key] || (e.year * 10 + e.semester) > (latest[key].year * 10 + latest[key].semester)) {
        latest[key] = e;
      }
    });
    var efCourses = [];
    var efCredits = 0;
    Object.values(latest).forEach(function(e) {
      if (e.grade === 'E' || e.grade === 'F') {
        var course = courses.find(function(c) { return c.code === e.courseCode; });
        var cr = course ? course.credits : 0;
        efCredits += cr;
        efCourses.push({ code: e.courseCode, name: course ? course.name : e.courseCode, credits: cr, grade: e.grade });
      }
    });
    var trend = efCredits === 0 ? 'safe' : efCredits <= 5 ? 'safe' : efCredits <= 9 ? 'at-risk' : 'ineligible';
    return {
      eligible: efCredits <= 9,
      efCredits: efCredits,
      efCourses: efCourses,
      trend: trend
    };
  }
};

// ---- App Context ----
const AppContext = React.createContext(null);

window.AppProvider = function({ children }) {
  const [state, setState] = React.useState(function() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('mathyru_session') || '{}'); } catch(e) {}
    return {
      loading: true,
      dbError: null,
      currentRole: saved.currentRole || null,
      currentUserId: saved.currentUserId || null,
      students: [],
      advisors: [],
      courses: [],
      equipment: [],
      borrowRequests: [],
      curriculumMeta: window.AppData.CURRICULUM_META,
      curricula: [],
    };
  });

  // db ref (set once on init)
  var sbRef = React.useRef(null);

  // ── Reload helpers ──────────────────────────────────────────
  var reloadStudents = React.useCallback(async function() {
    if (!sbRef.current) return;
    var res = await sbRef.current.from('students').select('*');
    if (res.data) setState(function(s) { return Object.assign({}, s, { students: res.data }); });
  }, []);

  var reloadAdvisors = React.useCallback(async function() {
    if (!sbRef.current) return;
    var res = await sbRef.current.from('advisors').select('*');
    if (res.data) setState(function(s) { return Object.assign({}, s, { advisors: res.data }); });
  }, []);

  var reloadCourses = React.useCallback(async function() {
    if (!sbRef.current) return;
    var res = await sbRef.current.from('courses').select('*');
    if (res.data) setState(function(s) { return Object.assign({}, s, { courses: res.data }); });
  }, []);

  var reloadSettings = React.useCallback(async function() {
    if (!sbRef.current) return;
    var [currRes, curriculaRes] = await Promise.all([
      sbRef.current.from('settings').select('*').eq('id', 'curriculum').single(),
      sbRef.current.from('settings').select('*').eq('id', 'curricula_list').single(),
    ]);
    setState(function(s) {
      var next = Object.assign({}, s);
      if (currRes.data) next.curriculumMeta = currRes.data.data || s.curriculumMeta;
      if (curriculaRes.data && curriculaRes.data.data) next.curricula = curriculaRes.data.data;
      return next;
    });
  }, []);

  var reloadEquipment = React.useCallback(async function() {
    if (!sbRef.current) return;
    var res = await sbRef.current.from('equipment').select('*');
    if (res.data) setState(function(s) { return Object.assign({}, s, { equipment: res.data }); });
  }, []);

  var reloadBorrows = React.useCallback(async function() {
    if (!sbRef.current) return;
    var res = await sbRef.current.from('borrow_requests').select('*').order('createdAt', { ascending: false });
    if (res.data) setState(function(s) { return Object.assign({}, s, { borrowRequests: res.data }); });
  }, []);

  React.useEffect(function() {
    var sb;
    try {
      sb = window.initSupabase();
      sbRef.current = sb;
    } catch(err) {
      setState(function(s) { return Object.assign({}, s, { loading: false, dbError: 'Supabase config ไม่ถูกต้อง: ' + err.message }); });
      return;
    }

    window.seedSupabaseIfEmpty(sb).then(async function() {
      await Promise.all([
        reloadStudents(), reloadAdvisors(), reloadCourses(),
        reloadSettings(), reloadEquipment(), reloadBorrows(),
      ]);
      setState(function(s) { return Object.assign({}, s, { loading: false }); });
    }).catch(function(err) {
      setState(function(s) { return Object.assign({}, s, { loading: false, dbError: 'Supabase error: ' + err.message }); });
    });

    // Realtime (ต้องเปิด Replication ใน Supabase Dashboard ก่อน)
    var channel = sb.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, reloadStudents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'advisors' }, reloadAdvisors)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, reloadCourses)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, reloadSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, reloadEquipment)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'borrow_requests' }, reloadBorrows)
      .subscribe();

    return function() { sb.removeChannel(channel); };
  }, []);

  // Optimistic update: อัปเดต local state ทันที แล้ว write Supabase background
  function updateStudentDoc(id, updater) {
    setState(function(s) {
      var st = s.students.find(function(x) { return x.id === id; });
      if (!st) return s;
      var updated = updater(st);
      // NOTE: ต้องเรียก .then() เพื่อให้ supabase-js v2 ส่ง request จริง (query เป็น lazy thenable)
      if (sbRef.current) {
        sbRef.current.from('students').update(updated).eq('id', id).then(function(res) {
          if (res && res.error) console.error('❌ บันทึกข้อมูลนักศึกษาไม่สำเร็จ:', res.error.message);
        });
      }
      return Object.assign({}, s, { students: s.students.map(function(x) { return x.id === id ? updated : x; }) });
    });
  }

  const actions = {
    login: function(role, userId) {
      try { localStorage.setItem('mathyru_session', JSON.stringify({ currentRole: role, currentUserId: userId })); } catch(e) {}
      setState(function(s) { return Object.assign({}, s, { currentRole: role, currentUserId: userId }); });
    },
    logout: function() {
      try { localStorage.removeItem('mathyru_session'); } catch(e) {}
      setState(function(s) { return Object.assign({}, s, { currentRole: null, currentUserId: null }); });
    },

    // Enrollments (optimistic)
    addEnrollment: function(studentId, enrollment) {
      updateStudentDoc(studentId, function(st) {
        return Object.assign({}, st, { enrollments: st.enrollments.concat([enrollment]) });
      });
    },
    updateEnrollmentGrade: function(studentId, courseCode, enrollYear, enrollSemester, newGrade) {
      updateStudentDoc(studentId, function(st) {
        return Object.assign({}, st, { enrollments: st.enrollments.map(function(e) {
          return (e.courseCode === courseCode && e.year === enrollYear && e.semester === enrollSemester)
            ? Object.assign({}, e, { grade: newGrade }) : e;
        })});
      });
    },
    removeEnrollment: function(studentId, courseCode, year, semester) {
      updateStudentDoc(studentId, function(st) {
        return Object.assign({}, st, { enrollments: st.enrollments.filter(function(e) {
          return !(e.courseCode === courseCode && e.year === year && e.semester === semester);
        })});
      });
    },
    addAdvisorNote: function(studentId, note) {
      updateStudentDoc(studentId, function(st) {
        var notes = (st.advisorNotes || []).concat([Object.assign({}, note, { date: new Date().toLocaleDateString('th-TH') })]);
        return Object.assign({}, st, { advisorNotes: notes });
      });
    },

    // Courses
    addCourse: function(course) {
      if (sbRef.current) sbRef.current.from('courses').insert(course).then(reloadCourses);
    },
    updateCourse: function(code, updates) {
      if (sbRef.current) sbRef.current.from('courses').update(updates).eq('code', code).then(reloadCourses);
    },
    deleteCourse: function(code) {
      if (sbRef.current) sbRef.current.from('courses').delete().eq('code', code).then(reloadCourses);
    },
    addCourses: function(arr) {
      if (sbRef.current) sbRef.current.from('courses').insert(arr).then(reloadCourses);
    },

    // Students
    addStudent: function(student) {
      if (sbRef.current) sbRef.current.from('students').insert(student).then(reloadStudents);
    },
    addStudents: function(arr) {
      if (sbRef.current) sbRef.current.from('students').insert(arr).then(reloadStudents);
    },
    updateStudent: function(studentId, data) {
      setState(function(s) {
        return Object.assign({}, s, { students: s.students.map(function(st) {
          return st.id === studentId ? Object.assign({}, st, data) : st;
        })});
      });
      // เรียก .then() ภายในเพื่อให้ request ยิงจริงแม้ผู้เรียกจะไม่ await (supabase-js v2 เป็น lazy thenable)
      if (sbRef.current) {
        return sbRef.current.from('students').update(data).eq('id', studentId).then(function(res) {
          if (res && res.error) console.error('❌ บันทึกข้อมูลนักศึกษาไม่สำเร็จ:', res.error.message);
          return res;
        });
      }
      return Promise.resolve();
    },
    deleteStudent: function(id) {
      if (sbRef.current) sbRef.current.from('students').delete().eq('id', id).then(reloadStudents);
    },

    getSupabase: function() { return sbRef.current; },

    updateCurriculumMeta: function(meta) {
      // ต้องเรียก .then() เพื่อให้ supabase-js v2 ส่ง request จริง (query เป็น lazy thenable)
      if (sbRef.current) {
        sbRef.current.from('settings').upsert({ id: 'curriculum', data: meta }).then(function(res) {
          if (res && res.error) console.error('❌ บันทึกหลักสูตรไม่สำเร็จ:', res.error.message);
        });
      }
      setState(function(s) { return Object.assign({}, s, { curriculumMeta: meta }); });
    },

    // Curricula management
    addCurriculum: function(curriculum) {
      setState(function(s) {
        var newList = (s.curricula || []).concat([curriculum]);
        if (sbRef.current) {
          sbRef.current.from('settings').upsert({ id: 'curricula_list', data: newList }).then(function(res) {
            if (res && res.error) console.error('❌ เพิ่มหลักสูตรไม่สำเร็จ:', res.error.message);
          });
        }
        return Object.assign({}, s, { curricula: newList });
      });
    },
    updateCurriculum: function(id, updates) {
      setState(function(s) {
        var newList = (s.curricula || []).map(function(c) { return c.id === id ? Object.assign({}, c, updates) : c; });
        if (sbRef.current) {
          sbRef.current.from('settings').upsert({ id: 'curricula_list', data: newList }).then(function(res) {
            if (res && res.error) console.error('❌ แก้ไขหลักสูตรไม่สำเร็จ:', res.error.message);
          });
        }
        return Object.assign({}, s, { curricula: newList });
      });
    },
    deleteCurriculum: function(id) {
      setState(function(s) {
        var newList = (s.curricula || []).filter(function(c) { return c.id !== id; });
        if (sbRef.current) {
          sbRef.current.from('settings').upsert({ id: 'curricula_list', data: newList }).then(function(res) {
            if (res && res.error) console.error('❌ ลบหลักสูตรไม่สำเร็จ:', res.error.message);
          });
        }
        return Object.assign({}, s, { curricula: newList });
      });
    },

    // Equipment
    addEquipment: function(data) {
      if (!sbRef.current) return Promise.resolve();
      var item = Object.assign({ id: crypto.randomUUID() }, data);
      return sbRef.current.from('equipment').insert(item).then(reloadEquipment);
    },
    updateEquipment: function(id, data) {
      if (!sbRef.current) return Promise.resolve();
      setState(function(s) {
        return Object.assign({}, s, { equipment: s.equipment.map(function(e) { return e.id === id ? Object.assign({}, e, data) : e; }) });
      });
      return sbRef.current.from('equipment').update(data).eq('id', id).then(function(res) {
        if (res && res.error) { console.error('❌ อัปเดตยอดคงเหลือ/อุปกรณ์ไม่สำเร็จ:', res.error.message); throw new Error(res.error.message); }
        return reloadEquipment();
      });
    },
    deleteEquipment: function(id) {
      if (sbRef.current) sbRef.current.from('equipment').delete().eq('id', id).then(reloadEquipment);
    },

    // Borrow Requests
    addBorrowRequest: function(data) {
      if (!sbRef.current) return Promise.resolve();
      var req = Object.assign({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'pending' }, data);
      // supabase-js v2 คืน { error } แทนการ reject — ต้องเช็ก error เอง ไม่งั้นจะขึ้น success ปลอมทั้งที่บันทึกไม่สำเร็จ
      return sbRef.current.from('borrow_requests').insert(req).then(function(res) {
        if (res && res.error) { console.error('❌ ส่งคำขอยืมไม่สำเร็จ:', res.error.message); throw new Error(res.error.message); }
        return reloadBorrows();
      });
    },
    updateBorrowRequest: function(id, data) {
      if (!sbRef.current) return Promise.resolve();
      setState(function(s) {
        return Object.assign({}, s, { borrowRequests: s.borrowRequests.map(function(r) { return r.id === id ? Object.assign({}, r, data) : r; }) });
      });
      return sbRef.current.from('borrow_requests').update(data).eq('id', id).then(function(res) {
        if (res && res.error) { console.error('❌ อัปเดตคำขอยืมไม่สำเร็จ:', res.error.message); throw new Error(res.error.message); }
        return reloadBorrows();
      });
    },
    deleteBorrowRequest: function(id) {
      if (!sbRef.current) return Promise.resolve();
      setState(function(s) {
        return Object.assign({}, s, { borrowRequests: s.borrowRequests.filter(function(r) { return r.id !== id; }) });
      });
      return sbRef.current.from('borrow_requests').delete().eq('id', id).then(function(res) {
        if (res && res.error) { console.error('❌ ลบคำขอยืมไม่สำเร็จ:', res.error.message); throw new Error(res.error.message); }
        return reloadBorrows();
      });
    },

    // Advisors
    addAdvisor: function(advisor) {
      if (sbRef.current) sbRef.current.from('advisors').insert(advisor).then(reloadAdvisors);
    },
    addAdvisors: function(arr) {
      if (sbRef.current) sbRef.current.from('advisors').insert(arr).then(reloadAdvisors);
    },
    updateAdvisor: function(id, updates) {
      setState(function(s) {
        return Object.assign({}, s, { advisors: s.advisors.map(function(a) { return a.id === id ? Object.assign({}, a, updates) : a; }) });
      });
      if (sbRef.current) return sbRef.current.from('advisors').update(updates).eq('id', id).then(reloadAdvisors);
      return Promise.resolve();
    },
    deleteAdvisor: function(id) {
      if (sbRef.current) sbRef.current.from('advisors').delete().eq('id', id).then(reloadAdvisors);
    },
  };

  // Loading screen
  if (state.loading) {
    return React.createElement('div', {
      style: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }
    },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'center' } },
        React.createElement(window.MathYruLogo, { size: 72 })
      ),
      React.createElement('div', { style: { fontSize: 18, color: '#6b7280', fontWeight: 600 } }, '⏳ กำลังเชื่อมต่อฐานข้อมูล...'),
      React.createElement('div', { style: { fontSize: 13, color: '#9ca3af' } }, 'Connecting to Supabase')
    );
  }

  // Error screen
  if (state.dbError) {
    return React.createElement('div', {
      style: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }
    },
      React.createElement('div', { style: { fontSize: 48 } }, '⚠️'),
      React.createElement('div', { style: { fontSize: 18, color: '#dc2626', fontWeight: 700 } }, 'เชื่อมต่อ Supabase ไม่ได้'),
      React.createElement('div', { style: { fontSize: 13, color: '#6b7280', background: 'rgba(255,255,255,0.8)', padding: '12px 20px', borderRadius: 10, maxWidth: 480, textAlign: 'center' } },
        state.dbError
      ),
      React.createElement('div', { style: { fontSize: 13, color: '#6b7280', textAlign: 'center' } },
        'กรุณาแก้ไขค่า Supabase Config ในไฟล์ ', React.createElement('code', null, 'src/supabase-config.js'),
        ' แล้ว refresh หน้าเว็บ'
      )
    );
  }

  return React.createElement(AppContext.Provider, { value: { state, actions } }, children);
};

window.useApp = function() { return React.useContext(AppContext); };

// ---- Shared UI Components ----

// GlassCard
window.GlassCard = function({ children, className = '', dark = false, style = {} }) {
  return React.createElement('div', {
    className: `${dark ? 'glass-card-dark' : 'glass-card'} p-5 ${className}`,
    style
  }, children);
};

// Icon (SVG icons inline)
window.Icon = function({ name, size = 20, className = '', color = 'currentColor' }) {
  const icons = {
    dashboard: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
    students: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z',
    curriculum: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    advisors: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
    checklist: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
    warning: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
    export: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    add: 'M12 5v14 M5 12h14',
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    trash: 'M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    close: 'M18 6L6 18 M6 6l12 12',
    menu: 'M3 12h18 M3 6h18 M3 18h18',
    logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
    book: 'M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
    chart: 'M18 20V10 M12 20V4 M6 20v-6',
    note: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    calculator: 'M4 7V4h16v3 M9 20H4v-3 M15 14l-5 6 M9 14l5 6 M4 10h16 M4 14h4',
    print: 'M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z',
    info: 'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 16v-4 M12 8h.01',
    check: 'M20 6L9 17l-5-5',
  };
  const d = icons[name] || icons.info;
  return React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth: 2,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    className
  },
    d.split(' M').map((part, i) =>
      React.createElement('path', { key: i, d: i === 0 ? part : 'M' + part })
    )
  );
};

// Grade Badge
window.GradeBadge = function({ grade }) {
  if (!grade) return null;
  const cls = Utils.gradeColorClass(grade);
  return React.createElement('span', {
    className: `badge ${cls}`,
    style: { fontSize: '13px', padding: '2px 10px', borderRadius: '8px', fontWeight: 700 }
  }, grade);
};

// Status Badge
window.StatusBadge = function({ status }) {
  const map = {
    'pass': { cls: 'badge-pass', label: 'ผ่าน' },
    'studying': { cls: 'badge-studying', label: 'กำลังเรียน' },
    'fail': { cls: 'badge-fail', label: 'ไม่ผ่าน' },
    'withdraw': { cls: 'badge-withdraw', label: 'ถอน' },
    'not-taken': { cls: 'badge-not-taken', label: 'ยังไม่เรียน' },
  };
  const info = map[status] || map['not-taken'];
  return React.createElement('span', { className: `badge ${info.cls}` }, info.label);
};

// Progress Ring (SVG donut)
window.ProgressRing = function({ value, max, color, size = 80, label, sublabel }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const colorMap = {
    blue: '#3b82f6', green: '#22c55e', purple: '#a855f7',
    indigo: '#6366f1', orange: '#f97316', pink: '#ec4899'
  };
  const c = colorMap[color] || color;
  return React.createElement('div', { style: { position: 'relative', width: size, height: size } },
    React.createElement('svg', { width: size, height: size, style: { transform: 'rotate(-90deg)' } },
      React.createElement('circle', { cx: size/2, cy: size/2, r, fill: 'none', stroke: 'rgba(255,255,255,0.3)', strokeWidth: 8 }),
      React.createElement('circle', {
        cx: size/2, cy: size/2, r, fill: 'none', stroke: c, strokeWidth: 8,
        strokeDasharray: circ, strokeDashoffset: offset,
        strokeLinecap: 'round', style: { transition: 'stroke-dashoffset 0.8s ease' }
      })
    ),
    React.createElement('div', {
      style: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', lineHeight: 1.2 }
    },
      React.createElement('div', { style: { fontSize: size > 70 ? 14 : 11, fontWeight: 700, color: c } }, label),
      sublabel && React.createElement('div', { style: { fontSize: 10, color: '#9ca3af' } }, sublabel)
    )
  );
};

// Modal
window.Modal = function({ open, onClose, title, children, width }) {
  width = width || '580px';
  React.useEffect(function() {
    if (open) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
    return function() { document.body.classList.remove('modal-open'); };
  }, [open]);

  if (!open) return null;

  // Portal → render ที่ document.body โดยตรง หลีกเลี่ยงปัญหา stacking context
  var content = React.createElement('div', {
    className: 'modal-overlay',
    onClick: function(e) { if (e.target === e.currentTarget) onClose(); }
  },
    React.createElement('div', {
      className: 'modal-box',
      style: { width: width, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }
    },
      // Header — fixed inside modal
      React.createElement('div', {
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 24px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }
      },
        React.createElement('h2', { style: { fontSize: 17, fontWeight: 700, color: '#1f2937' } }, title),
        React.createElement('button', {
          onClick: onClose,
          style: { background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', lineHeight: 1, flexShrink: 0 }
        },
          React.createElement(window.Icon, { name: 'close', size: 18, color: '#6b7280' })
        )
      ),
      // Body — scrollable
      React.createElement('div', {
        style: { overflowY: 'auto', padding: '20px 24px 24px', flex: 1 }
      }, children)
    )
  );

  return ReactDOM.createPortal(content, document.body);
};

// Confirm Dialog
window.ConfirmDialog = function({ open, message, onConfirm, onCancel }) {
  React.useEffect(function() {
    if (open) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
    return function() { document.body.classList.remove('modal-open'); };
  }, [open]);

  if (!open) return null;
  return ReactDOM.createPortal(
    React.createElement('div', { className: 'modal-overlay' },
      React.createElement('div', { className: 'modal-box', style: { padding: 32, maxWidth: 360, width: '90%', textAlign: 'center' } },
        React.createElement('div', { style: { fontSize: 44, marginBottom: 14 } }, '⚠️'),
        React.createElement('p', { style: { fontSize: 15, color: '#374151', marginBottom: 24, lineHeight: 1.6 } }, message),
        React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'center' } },
          React.createElement('button', { className: 'btn-secondary', onClick: onCancel }, 'ยกเลิก'),
          React.createElement('button', { className: 'btn-danger', onClick: onConfirm }, 'ยืนยัน')
        )
      )
    ),
    document.body
  );
};

// ---- LOGIN SCREEN ----
window.LoginScreen = function() {
  const { state, actions } = window.useApp();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [detectedRole, setDetectedRole] = React.useState(null); // show role hint while typing

  // Detect role from username as user types
  React.useEffect(function() {
    const u = username.trim();
    if (!u) { setDetectedRole(null); return; }
    if (u === 'admin') { setDetectedRole('admin'); return; }
    const isStudent = state.students.some(function(s) {
      return s.username === u || s.studentId === u;
    });
    if (isStudent) { setDetectedRole('student'); return; }
    const isAdvisor = state.advisors.some(function(a) { return a.username === u; });
    if (isAdvisor) { setDetectedRole('advisor'); return; }
    setDetectedRole(null);
  }, [username]);

  const roleInfo = {
    admin:   { label: 'ผู้บริหารหลักสูตร', icon: '🛡️', color: '#db2777' },
    student: { label: 'นักศึกษา',           icon: '🎓', color: '#1565c0' },
    advisor: { label: 'อาจารย์ที่ปรึกษา',  icon: '👨‍🏫', color: '#15803d' },
  };

  const handleLogin = function() {
    const u = username.trim();
    const p = password;
    if (!u || !p) { setError('กรุณากรอก Username และ Password'); return; }
    setError('');
    setLoading(true);

    // Simulate brief delay for UX
    setTimeout(function() {
      setLoading(false);
      // Check admin
      if (u === 'admin' && p === 'admin') {
        actions.login('admin', 'admin'); return;
      }
      // Check student
      const student = state.students.find(function(s) {
        return (s.username === u || s.studentId === u) && s.password === p;
      });
      if (student) { actions.login('student', student.id); return; }
      // Check advisor
      const advisor = state.advisors.find(function(a) {
        return a.username === u && a.password === p;
      });
      if (advisor) { actions.login('advisor', advisor.id); return; }
      // Not found
      setError('Username หรือ Password ไม่ถูกต้อง');
    }, 350);
  };

  const handleKeyDown = function(e) { if (e.key === 'Enter') handleLogin(); };

  const ri = detectedRole ? roleInfo[detectedRole] : null;

  return React.createElement('div', {
    style: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }
  },
    // Card
    React.createElement('div', {
      className: 'glass-card fade-in',
      style: { width: '100%', maxWidth: 420, padding: '40px 36px 32px', textAlign: 'center' }
    },
      // Logo
      React.createElement('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 18 } },
        React.createElement(window.MathYruLogo, { size: 72 })
      ),
      // Title
      React.createElement('h1', { style: { fontSize: 20, fontWeight: 800, color: '#1f2937', marginBottom: 4 } },
        'ระบบกำกับติดตามการเรียน'
      ),
      React.createElement('p', { style: { fontSize: 13, color: '#9ca3af', marginBottom: 28 } },
        'Student Academic Tracking | มหาวิทยาลัยราชภัฏยะลา'
      ),

      // Role hint badge (shows when username matches)
      ri
        ? React.createElement('div', {
            style: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(249,168,212,0.18)', border: '1px solid rgba(219,39,119,0.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 18, fontSize: 13, color: ri.color, fontWeight: 600 }
          }, ri.icon + ' ' + ri.label)
        : username.trim().length > 0
          ? React.createElement('div', {
              style: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 18, fontSize: 13, color: '#dc2626' }
            }, '❓ ไม่พบผู้ใช้นี้ในระบบ')
          : React.createElement('div', { style: { height: 34, marginBottom: 18 } }),

      // Username
      React.createElement('div', { style: { marginBottom: 14, textAlign: 'left' } },
        React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block', fontWeight: 600 } }, 'Username / รหัสนักศึกษา'),
        React.createElement('input', {
          className: 'glass-input',
          type: 'text',
          placeholder: 'username',
          value: username,
          autoComplete: 'username',
          onChange: function(e) { setUsername(e.target.value); setError(''); },
          onKeyDown: handleKeyDown,
          style: { width: '100%', padding: '11px 14px', fontSize: 15, boxSizing: 'border-box' }
        })
      ),

      // Password
      React.createElement('div', { style: { marginBottom: 20, textAlign: 'left' } },
        React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 5, display: 'block', fontWeight: 600 } }, 'รหัสผ่าน (Password)'),
        React.createElement('div', { style: { position: 'relative' } },
          React.createElement('input', {
            className: 'glass-input',
            type: showPass ? 'text' : 'password',
            placeholder: '••••••••',
            value: password,
            autoComplete: 'current-password',
            onChange: function(e) { setPassword(e.target.value); setError(''); },
            onKeyDown: handleKeyDown,
            style: { width: '100%', padding: '11px 46px 11px 14px', fontSize: 15, boxSizing: 'border-box' }
          }),
          React.createElement('button', {
            type: 'button',
            onClick: function() { setShowPass(!showPass); },
            style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af', padding: 0, lineHeight: 1 }
          }, showPass ? '🙈' : '👁️')
        )
      ),

      // Error
      error && React.createElement('div', {
        style: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '9px 14px', marginBottom: 14, color: '#dc2626', fontSize: 13, textAlign: 'left' }
      }, '⚠️ ' + error),

      // Login button
      React.createElement('button', {
        className: 'btn-primary',
        onClick: handleLogin,
        disabled: loading,
        style: { width: '100%', fontSize: 16, padding: '13px', borderRadius: 14, opacity: loading ? 0.7 : 1 }
      }, loading ? '⏳ กำลังตรวจสอบ...' : 'เข้าสู่ระบบ →'),

    ),
    React.createElement('p', { style: { marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.7 } },
      'พัฒนาโดย อาจารย์มะรอกี แมเดาะ', React.createElement('br'),
      'สาขาวิชาคณิตศาสตร์ คณะวิทยาศาสตร์เทคโนโลยีและการเกษตร', React.createElement('br'),
      'มหาวิทยาลัยราชภัฏยะลา'
    )
  );
};

// ---- Profile Edit Modal ----
window.ProfileEditModal = function({ open, onClose, role, userId, students, advisors, actions }) {
  var user = role === 'student'
    ? (students || []).find(function(s) { return s.id === userId; })
    : (advisors || []).find(function(a) { return a.id === userId; });

  var [name, setName] = React.useState('');
  var [oldPass, setOldPass] = React.useState('');
  var [newPass, setNewPass] = React.useState('');
  var [confirmPass, setConfirmPass] = React.useState('');
  var [msg, setMsg] = React.useState('');
  var [saving, setSaving] = React.useState(false);

  React.useEffect(function() {
    if (open && user) {
      setName(user.name || '');
      setOldPass(''); setNewPass(''); setConfirmPass(''); setMsg('');
    }
  }, [open, userId]);

  var handleSave = function() {
    if (!name.trim()) { setMsg('⚠ กรุณากรอกชื่อ'); return; }
    var updates = { name: name.trim() };
    if (oldPass || newPass || confirmPass) {
      if (!oldPass) { setMsg('⚠ กรุณากรอกรหัสผ่านเดิม'); return; }
      if (user.password !== oldPass) { setMsg('⚠ รหัสผ่านเดิมไม่ถูกต้อง'); return; }
      if (!newPass) { setMsg('⚠ กรุณากรอกรหัสผ่านใหม่'); return; }
      if (newPass.length < 4) { setMsg('⚠ รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร'); return; }
      if (newPass !== confirmPass) { setMsg('⚠ รหัสผ่านใหม่ไม่ตรงกัน'); return; }
      updates.password = newPass;
    }
    setSaving(true);
    var promise = role === 'student'
      ? actions.updateStudent(userId, updates)
      : actions.updateAdvisor(userId, updates);
    Promise.resolve(promise).then(function() {
      setSaving(false);
      onClose();
    }).catch(function() {
      setSaving(false);
      setMsg('⚠ บันทึกไม่สำเร็จ กรุณาลองใหม่');
    });
  };

  var lStyle = { fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4, display: 'block' };
  var iStyle = { width: '100%', padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' };

  return React.createElement(window.Modal, {
    open: open, onClose: onClose, title: '✏️ แก้ไขโปรไฟล์', width: '440px'
  },
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
      React.createElement('div', {},
        React.createElement('label', { style: lStyle }, 'ชื่อ-นามสกุล'),
        React.createElement('input', { className: 'glass-input', style: iStyle, value: name, onChange: function(e) { setName(e.target.value); setMsg(''); } })
      ),
      React.createElement('div', { style: { padding: '12px 16px', background: 'rgba(0,0,0,0.03)', borderRadius: 10 } },
        React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 } }, '🔒 เปลี่ยนรหัสผ่าน (ไม่บังคับ)'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          React.createElement('div', {},
            React.createElement('label', { style: lStyle }, 'รหัสผ่านเดิม'),
            React.createElement('input', { className: 'glass-input', style: iStyle, type: 'password', value: oldPass, onChange: function(e) { setOldPass(e.target.value); setMsg(''); }, placeholder: '••••••' })
          ),
          React.createElement('div', {},
            React.createElement('label', { style: lStyle }, 'รหัสผ่านใหม่'),
            React.createElement('input', { className: 'glass-input', style: iStyle, type: 'password', value: newPass, onChange: function(e) { setNewPass(e.target.value); setMsg(''); }, placeholder: '••••••' })
          ),
          React.createElement('div', {},
            React.createElement('label', { style: lStyle }, 'ยืนยันรหัสผ่านใหม่'),
            React.createElement('input', { className: 'glass-input', style: iStyle, type: 'password', value: confirmPass, onChange: function(e) { setConfirmPass(e.target.value); setMsg(''); }, placeholder: '••••••' })
          )
        )
      ),
      msg && React.createElement('div', { style: { fontSize: 13, color: '#dc2626' } }, msg),
      React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
        React.createElement('button', { className: 'btn-secondary', onClick: onClose }, 'ยกเลิก'),
        React.createElement('button', { className: 'btn-primary', disabled: saving, onClick: handleSave }, saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก')
      )
    )
  );
};

// ---- NAVBAR (shared) ----
window.Navbar = function({ role, userName, onLogout, onMenuToggle, currentPage, navItems, onProfileEdit }) {
  const roleLabels = { admin: '🛡️ Admin', student: '🎓 นักศึกษา', advisor: '👨‍🏫 อาจารย์' };
  const roleColors = { admin: '#e91e8c', student: '#1565c0', advisor: '#2e7d32' };
  const currentLabel = (navItems.find(n => n.key === currentPage) || {}).label || '';

  return React.createElement('nav', {
    className: 'glass-nav no-print',
    style: { position: 'sticky', top: 0, zIndex: 100, padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }
  },
    // Left: hamburger + logo
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '0 0 auto' } },
      React.createElement('button', {
        onClick: onMenuToggle,
        style: { background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 10, padding: '7px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
        id: 'hamburger-btn'
      },
        React.createElement(window.Icon, { name: 'menu', size: 20 })
      ),
      React.createElement(window.MathYruLogo, { size: 34 }),
      React.createElement('span', {
        className: 'nav-logo-text',
        style: { fontWeight: 700, fontSize: 14, color: '#1f2937', whiteSpace: 'nowrap' }
      }, 'MATH-YRU Tracking')
    ),
    // Center: current page label
    React.createElement('div', {
      className: 'nav-center-title',
      style: { fontWeight: 600, fontSize: 15, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'center', padding: '0 8px' }
    }, currentLabel),
    // Right: role badge + profile + logout
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' } },
      React.createElement('span', {
        style: { background: roleColors[role] + '22', color: roleColors[role], padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }
      }, roleLabels[role]),
      onProfileEdit && React.createElement('button', {
        onClick: onProfileEdit,
        title: 'แก้ไขโปรไฟล์',
        style: { background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', fontSize: 15 }
      }, '✏️'),
      React.createElement('button', {
        onClick: onLogout,
        style: { background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#4b5563', fontFamily: 'Sarabun,sans-serif', fontWeight: 600 }
      },
        React.createElement(window.Icon, { name: 'logout', size: 15 }),
        React.createElement('span', { className: 'nav-logo-text' }, 'ออก')
      )
    )
  );
};

// ---- SIDEBAR ----
window.Sidebar = function({ navItems, currentPage, onNavigate, isOpen, onClose }) {
  var isMobile = window.innerWidth <= 768;
  return React.createElement(React.Fragment, null,
    // Overlay (mobile only)
    isMobile && React.createElement('div', {
      style: { display: isOpen ? 'block' : 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 },
      onClick: onClose
    }),
    // Sidebar panel
    React.createElement('aside', {
      className: 'glass-sidebar',
      style: {
        width: 210,
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flexShrink: 0,
        // Mobile: fixed overlay
        ...(isMobile ? {
          position: 'fixed', top: 0, bottom: 0, left: isOpen ? 0 : '-220px',
          zIndex: 200, transition: 'left 0.28s ease', boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none'
        } : {
          position: 'relative', minHeight: 'calc(100vh - 60px)'
        })
      }
    },
      // Close button (mobile only header)
      isMobile && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.3)' } },
        React.createElement('span', { style: { fontWeight: 700, fontSize: 14, color: '#374151' } }, '📋 เมนู'),
        React.createElement('button', {
          onClick: onClose,
          style: { background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 8, padding: '5px 8px', cursor: 'pointer' }
        }, React.createElement(window.Icon, { name: 'close', size: 16, color: '#6b7280' }))
      ),
      navItems.map(function(item) {
        return React.createElement('div', {
          key: item.key,
          className: 'nav-item' + (currentPage === item.key ? ' active' : ''),
          onClick: function() { onNavigate(item.key); if (isMobile) onClose(); }
        },
          React.createElement('span', { style: { fontSize: 17 } }, item.icon),
          React.createElement('span', { style: { fontSize: 14 } }, item.label)
        );
      })
    )
  );
};

// ---- LAYOUT WRAPPER ----
window.AppLayout = function({ role, userName, navItems, currentPage, onNavigate, onLogout, currentUserId, students, advisors, actions, children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const [showProfileEdit, setShowProfileEdit] = React.useState(false);

  React.useEffect(function() {
    function onResize() { setIsMobile(window.innerWidth <= 768); }
    window.addEventListener('resize', onResize);
    return function() { window.removeEventListener('resize', onResize); };
  }, []);

  var canEditProfile = role === 'student' || role === 'advisor';

  return React.createElement('div', { style: { minHeight: '100vh', display: 'flex', flexDirection: 'column' } },
    canEditProfile && React.createElement(window.ProfileEditModal, {
      open: showProfileEdit,
      onClose: function() { setShowProfileEdit(false); },
      role: role, userId: currentUserId,
      students: students || [], advisors: advisors || [], actions: actions || {}
    }),
    React.createElement(window.Navbar, {
      role, userName, onLogout,
      onMenuToggle: function() { setSidebarOpen(function(v) { return !v; }); },
      currentPage, navItems,
      onProfileEdit: canEditProfile ? function() { setShowProfileEdit(true); } : null
    }),
    React.createElement('div', { style: { display: 'flex', flex: 1, minHeight: 0 } },
      // Desktop: always-visible sidebar
      !isMobile && React.createElement(window.Sidebar, {
        navItems, currentPage, onNavigate,
        isOpen: true, onClose: function() {}
      }),
      // Mobile: overlay sidebar
      isMobile && React.createElement(window.Sidebar, {
        navItems, currentPage, onNavigate,
        isOpen: sidebarOpen, onClose: function() { setSidebarOpen(false); }
      }),
      React.createElement('main', {
        style: { flex: 1, padding: isMobile ? '16px 14px' : '24px 20px', maxWidth: '100%', overflowX: 'hidden', minWidth: 0 },
        className: 'fade-in'
      }, children)
    )
  );
};

console.log('✅ Login + Shared Components loaded');
