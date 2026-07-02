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

    // Stat cards — 4 columns, elegant style
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 } },
      React.createElement('div', { className: 'glass-card', style: { padding: '20px 24px', borderLeft: '4px solid #ec4899', display: 'flex', flexDirection: 'column', gap: 4 } },
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'นักศึกษาทั้งหมด'),
        React.createElement('div', { style: { fontSize: 36, fontWeight: 900, color: '#1f2937', lineHeight: 1.1 } }, myStudents.length),
        React.createElement('div', { style: { fontSize: 12, color: '#6b7280' } }, 'คน')
      ),
      React.createElement('div', { className: 'glass-card', style: { padding: '20px 24px', borderLeft: '4px solid #22c55e', display: 'flex', flexDirection: 'column', gap: 4 } },
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'เดินตามแผน'),
        React.createElement('div', { style: { fontSize: 36, fontWeight: 900, color: '#1f2937', lineHeight: 1.1 } }, onTrackCount),
        React.createElement('div', { style: { fontSize: 12, color: '#6b7280' } }, 'คน')
      ),
      React.createElement('div', { className: 'glass-card', style: { padding: '20px 24px', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: 4 } },
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'ต้องระวัง'),
        React.createElement('div', { style: { fontSize: 36, fontWeight: 900, color: '#1f2937', lineHeight: 1.1 } }, atRiskCount),
        React.createElement('div', { style: { fontSize: 12, color: '#6b7280' } }, 'คน')
      ),
      React.createElement('div', { className: 'glass-card', style: { padding: '20px 24px', borderLeft: '4px solid #a855f7', display: 'flex', flexDirection: 'column', gap: 4 } },
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'GPAX เฉลี่ย'),
        React.createElement('div', { style: { fontSize: 36, fontWeight: 900, color: '#1f2937', lineHeight: 1.1 } }, avgGPAX),
        React.createElement('div', { style: { fontSize: 12, color: '#6b7280' } }, 'คะแนน')
      )
    ),

    // GPAX distribution — full width horizontal bar chart
    React.createElement('div', { className: 'glass-card', style: { padding: '20px 24px', marginBottom: 24 } },
      React.createElement('div', { style: { fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 16 } }, '📊 การกระจาย GPAX'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        (() => {
          var gpaxRanges = [
            { label: '3.50 – 4.00', min: 3.5, max: 4.01, color: '#22c55e' },
            { label: '3.00 – 3.49', min: 3.0, max: 3.5, color: '#84cc16' },
            { label: '2.50 – 2.99', min: 2.5, max: 3.0, color: '#eab308' },
            { label: '2.00 – 2.49', min: 2.0, max: 2.5, color: '#f97316' },
            { label: 'ต่ำกว่า 2.00', min: 0, max: 2.0, color: '#ef4444' }
          ];
          var gpaxList = studentStats.map(function(s) { return s.gpax || 0; });
          var maxCount = 1;
          var rangeCounts = gpaxRanges.map(function(r) {
            var count = gpaxList.filter(function(g) { return g >= r.min && g < r.max; }).length;
            if (count > maxCount) maxCount = count;
            return count;
          });
          return gpaxRanges.map(function(r, i) {
            var count = rangeCounts[i];
            var pct = maxCount > 0 ? (count / maxCount * 100) : 0;
            return React.createElement('div', { key: r.label, style: { display: 'flex', alignItems: 'center', gap: 10 } },
              React.createElement('div', { style: { width: 90, fontSize: 13, color: '#374151', fontWeight: 500, flexShrink: 0 } }, r.label),
              React.createElement('div', { style: { flex: 1, height: 24, background: 'rgba(0,0,0,0.05)', borderRadius: 6, overflow: 'hidden' } },
                React.createElement('div', { style: { width: pct + '%', height: '100%', background: r.color, borderRadius: 6, transition: 'width 0.6s ease', minWidth: count > 0 ? 4 : 0 } })
              ),
              React.createElement('div', { style: { width: 28, fontSize: 14, fontWeight: 700, color: '#374151', textAlign: 'right' } }, count)
            );
          });
        })()
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

          // Teaching Practice Section
          (() => {
            var tpResults = myStudents.map(function(s) {
              var tp = window.Utils.checkTeachingPractice(s, courses);
              return Object.assign({ student: s }, tp);
            });
            var tpIneligible = tpResults.filter(function(r) { return !r.eligible; });
            var tpAtRisk = tpResults.filter(function(r) { return r.eligible && r.trend === 'at-risk'; });
            var tpSafe = tpResults.filter(function(r) { return r.trend === 'safe'; });

            return React.createElement('div', { className: 'glass-card', style: { padding: '20px 22px', marginBottom: 0 } },
              React.createElement('h2', { style: { fontSize: 17, fontWeight: 800, color: '#1f2937', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 } },
                '🏫 สถานะการออกฝึกสอน (ฝึกประสบการณ์วิชาชีพครู)'
              ),
              // Summary stat row
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 } },
                React.createElement('div', { style: { padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', textAlign: 'center' } },
                  React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: '#dc2626' } }, tpIneligible.length),
                  React.createElement('div', { style: { fontSize: 12, color: '#6b7280', marginTop: 2 } }, '🚫 ออกฝึกสอนไม่ได้')
                ),
                React.createElement('div', { style: { padding: '12px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', textAlign: 'center' } },
                  React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: '#d97706' } }, tpAtRisk.length),
                  React.createElement('div', { style: { fontSize: 12, color: '#6b7280', marginTop: 2 } }, '⚠️ มีความเสี่ยง')
                ),
                React.createElement('div', { style: { padding: '12px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', textAlign: 'center' } },
                  React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: '#15803d' } }, tpSafe.length),
                  React.createElement('div', { style: { fontSize: 12, color: '#6b7280', marginTop: 2 } }, '✅ ผ่านเกณฑ์')
                )
              ),
              // รายชื่อที่ไม่ผ่าน
              tpIneligible.length > 0 && React.createElement('div', { style: { marginBottom: 12 } },
                React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 8 } }, '🚫 ไม่สามารถออกฝึกสอนได้ (E/F ≥ 9 หน่วยกิต)'),
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
                  tpIneligible.map(function(r) {
                    return React.createElement('div', { key: r.student.id, style: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.07)', borderRadius: 10 } },
                      React.createElement('div', { style: { flex: 1 } },
                        React.createElement('span', { style: { fontSize: 14, fontWeight: 600 } }, r.student.name),
                        React.createElement('span', { style: { fontSize: 12, color: '#6b7280', marginLeft: 8 } }, r.student.studentId)
                      ),
                      React.createElement('span', { style: { fontSize: 13, color: '#dc2626', fontWeight: 700 } }, r.efCredits + ' cr E/F'),
                      React.createElement('span', { style: { fontSize: 11, padding: '3px 10px', background: 'rgba(239,68,68,0.15)', color: '#dc2626', borderRadius: 20, fontWeight: 700 } }, '✗ ไม่ผ่าน')
                    );
                  })
                )
              ),
              // รายชื่อเสี่ยง
              tpAtRisk.length > 0 && React.createElement('div', {},
                React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#d97706', marginBottom: 8 } }, '⚠️ มีความเสี่ยง (E/F 6–8 หน่วยกิต) — แนวโน้มอาจออกฝึกสอนไม่ได้'),
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
                  tpAtRisk.map(function(r) {
                    return React.createElement('div', { key: r.student.id, style: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(245,158,11,0.07)', borderRadius: 10 } },
                      React.createElement('div', { style: { flex: 1 } },
                        React.createElement('span', { style: { fontSize: 14, fontWeight: 600 } }, r.student.name),
                        React.createElement('span', { style: { fontSize: 12, color: '#6b7280', marginLeft: 8 } }, r.student.studentId)
                      ),
                      React.createElement('span', { style: { fontSize: 13, color: '#d97706', fontWeight: 700 } }, r.efCredits + ' cr E/F'),
                      React.createElement('span', { style: { fontSize: 11, padding: '3px 10px', background: 'rgba(245,158,11,0.15)', color: '#d97706', borderRadius: 20, fontWeight: 700 } }, '⚠ เสี่ยง')
                    );
                  })
                )
              )
            );
          })(),

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

// ---- License View ----
window.AdvisorLicenseView = function({ students, courses, advisorId }) {
  var myStudents = students.filter(function(s) { return s.advisorId === advisorId; });

  var statusLabel = { 'not_taken': 'ยังไม่สอบ', 'failed': 'สอบไม่ผ่าน', 'passed': 'สอบผ่าน' };
  var statusColor = {
    'not_taken': { bg: 'rgba(156,163,175,0.15)', text: '#6b7280', border: 'rgba(156,163,175,0.3)' },
    'failed':    { bg: 'rgba(239,68,68,0.12)',   text: '#dc2626', border: 'rgba(239,68,68,0.3)' },
    'passed':    { bg: 'rgba(34,197,94,0.12)',   text: '#15803d', border: 'rgba(34,197,94,0.3)' }
  };
  var statusIcon = { 'not_taken': '⏳', 'failed': '✗', 'passed': '✓' };

  var summary = { not_taken: 0, failed: 0, passed: 0 };
  myStudents.forEach(function(s) {
    var st = (s.licenseExam && s.licenseExam.status) || 'not_taken';
    summary[st] = (summary[st] || 0) + 1;
  });

  return React.createElement('div', { className: 'fade-in', style: { padding: '24px', maxWidth: 900, margin: '0 auto' } },
    // Header
    React.createElement('div', { style: { marginBottom: 24 } },
      React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937' } }, '📜 ใบประกอบวิชาชีพครู'),
      React.createElement('p', { style: { fontSize: 14, color: '#6b7280', marginTop: 4 } }, 'ติดตามสถานะสอบใบประกอบวิชาชีพครูของนักศึกษาในที่ปรึกษา')
    ),
    // Summary stats
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 } },
      React.createElement('div', { className: 'glass-card', style: { padding: '16px 20px', borderLeft: '4px solid #6b7280' } },
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'ยังไม่สอบ'),
        React.createElement('div', { style: { fontSize: 32, fontWeight: 900, color: '#1f2937' } }, summary.not_taken),
        React.createElement('div', { style: { fontSize: 12, color: '#6b7280' } }, 'คน')
      ),
      React.createElement('div', { className: 'glass-card', style: { padding: '16px 20px', borderLeft: '4px solid #ef4444' } },
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'สอบไม่ผ่าน'),
        React.createElement('div', { style: { fontSize: 32, fontWeight: 900, color: '#1f2937' } }, summary.failed),
        React.createElement('div', { style: { fontSize: 12, color: '#6b7280' } }, 'คน')
      ),
      React.createElement('div', { className: 'glass-card', style: { padding: '16px 20px', borderLeft: '4px solid #22c55e' } },
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'สอบผ่าน'),
        React.createElement('div', { style: { fontSize: 32, fontWeight: 900, color: '#1f2937' } }, summary.passed),
        React.createElement('div', { style: { fontSize: 12, color: '#6b7280' } }, 'คน')
      )
    ),
    // Student list table
    React.createElement('div', { className: 'glass-card', style: { overflow: 'hidden' } },
      React.createElement('table', { className: 'glass-table' },
        React.createElement('thead', {},
          React.createElement('tr', {},
            React.createElement('th', {}, 'รหัสนักศึกษา'),
            React.createElement('th', {}, 'ชื่อ-นามสกุล'),
            React.createElement('th', {}, 'GPAX'),
            React.createElement('th', {}, 'สถานะใบประกอบวิชาชีพ'),
            React.createElement('th', {}, 'เอกสาร')
          )
        ),
        React.createElement('tbody', {},
          myStudents.map(function(s) {
            var exam = s.licenseExam || { status: 'not_taken' };
            var st = exam.status || 'not_taken';
            var sc = statusColor[st] || statusColor['not_taken'];
            var gpax = window.Utils.calcGPAX(s.enrollments || [], courses);
            return React.createElement('tr', { key: s.id },
              React.createElement('td', {}, React.createElement('code', { style: { fontSize: 13, color: '#6b7280' } }, s.studentId)),
              React.createElement('td', { style: { fontWeight: 600 } }, s.name),
              React.createElement('td', {}, React.createElement('span', { style: { fontWeight: 700, color: parseFloat(gpax) >= 3 ? '#15803d' : parseFloat(gpax) >= 2 ? '#d97706' : '#dc2626' } }, gpax)),
              React.createElement('td', {},
                React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: sc.bg, color: sc.text, border: '1px solid ' + sc.border } },
                  statusIcon[st], statusLabel[st] || 'ยังไม่สอบ'
                )
              ),
              React.createElement('td', {},
                exam.fileUrl
                  ? React.createElement('a', { href: exam.fileUrl, target: '_blank', rel: 'noopener noreferrer', style: { fontSize: 13, color: '#be185d', textDecoration: 'underline', fontWeight: 600 } }, '📎 ดูเอกสาร')
                  : React.createElement('span', { style: { fontSize: 13, color: '#9ca3af' } }, '—')
              )
            );
          })
        )
      )
    )
  );
};

console.log('✅ Advisor views loaded');
