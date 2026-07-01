// ============================================================
// ADVISOR VIEWS
// ============================================================

// ---- Advisor Dashboard (Overview) ----
window.AdvisorDashboardView = function() {
  const { state, actions } = window.useApp();
  const advisor = state.advisors.find(a => a.id === state.currentUserId);
  if (!advisor) return null;

  const myStudents = state.students.filter(s => s.advisorId === advisor.id);
  const { courses } = state;

  // Compute stats for each student
  const studentStats = myStudents.map(s => {
    const gpax = parseFloat(window.Utils.calcGPAX(s.enrollments, courses));
    const risk = window.Utils.getAtRiskIndicators(s, courses);
    const totalEarned = window.Utils.totalEarnedCredits(s, courses);
    const isOnTrack = risk.failCount === 0;
    return { student: s, gpax, risk, totalEarned, isOnTrack };
  });

  const onTrackCount = studentStats.filter(s => s.isOnTrack).length;
  const atRiskCount = studentStats.filter(s => !s.isOnTrack).length;
  const totalEFCourses = studentStats.reduce((sum, s) => sum + s.risk.failCount, 0);
  const avgGPAX = myStudents.length > 0
    ? (studentStats.reduce((sum, s) => sum + s.gpax, 0) / myStudents.length).toFixed(2)
    : '0.00';

  // GPAX distribution
  const gpaxDist = [
    { label: '3.50–4.00', count: studentStats.filter(s => s.gpax >= 3.5).length, color: '#22c55e' },
    { label: '3.00–3.49', count: studentStats.filter(s => s.gpax >= 3.0 && s.gpax < 3.5).length, color: '#3b82f6' },
    { label: '2.50–2.99', count: studentStats.filter(s => s.gpax >= 2.5 && s.gpax < 3.0).length, color: '#f59e0b' },
    { label: '2.00–2.49', count: studentStats.filter(s => s.gpax >= 2.0 && s.gpax < 2.5).length, color: '#f97316' },
    { label: 'ต่ำกว่า 2.00', count: studentStats.filter(s => s.gpax < 2.0).length, color: '#ef4444' },
  ];

  // Year distribution
  const yearDist = [1,2,3,4].map(y => ({
    year: y,
    count: myStudents.filter(s => s.year === y).length
  }));

  // Note modal
  const [noteModal, setNoteModal] = React.useState(null);
  const [noteText, setNoteText] = React.useState('');

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    actions.addAdvisorNote(noteModal, { text: noteText, advisorId: advisor.id });
    setNoteText('');
    setNoteModal(null);
  };

  return React.createElement('div', { className: 'fade-in' },
    // Header
    React.createElement('div', { style: { marginBottom: 24 } },
      React.createElement('h1', { style: { fontSize: 24, fontWeight: 800, color: '#1f2937', marginBottom: 4 } }, '📊 Dashboard อาจารย์ที่ปรึกษา'),
      React.createElement('p', { style: { fontSize: 14, color: '#6b7280' } }, advisor.name + ' | ' + advisor.department)
    ),

    // Stat cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 } },
      [
        { label: 'นักศึกษาทั้งหมด', value: myStudents.length, cls: 'stat-pink', color: '#be185d', icon: '🎓' },
        { label: 'เดินตามแผน', value: onTrackCount, cls: 'stat-green', color: '#15803d', icon: '✅' },
        { label: 'มีความเสี่ยง', value: atRiskCount, cls: 'stat-orange', color: '#c2410c', icon: '⚠️' },
        { label: 'วิชาติด E/F รวม', value: totalEFCourses, cls: 'stat-red', color: '#dc2626', icon: '📌' },
        { label: 'GPAX เฉลี่ย', value: avgGPAX, cls: 'stat-blue', color: '#1d4ed8', icon: '📈' },
      ].map(s =>
        React.createElement('div', { key: s.label, className: 'glass-card ' + s.cls, style: { padding: '16px 20px' } },
          React.createElement('div', { style: { fontSize: 24, marginBottom: 4 } }, s.icon),
          React.createElement('div', { style: { fontSize: 26, fontWeight: 800, color: s.color } }, s.value),
          React.createElement('div', { style: { fontSize: 12, color: '#6b7280' } }, s.label)
        )
      )
    ),

    // Two columns: GPAX dist + Year dist
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 } },
      // GPAX distribution bar chart
      React.createElement('div', { className: 'glass-card', style: { padding: 20 } },
        React.createElement('h3', { style: { fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#1f2937' } }, '📊 การกระจาย GPAX'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          gpaxDist.map(item =>
            React.createElement('div', { key: item.label },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 } },
                React.createElement('span', { style: { color: '#374151' } }, item.label),
                React.createElement('span', { style: { fontWeight: 700, color: item.color } }, item.count + ' คน')
              ),
              React.createElement('div', { className: 'progress-bar-bg', style: { height: 8 } },
                React.createElement('div', {
                  className: 'progress-bar-fill',
                  style: { width: myStudents.length > 0 ? (item.count / myStudents.length * 100) + '%' : '0%', background: item.color, height: 8 }
                })
              )
            )
          )
        )
      ),

      // Year distribution
      React.createElement('div', { className: 'glass-card', style: { padding: 20 } },
        React.createElement('h3', { style: { fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#1f2937' } }, '📅 นักศึกษาแต่ละชั้นปี'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
          yearDist.map(item => {
            const pct = myStudents.length > 0 ? (item.count / myStudents.length * 100) : 0;
            return React.createElement('div', { key: item.year, style: { display: 'flex', alignItems: 'center', gap: 12 } },
              React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: '#374151', minWidth: 50 } }, 'ปีที่ ' + item.year),
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('div', { className: 'progress-bar-bg', style: { height: 20, borderRadius: 6 } },
                  React.createElement('div', {
                    className: 'progress-bar-fill',
                    style: { width: pct + '%', background: 'linear-gradient(90deg,#e91e8c,#f06292)', height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 8 }
                  },
                    item.count > 0 && React.createElement('span', { style: { color: 'white', fontSize: 12, fontWeight: 700 } }, item.count + ' คน')
                  )
                )
              )
            );
          })
        )
      )
    ),

    // Student summary table
    React.createElement('div', { className: 'glass-card', style: { overflow: 'auto', padding: 0 } },
      React.createElement('div', { style: { padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)' } },
        React.createElement('h3', { style: { fontWeight: 700, fontSize: 16, color: '#1f2937' } }, '👥 รายชื่อนักศึกษาในความดูแล')
      ),
      React.createElement('table', { className: 'glass-table', style: { minWidth: 600 } },
        React.createElement('thead', {},
          React.createElement('tr', {},
            ['รหัส','ชื่อ-นามสกุล','ปี/เทอม','GPAX','หน่วยกิตสะสม','สถานะ','หมายเหตุ'].map(h =>
              React.createElement('th', { key: h }, h)
            )
          )
        ),
        React.createElement('tbody', {},
          studentStats.map(({ student: s, gpax, risk, totalEarned, isOnTrack }) =>
            React.createElement('tr', { key: s.id },
              React.createElement('td', {}, React.createElement('code', { style: { fontSize: 12 } }, s.studentId)),
              React.createElement('td', { style: { fontWeight: 500 } }, s.name),
              React.createElement('td', { style: { textAlign: 'center', fontSize: 13 } }, 'ปี ' + s.year + '/' + s.currentSemester),
              React.createElement('td', { style: { textAlign: 'center', fontWeight: 700, color: gpax >= 3.0 ? '#15803d' : gpax >= 2.0 ? '#854d0e' : '#dc2626' } }, gpax.toFixed(2)),
              React.createElement('td', { style: { textAlign: 'center', fontSize: 14 } }, totalEarned + ' cr'),
              React.createElement('td', {},
                isOnTrack
                  ? React.createElement('span', { className: 'badge badge-pass' }, '✓ ปกติ')
                  : React.createElement('span', { className: 'badge badge-fail' }, '⚠ ติด E/F ' + risk.failCount + ' วิชา')
              ),
              React.createElement('td', {},
                React.createElement('button', {
                  className: 'btn-ghost',
                  style: { padding: '5px 10px', fontSize: 12, display: 'flex', gap: 4, alignItems: 'center' },
                  onClick: () => setNoteModal(s.id)
                },
                  React.createElement(window.Icon, { name: 'note', size: 14 }), 'Note'
                )
              )
            )
          )
        )
      )
    ),

    // Note modal
    React.createElement(window.Modal, {
      open: !!noteModal, onClose: () => setNoteModal(null),
      title: '📝 บันทึกหมายเหตุ', width: '440px'
    },
      noteModal && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        // Existing notes
        (() => {
          const st = state.students.find(s => s.id === noteModal);
          const notes = st?.advisorNotes || [];
          return notes.length > 0 ? React.createElement('div', { style: { marginBottom: 4 } },
            React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 } }, 'หมายเหตุก่อนหน้า:'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
              notes.map((note, i) =>
                React.createElement('div', { key: i, style: { padding: '8px 12px', background: 'rgba(255,255,255,0.4)', borderRadius: 8, fontSize: 13 } },
                  React.createElement('div', { style: { color: '#374151' } }, note.text),
                  React.createElement('div', { style: { fontSize: 11, color: '#9ca3af', marginTop: 4 } }, note.date)
                )
              )
            )
          ) : null;
        })(),
        React.createElement('textarea', {
          value: noteText, onChange: e => setNoteText(e.target.value),
          placeholder: 'กรอกหมายเหตุ / บันทึกการให้คำปรึกษา...',
          className: 'glass-input',
          style: { width: '100%', minHeight: 100, padding: '10px 12px', fontSize: 14, resize: 'vertical', display: 'block' }
        }),
        React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'flex-end' } },
          React.createElement('button', { className: 'btn-secondary', onClick: () => setNoteModal(null) }, 'ปิด'),
          React.createElement('button', { className: 'btn-primary', onClick: handleSaveNote }, 'บันทึก')
        )
      )
    )
  );
};


// ---- Early Warning System ----
window.AdvisorEarlyWarningView = function() {
  const { state } = window.useApp();
  const advisor = state.advisors.find(a => a.id === state.currentUserId);
  if (!advisor) return null;

  const myStudents = state.students.filter(s => s.advisorId === advisor.id);
  const { courses } = state;

  // Find all at-risk students and their failed courses
  const atRiskData = myStudents.map(s => {
    const latest = {};
    s.enrollments.forEach(e => {
      const key = e.courseCode;
      if (!latest[key] || (e.year * 10 + e.semester) > (latest[key].year * 10 + latest[key].semester)) latest[key] = e;
    });
    const failedCourses = Object.values(latest).filter(e => e.grade === 'E' || e.grade === 'F').map(e => ({
      enrollment: e,
      course: courses.find(c => c.code === e.courseCode)
    })).filter(item => item.course);

    const withdrawCourses = Object.values(latest).filter(e => e.grade === 'W').map(e => ({
      enrollment: e,
      course: courses.find(c => c.code === e.courseCode)
    })).filter(item => item.course);

    return { student: s, failedCourses, withdrawCourses, gpax: parseFloat(window.Utils.calcGPAX(s.enrollments, courses)) };
  }).filter(d => d.failedCourses.length > 0 || d.gpax < 2.5);

  // Export function
  const handleExport = () => {
    const rows = [['รหัสนักศึกษา','ชื่อ-นามสกุล','GPAX','วิชาติด E/F','รายชื่อวิชา']];
    atRiskData.forEach(d => {
      rows.push([
        d.student.studentId,
        d.student.name,
        d.gpax.toFixed(2),
        d.failedCourses.length,
        d.failedCourses.map(fc => fc.course.name).join(', ')
      ]);
    });
    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const bom = '﻿';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'รายงานนักศึกษาเสี่ยง_' + new Date().toLocaleDateString('th-TH').replace(/\//g,'-') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return React.createElement('div', { className: 'fade-in' },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', {},
        React.createElement('h1', { style: { fontSize: 24, fontWeight: 800, color: '#1f2937', marginBottom: 4 } }, '🚨 Early Warning System'),
        React.createElement('p', { style: { fontSize: 14, color: '#6b7280' } }, 'นักศึกษาที่มีความเสี่ยงทางการเรียน')
      ),
      React.createElement('button', {
        className: 'btn-primary', onClick: handleExport,
        style: { display: 'flex', alignItems: 'center', gap: 8 }
      },
        React.createElement(window.Icon, { name: 'export', size: 18, color: 'white' }), 'Export CSV'
      )
    ),

    atRiskData.length === 0
      ? React.createElement('div', { className: 'glass-card', style: { padding: 48, textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: 64, marginBottom: 16 } }, '🎉'),
          React.createElement('div', { style: { fontSize: 20, fontWeight: 700, color: '#15803d', marginBottom: 8 } }, 'ไม่มีนักศึกษาที่มีความเสี่ยง!'),
          React.createElement('div', { style: { fontSize: 14, color: '#6b7280' } }, 'นักศึกษาทุกคนกำลังเดินตามแผนการเรียน')
        )
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
          // Summary banner
          React.createElement('div', { style: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 } },
            React.createElement('span', { style: { fontSize: 24 } }, '⚠️'),
            React.createElement('span', { style: { fontSize: 15, color: '#dc2626', fontWeight: 600 } },
              'พบนักศึกษาที่ต้องติดตาม ' + atRiskData.length + ' คน รวม ' + atRiskData.reduce((s,d) => s + d.failedCourses.length, 0) + ' วิชาที่ติด E/F'
            )
          ),

          // Cards for each at-risk student
          atRiskData.map(({ student: s, failedCourses, withdrawCourses, gpax }) =>
            React.createElement('div', { key: s.id, className: 'glass-card', style: { padding: 20, borderLeft: '4px solid #ef4444' } },
              // Student header
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 } },
                React.createElement('div', {},
                  React.createElement('div', { style: { fontWeight: 700, fontSize: 17, color: '#1f2937' } }, s.name),
                  React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'รหัส: ' + s.studentId + ' | ปีที่ ' + s.year + ' เทอม ' + s.currentSemester)
                ),
                React.createElement('div', { style: { textAlign: 'right' } },
                  React.createElement('div', { style: { fontSize: 22, fontWeight: 800, color: gpax >= 2.0 ? '#854d0e' : '#dc2626' } }, 'GPAX: ' + gpax.toFixed(2)),
                  gpax < 2.0 && React.createElement('div', { className: 'badge badge-fail', style: { fontSize: 12 } }, '⚠ GPAX ต่ำกว่า 2.00')
                )
              ),

              // Failed courses
              failedCourses.length > 0 && React.createElement('div', {},
                React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 8 } }, '📌 วิชาที่ติด E/F (' + failedCourses.length + ' วิชา):'),
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
                  failedCourses.map((fc, i) =>
                    React.createElement('div', {
                      key: i,
                      style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }
                    },
                      React.createElement('code', { style: { fontSize: 12, color: '#dc2626', minWidth: 90, fontWeight: 700 } }, fc.enrollment.courseCode),
                      React.createElement('span', { style: { flex: 1, fontSize: 14 } }, fc.course.name),
                      React.createElement('span', { style: { fontSize: 12, color: '#9ca3af' } }, fc.course.credits + ' cr'),
                      React.createElement(window.GradeBadge, { grade: fc.enrollment.grade }),
                      React.createElement('span', { style: { fontSize: 12, color: '#9ca3af' } }, 'ปี' + fc.enrollment.year + '/ต' + fc.enrollment.semester)
                    )
                  )
                )
              ),

              // W courses
              withdrawCourses.length > 0 && React.createElement('div', { style: { marginTop: 10 } },
                React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 6 } }, '🔖 วิชาที่ถอน (W):'),
                React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                  withdrawCourses.map((wc, i) =>
                    React.createElement('span', { key: i, className: 'badge badge-withdraw' }, wc.course.name)
                  )
                )
              )
            )
          )
        )
  );
};


// ---- Individual Student Tracking ----
window.AdvisorTrackingView = function() {
  const { state } = window.useApp();
  const advisor = state.advisors.find(a => a.id === state.currentUserId);
  if (!advisor) return null;

  const myStudents = state.students.filter(s => s.advisorId === advisor.id);
  const { courses } = state;

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStudent, setSelectedStudent] = React.useState(null);
  const [filterYear, setFilterYear] = React.useState('all');

  const filtered = myStudents.filter(s => {
    if (searchTerm && !s.name.includes(searchTerm) && !s.studentId.includes(searchTerm)) return false;
    if (filterYear !== 'all' && String(s.year) !== filterYear) return false;
    return true;
  });

  if (selectedStudent) {
    // Show individual student checklist
    const student = state.students.find(s => s.id === selectedStudent);
    return React.createElement('div', { className: 'fade-in' },
      React.createElement('div', { style: { marginBottom: 20 } },
        React.createElement('button', {
          className: 'btn-secondary',
          onClick: () => setSelectedStudent(null),
          style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }
        },
          React.createElement(window.Icon, { name: 'close', size: 16 }),
          '← กลับรายชื่อ'
        )
      ),
      window.StudentChecklistView ? React.createElement(window.StudentChecklistView, { studentId: selectedStudent }) : React.createElement('div', {}, 'Loading...')
    );
  }

  return React.createElement('div', { className: 'fade-in' },
    // Header
    React.createElement('div', { style: { marginBottom: 24 } },
      React.createElement('h1', { style: { fontSize: 24, fontWeight: 800, color: '#1f2937', marginBottom: 4 } }, '🔍 ติดตามนักศึกษารายบุคคล'),
      React.createElement('p', { style: { fontSize: 14, color: '#6b7280' } }, 'คลิกที่นักศึกษาเพื่อดูรายละเอียด Curriculum Checklist')
    ),

    // Filter bar
    React.createElement('div', { className: 'glass-card', style: { padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' } },
      React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 10, padding: '8px 12px' } },
        React.createElement(window.Icon, { name: 'search', size: 16, color: '#9ca3af' }),
        React.createElement('input', {
          type: 'text', placeholder: 'ค้นหาชื่อหรือรหัสนักศึกษา...', value: searchTerm,
          onChange: e => setSearchTerm(e.target.value),
          style: { border: 'none', background: 'transparent', fontSize: 15, width: '100%', outline: 'none' }
        })
      ),
      React.createElement('select', {
        className: 'glass-input', value: filterYear, onChange: e => setFilterYear(e.target.value),
        style: { padding: '8px 36px 8px 12px', fontSize: 14 }
      },
        React.createElement('option', { value: 'all' }, 'ทุกชั้นปี'),
        [1,2,3,4].map(y => React.createElement('option', { key: y, value: String(y) }, 'ปีที่ ' + y))
      )
    ),

    // Student cards grid
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 } },
      filtered.map(s => {
        const gpax = parseFloat(window.Utils.calcGPAX(s.enrollments, courses));
        const risk = window.Utils.getAtRiskIndicators(s, courses);
        const totalEarned = window.Utils.totalEarnedCredits(s, courses);
        const totalRequired = state.curriculumMeta.totalCredits;
        const isOnTrack = risk.failCount === 0;
        const pct = Math.round((totalEarned / totalRequired) * 100);

        return React.createElement('div', {
          key: s.id,
          className: 'glass-card role-card',
          style: { padding: 20, cursor: 'pointer', borderLeft: '4px solid ' + (isOnTrack ? '#22c55e' : '#ef4444') },
          onClick: () => setSelectedStudent(s.id)
        },
          // Top row
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 } },
            React.createElement('div', {},
              React.createElement('div', { style: { fontWeight: 700, fontSize: 16, color: '#1f2937', marginBottom: 2 } }, s.name),
              React.createElement('div', { style: { fontSize: 12, color: '#9ca3af' } }, s.studentId),
              React.createElement('span', { className: 'badge ' + (isOnTrack ? 'badge-pass' : 'badge-fail'), style: { marginTop: 6, display: 'inline-block' } },
                isOnTrack ? '✓ ปกติ' : '⚠ ติด E/F ' + risk.failCount + ' วิชา'
              )
            ),
            React.createElement('div', { style: { textAlign: 'center' } },
              React.createElement(window.ProgressRing, {
                value: totalEarned, max: totalRequired,
                color: isOnTrack ? 'green' : 'orange', size: 56,
                label: pct + '%', sublabel: null
              })
            )
          ),

          // Stats row
          React.createElement('div', { style: { display: 'flex', gap: 16, borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: 12 } },
            React.createElement('div', { style: { textAlign: 'center' } },
              React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: gpax >= 3.0 ? '#15803d' : gpax >= 2.0 ? '#854d0e' : '#dc2626' } }, gpax.toFixed(2)),
              React.createElement('div', { style: { fontSize: 11, color: '#9ca3af' } }, 'GPAX')
            ),
            React.createElement('div', { style: { textAlign: 'center' } },
              React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: '#374151' } }, totalEarned),
              React.createElement('div', { style: { fontSize: 11, color: '#9ca3af' } }, 'หน่วยกิต')
            ),
            React.createElement('div', { style: { textAlign: 'center' } },
              React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: '#374151' } }, 'ปี ' + s.year),
              React.createElement('div', { style: { fontSize: 11, color: '#9ca3af' } }, 'เทอม ' + s.currentSemester)
            ),
            React.createElement('div', { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center' } },
              React.createElement('span', { style: { fontSize: 13, color: '#e91e8c', fontWeight: 600 } }, 'ดูรายละเอียด →')
            )
          )
        );
      })
    )
  );
};


// ---- Export Report ----
window.AdvisorExportView = function() {
  const { state } = window.useApp();
  const advisor = state.advisors.find(a => a.id === state.currentUserId);
  if (!advisor) return null;

  const myStudents = state.students.filter(s => s.advisorId === advisor.id);
  const { courses, curriculumMeta } = state;

  const [reportType, setReportType] = React.useState('at-risk');

  const reportTypes = [
    { key: 'at-risk', label: '⚠️ รายงานนักศึกษาเสี่ยง (ติด E/F)', desc: 'สรุปนักศึกษาที่ติด E/F และวิชาที่ต้องลงทะเบียนซ้ำ' },
    { key: 'progress', label: '📊 รายงานความก้าวหน้าทั้งหมด', desc: 'ข้อมูล GPAX และหน่วยกิตสะสมของนักศึกษาทุกคน' },
    { key: 'curriculum', label: '✅ รายงานตรวจสอบหลักสูตร', desc: 'สถานะการผ่านแต่ละหมวดวิชาของนักศึกษาแต่ละคน' },
  ];

  const generateCSV = () => {
    let rows = [];
    if (reportType === 'at-risk') {
      rows = [['รหัสนักศึกษา','ชื่อ','ปี','เทอม','GPAX','จำนวนวิชาติด E/F','รายชื่อวิชาติด E/F','วิชาถอน W']];
      myStudents.forEach(s => {
        const gpax = window.Utils.calcGPAX(s.enrollments, courses);
        const risk = window.Utils.getAtRiskIndicators(s, courses);
        const wCourses = s.enrollments.filter(e => e.grade === 'W').map(e => courses.find(c => c.code === e.courseCode)?.name || e.courseCode).join('; ');
        rows.push([s.studentId, s.name, s.year, s.currentSemester, gpax, risk.failCount, risk.pendingRetake.join('; '), wCourses]);
      });
    } else if (reportType === 'progress') {
      rows = [['รหัสนักศึกษา','ชื่อ','ปี','GPAX','หน่วยกิตสะสม','หน่วยกิตที่ต้องการ','ความคืบหน้า (%)']];
      myStudents.forEach(s => {
        const gpax = window.Utils.calcGPAX(s.enrollments, courses);
        const earned = window.Utils.totalEarnedCredits(s, courses);
        const pct = Math.round(earned / curriculumMeta.totalCredits * 100);
        rows.push([s.studentId, s.name, s.year, gpax, earned, curriculumMeta.totalCredits, pct + '%']);
      });
    } else {
      rows = [['รหัสนักศึกษา','ชื่อ',...curriculumMeta.categories.map(c => c.name + ' (cr)')]];
      myStudents.forEach(s => {
        const statusMap = window.Utils.computeCurriculumStatus(s, courses);
        const catCredits = curriculumMeta.categories.map(cat => {
          const cs = statusMap[cat.id];
          return cs.earnedCredits + '/' + cat.requiredCredits;
        });
        rows.push([s.studentId, s.name, ...catCredits]);
      });
    }

    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = reportTypes.find(r => r.key === reportType)?.label.replace(/[^ก-๙a-zA-Z0-9]/g,'_') || 'report';
    a.download = fileName + '_' + new Date().toLocaleDateString('th-TH').replace(/\//g,'-') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Preview table
  const previewData = myStudents.map(s => {
    const gpax = parseFloat(window.Utils.calcGPAX(s.enrollments, courses));
    const risk = window.Utils.getAtRiskIndicators(s, courses);
    const earned = window.Utils.totalEarnedCredits(s, courses);
    const statusMap = window.Utils.computeCurriculumStatus(s, courses);
    return { student: s, gpax, risk, earned, statusMap };
  });

  return React.createElement('div', { className: 'fade-in' },
    React.createElement('div', { style: { marginBottom: 24 } },
      React.createElement('h1', { style: { fontSize: 24, fontWeight: 800, color: '#1f2937', marginBottom: 4 } }, '📤 Export รายงาน'),
      React.createElement('p', { style: { fontSize: 14, color: '#6b7280' } }, 'ดาวน์โหลดรายงานสรุปนักศึกษาเป็นไฟล์ CSV')
    ),

    // Report type selector
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 } },
      reportTypes.map(rt =>
        React.createElement('div', {
          key: rt.key,
          className: 'glass-card',
          style: { padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, border: reportType === rt.key ? '2px solid #e91e8c' : '1px solid rgba(255,255,255,0.5)', background: reportType === rt.key ? 'rgba(233,30,140,0.06)' : undefined },
          onClick: () => setReportType(rt.key)
        },
          React.createElement('div', { style: { width: 20, height: 20, borderRadius: '50%', border: '2px solid #e91e8c', background: reportType === rt.key ? '#e91e8c' : 'transparent', flexShrink: 0 } }),
          React.createElement('div', {},
            React.createElement('div', { style: { fontWeight: 600, fontSize: 15, color: '#1f2937' } }, rt.label),
            React.createElement('div', { style: { fontSize: 13, color: '#6b7280', marginTop: 2 } }, rt.desc)
          )
        )
      )
    ),

    // Preview
    React.createElement('div', { className: 'glass-card', style: { overflow: 'auto', padding: 0, marginBottom: 20 } },
      React.createElement('div', { style: { padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        React.createElement('span', { style: { fontWeight: 600, fontSize: 15, color: '#374151' } }, 'Preview (' + myStudents.length + ' รายการ)'),
        React.createElement('button', { className: 'btn-primary', onClick: generateCSV, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' } },
          React.createElement(window.Icon, { name: 'export', size: 16, color: 'white' }),
          'Download CSV'
        )
      ),
      React.createElement('table', { className: 'glass-table', style: { minWidth: 600 } },
        React.createElement('thead', {},
          React.createElement('tr', {},
            reportType === 'at-risk'
              ? ['รหัส','ชื่อ','GPAX','วิชาติด E/F','สถานะ'].map(h => React.createElement('th', { key: h }, h))
              : reportType === 'progress'
                ? ['รหัส','ชื่อ','GPAX','หน่วยกิต','ความคืบหน้า'].map(h => React.createElement('th', { key: h }, h))
                : ['รหัส','ชื่อ',...curriculumMeta.categories.map(c => c.name)].map(h => React.createElement('th', { key: h }, h))
          )
        ),
        React.createElement('tbody', {},
          previewData.map(({ student: s, gpax, risk, earned, statusMap }) =>
            React.createElement('tr', { key: s.id },
              React.createElement('td', {}, React.createElement('code', { style: { fontSize: 12 } }, s.studentId)),
              React.createElement('td', { style: { fontWeight: 500 } }, s.name),
              reportType === 'at-risk'
                ? React.createElement(React.Fragment, null,
                    React.createElement('td', { style: { textAlign: 'center', fontWeight: 700, color: gpax >= 3.0 ? '#15803d' : gpax >= 2.0 ? '#854d0e' : '#dc2626' } }, gpax.toFixed(2)),
                    React.createElement('td', { style: { textAlign: 'center' } }, risk.failCount > 0 ? React.createElement('span', { className: 'badge badge-fail' }, risk.failCount + ' วิชา') : React.createElement('span', { className: 'badge badge-pass' }, '0')),
                    React.createElement('td', {}, risk.failCount > 0 ? React.createElement('span', { className: 'badge badge-fail' }, '⚠ เสี่ยง') : React.createElement('span', { className: 'badge badge-pass' }, '✓ ปกติ'))
                  )
                : reportType === 'progress'
                  ? React.createElement(React.Fragment, null,
                      React.createElement('td', { style: { textAlign: 'center', fontWeight: 700 } }, gpax.toFixed(2)),
                      React.createElement('td', { style: { textAlign: 'center' } }, earned + '/' + state.curriculumMeta.totalCredits + ' cr'),
                      React.createElement('td', {},
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                          React.createElement('div', { className: 'progress-bar-bg', style: { flex: 1, height: 8 } },
                            React.createElement('div', { className: 'progress-bar-fill', style: { width: Math.round(earned/state.curriculumMeta.totalCredits*100) + '%', background: '#e91e8c', height: 8 } })
                          ),
                          React.createElement('span', { style: { fontSize: 12, color: '#6b7280', minWidth: 35 } }, Math.round(earned/state.curriculumMeta.totalCredits*100) + '%')
                        )
                      )
                    )
                  : React.createElement(React.Fragment, null,
                      ...curriculumMeta.categories.map(cat => {
                        const cs = statusMap[cat.id];
                        return React.createElement('td', { key: cat.id, style: { textAlign: 'center', fontWeight: 600, color: cs.completed ? '#15803d' : '#854d0e' } },
                          cs.earnedCredits + '/' + cat.requiredCredits,
                          cs.completed ? ' ✓' : ''
                        );
                      })
                    )
            )
          )
        )
      )
    )
  );
};

console.log('✅ Advisor views loaded');
