// ============================================================
// STUDENT VIEWS
// ============================================================

// ---- Quick Registration Input ----
window.StudentQuickInputView = function() {
  const { state, actions } = window.useApp();
  const student = state.students.find(s => s.id === state.currentUserId);
  if (!student) return null;

  const [rawText, setRawText] = React.useState('');
  const [parsedCourses, setParsedCourses] = React.useState([]);
  const [targetYear, setTargetYear] = React.useState(student.year);
  const [targetSemester, setTargetSemester] = React.useState(student.currentSemester);
  const [parseError, setParseError] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [editGrade, setEditGrade] = React.useState(null); // { courseCode, year, semester }
  const [editGradeValue, setEditGradeValue] = React.useState('กำลังเรียน');
  var [editEnrollment, setEditEnrollment] = React.useState(null); // { idx, enr }
  var [editForm, setEditForm] = React.useState(null);

  const grades = ['กำลังเรียน','A','B+','B','C+','C','D+','D','F','E','W'];

  const handleParse = () => {
    setParseError('');
    if (!rawText.trim()) { setParseError('กรุณาวางข้อความรายวิชาจากระบบทะเบียน'); return; }
    const results = window.Utils.parseRegistrationText(rawText);
    if (results.length === 0) { setParseError('ไม่สามารถอ่านรูปแบบข้อความได้ กรุณาตรวจสอบรูปแบบ'); return; }
    setParsedCourses(results);
  };

  const handleImport = () => {
    let imported = 0;
    parsedCourses.forEach(pc => {
      const existing = student.enrollments.find(e => e.courseCode === pc.code && e.year === targetYear && e.semester === targetSemester);
      if (!existing) {
        actions.addEnrollment(student.id, {
          courseCode: pc.code, year: targetYear, semester: targetSemester,
          grade: 'กำลังเรียน', type: pc.type || 'Credit'
        });
        imported++;
      }
    });
    setSuccessMsg(`นำเข้าสำเร็จ ${imported} รายวิชา`);
    setRawText('');
    setParsedCourses([]);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // All enrollments of this student (grouped by year/semester)
  const enrollmentGroups = {};
  student.enrollments.forEach(e => {
    const key = `ปีที่ ${e.year} เทอม ${e.semester}`;
    if (!enrollmentGroups[key]) enrollmentGroups[key] = [];
    enrollmentGroups[key].push(e);
  });
  const sortedGroupKeys = Object.keys(enrollmentGroups).sort();

  const handleSaveGrade = () => {
    if (!editGrade) return;
    actions.updateEnrollmentGrade(student.id, editGrade.courseCode, editGrade.year, editGrade.semester, editGradeValue);
    setEditGrade(null);
  };

  const gpax = window.Utils.calcGPAX(student.enrollments, state.courses);
  const totalEarned = window.Utils.totalEarnedCredits(student, state.courses);

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'fade-in' },
    // Header
    React.createElement('div', { style: { marginBottom: 24 } },
      React.createElement('h1', { style: { fontSize: 24, fontWeight: 800, color: '#1f2937', marginBottom: 4 } }, '📋 บันทึกรายวิชา'),
      React.createElement('p', { style: { fontSize: 14, color: '#6b7280' } }, student.name + ' | รหัส: ' + student.studentId)
    ),

    // Stats row
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 } },
      React.createElement('div', { className: 'glass-card stat-pink', style: { padding: '16px 20px' } },
        React.createElement('div', { style: { fontSize: 26, fontWeight: 800, color: '#be185d' } }, gpax),
        React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'GPAX ปัจจุบัน')
      ),
      React.createElement('div', { className: 'glass-card stat-blue', style: { padding: '16px 20px' } },
        React.createElement('div', { style: { fontSize: 26, fontWeight: 800, color: '#1d4ed8' } }, totalEarned),
        React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'หน่วยกิตสะสม')
      ),
      React.createElement('div', { className: 'glass-card stat-green', style: { padding: '16px 20px' } },
        React.createElement('div', { style: { fontSize: 26, fontWeight: 800, color: '#15803d' } }, student.enrollments.filter(e => e.grade === 'กำลังเรียน').length),
        React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'วิชากำลังเรียน')
      ),
      React.createElement('div', { className: 'glass-card stat-orange', style: { padding: '16px 20px' } },
        React.createElement('div', { style: { fontSize: 26, fontWeight: 800, color: '#c2410c' } },
          student.enrollments.filter(e => e.grade === 'E' || e.grade === 'F').length
        ),
        React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'วิชาติด E/F')
      )
    ),

    // Quick input section
    React.createElement('div', { className: 'glass-card', style: { padding: 24, marginBottom: 24 } },
      React.createElement('h2', { style: { fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 4 } }, '⚡ Quick Import จากระบบทะเบียน'),
      React.createElement('p', { style: { fontSize: 13, color: '#6b7280', marginBottom: 16 } },
        'คัดลอกรายวิชาจากระบบทะเบียนแล้ววางที่นี่เลย (รองรับรูปแบบ: รหัสวิชา  ชื่อวิชา  Credit  หน่วยกิต  Sec.)'
      ),

      // Target year/semester
      React.createElement('div', { style: { display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' } },
        React.createElement('div', {},
          React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 4, display: 'block' } }, 'บันทึกเป็นปีการศึกษา'),
          React.createElement('select', {
            className: 'glass-input', value: targetYear, onChange: e => setTargetYear(parseInt(e.target.value)),
            style: { padding: '8px 36px 8px 12px', fontSize: 14 }
          },
            [1,2,3,4].map(y => React.createElement('option', { key: y, value: y }, 'ปีที่ ' + y))
          )
        ),
        React.createElement('div', {},
          React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 4, display: 'block' } }, 'เทอม'),
          React.createElement('select', {
            className: 'glass-input', value: targetSemester, onChange: e => setTargetSemester(parseInt(e.target.value)),
            style: { padding: '8px 36px 8px 12px', fontSize: 14 }
          },
            [1,2].map(s => React.createElement('option', { key: s, value: s }, 'เทอม ' + s))
          )
        )
      ),

      React.createElement('textarea', {
        value: rawText, onChange: e => setRawText(e.target.value),
        placeholder: 'วางข้อมูลรายวิชาที่นี่...\n\nตัวอย่าง:\n4204101-1   ความเป็นครู   Credit   3   01\n4204201-1   ปรัชญาการศึกษาและจิตวิทยาสำหรับครู   Credit   3   02',
        className: 'glass-input',
        style: { width: '100%', minHeight: 140, padding: '12px 14px', fontSize: 14, fontFamily: 'monospace', resize: 'vertical', display: 'block', marginBottom: 12 }
      }),

      parseError && React.createElement('div', { style: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, color: '#dc2626', fontSize: 14 } }, '⚠️ ' + parseError),
      successMsg && React.createElement('div', { style: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, color: '#15803d', fontSize: 14 } }, '✅ ' + successMsg),

      React.createElement('div', { style: { display: 'flex', gap: 12 } },
        React.createElement('button', { className: 'btn-secondary', onClick: handleParse }, '🔍 ตรวจสอบรายวิชา'),
        parsedCourses.length > 0 && React.createElement('button', { className: 'btn-primary', onClick: handleImport }, '📥 นำเข้า ' + parsedCourses.length + ' วิชา')
      ),

      // Parsed preview
      parsedCourses.length > 0 && React.createElement('div', { style: { marginTop: 16 } },
        React.createElement('div', { style: { fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 } }, '📋 ตรวจพบรายวิชา ' + parsedCourses.length + ' วิชา:'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          parsedCourses.map((pc, i) => {
            const inCurriculum = state.courses.find(c => c.code === pc.code);
            return React.createElement('div', {
              key: i,
              style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: inCurriculum ? 'rgba(34,197,94,0.08)' : 'rgba(249,115,22,0.08)', border: '1px solid ' + (inCurriculum ? 'rgba(34,197,94,0.2)' : 'rgba(249,115,22,0.2)') }
            },
              React.createElement('code', { style: { fontSize: 12, fontWeight: 700, minWidth: 90, color: inCurriculum ? '#15803d' : '#c2410c' } }, pc.code),
              React.createElement('span', { style: { fontSize: 14, flex: 1 } }, pc.name),
              React.createElement('span', { style: { fontSize: 12, color: '#9ca3af' } }, pc.credits + ' cr'),
              inCurriculum
                ? React.createElement('span', { style: { fontSize: 12, color: '#15803d', fontWeight: 600 } }, '✓ ในหลักสูตร')
                : React.createElement('span', { style: { fontSize: 12, color: '#c2410c', fontWeight: 600 } }, '⚠ นอกหลักสูตร')
            );
          })
        )
      )
    ),

    // Enrollment history
    React.createElement('div', { className: 'glass-card', style: { padding: 24 } },
      React.createElement('h2', { style: { fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 16 } }, '📖 ประวัติการลงทะเบียน'),
      sortedGroupKeys.length === 0
        ? React.createElement('p', { style: { color: '#9ca3af', textAlign: 'center', padding: '32px 0' } }, 'ยังไม่มีข้อมูลการลงทะเบียน')
        : sortedGroupKeys.map(groupKey =>
          React.createElement('div', { key: groupKey, style: { marginBottom: 20 } },
            React.createElement('h3', { style: { fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 } },
              React.createElement('span', { style: { width: 4, height: 18, background: '#ec4899', borderRadius: 2, display: 'inline-block' } }),
              groupKey
            ),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
              enrollmentGroups[groupKey].map((enr, i) => {
                const course = state.courses.find(c => c.code === enr.courseCode);
                const status = window.Utils.getGradeStatus(enr.grade);
                const rowCls = status === 'pass' ? 'course-row-pass' : status === 'studying' ? 'course-row-studying' : status === 'fail' ? 'course-row-fail' : 'course-row-not-taken';
                const globalIndex = student.enrollments.indexOf(enr);
                return React.createElement('div', {
                  key: i,
                  className: rowCls,
                  style: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8 }
                },
                  React.createElement('code', { style: { fontSize: 12, minWidth: 90, fontWeight: 700, color: '#6b7280' } }, enr.courseCode),
                  React.createElement('span', { style: { flex: 1, fontSize: 14 } }, course ? course.name : enr.courseCode),
                  React.createElement('span', { style: { fontSize: 12, color: '#9ca3af' } }, course ? course.credits + ' cr' : ''),
                  React.createElement(window.GradeBadge, { grade: enr.grade }),
                  React.createElement('button', {
                    className: 'btn-ghost',
                    onClick: () => { setEditGrade({ courseCode: enr.courseCode, year: enr.year, semester: enr.semester }); setEditGradeValue(enr.grade); },
                    style: { padding: '4px 10px', fontSize: 12, display: 'flex', gap: 4, alignItems: 'center' }
                  },
                    React.createElement(window.Icon, { name: 'edit', size: 13 }), 'แก้เกรด'
                  ),
                  React.createElement('button', {
                    onClick: function() {
                      setEditEnrollment({ idx: globalIndex, enr: enr });
                      setEditForm({ courseCode: enr.courseCode, grade: enr.grade, year: enr.year, semester: enr.semester });
                    },
                    style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 6px', color: '#6b7280', borderRadius: 6 },
                    title: 'แก้ไข'
                  }, '✏️'),
                  React.createElement('button', {
                    onClick: function() {
                      if (!window.confirm('ลบรายวิชา ' + enr.courseCode + ' ออกจากประวัติ?')) return;
                      var newEnrollments = student.enrollments.filter(function(_, idx) { return idx !== globalIndex; });
                      actions.updateStudent(student.id, { enrollments: newEnrollments });
                    },
                    style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 6px', color: '#dc2626', borderRadius: 6 },
                    title: 'ลบ'
                  }, '🗑️')
                );
              })
            )
          )
        )
    ),

    // Edit grade modal
    React.createElement(window.Modal, {
      open: !!editGrade, onClose: () => setEditGrade(null),
      title: '✏️ อัปเดตเกรด', width: '360px'
    },
      editGrade && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        React.createElement('div', { style: { fontSize: 14, color: '#6b7280' } }, 'รหัสวิชา: ' + editGrade.courseCode),
        React.createElement('div', {},
          React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'เกรดที่ได้รับ'),
          React.createElement('select', {
            className: 'glass-input', value: editGradeValue, onChange: e => setEditGradeValue(e.target.value),
            style: { width: '100%', padding: '10px 12px', fontSize: 16, fontWeight: 700 }
          },
            grades.map(g => React.createElement('option', { key: g, value: g }, g))
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'flex-end' } },
          React.createElement('button', { className: 'btn-secondary', onClick: () => setEditGrade(null) }, 'ยกเลิก'),
          React.createElement('button', { className: 'btn-primary', onClick: handleSaveGrade }, 'บันทึก')
        )
      )
    )
  ),
    // Edit enrollment modal
    editEnrollment && editForm && React.createElement(window.Modal, {
      open: true,
      onClose: function() { setEditEnrollment(null); setEditForm(null); },
      title: '✏️ แก้ไขรายวิชา',
      width: '480px'
    },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' } },
        React.createElement('div', {},
          React.createElement('label', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4, display: 'block' } }, 'รหัสวิชา'),
          React.createElement('div', { style: { padding: '10px 12px', background: 'rgba(0,0,0,0.04)', borderRadius: 8, fontSize: 14, color: '#374151' } },
            editForm.courseCode
          )
        ),
        React.createElement('div', {},
          React.createElement('label', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4, display: 'block' } }, 'เกรด'),
          React.createElement('select', {
            className: 'glass-input',
            value: editForm.grade,
            onChange: function(e) { setEditForm(function(f) { return Object.assign({}, f, { grade: e.target.value }); }); },
            style: { width: '100%', padding: '10px 12px', fontSize: 14 }
          },
            ['กำลังเรียน','A','B+','B','C+','C','D+','D','F','E','W'].map(function(g) {
              return React.createElement('option', { key: g, value: g }, g);
            })
          )
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
          React.createElement('div', {},
            React.createElement('label', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4, display: 'block' } }, 'ปีการศึกษา'),
            React.createElement('input', {
              type: 'number', className: 'glass-input',
              value: editForm.year,
              onChange: function(e) { setEditForm(function(f) { return Object.assign({}, f, { year: parseInt(e.target.value) || f.year }); }); },
              style: { width: '100%', padding: '10px 12px', fontSize: 14 }
            })
          ),
          React.createElement('div', {},
            React.createElement('label', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4, display: 'block' } }, 'ภาคเรียน'),
            React.createElement('select', {
              className: 'glass-input',
              value: editForm.semester,
              onChange: function(e) { setEditForm(function(f) { return Object.assign({}, f, { semester: parseInt(e.target.value) }); }); },
              style: { width: '100%', padding: '10px 12px', fontSize: 14 }
            },
              [1, 2, 3].map(function(s) { return React.createElement('option', { key: s, value: s }, 'ภาคเรียนที่ ' + s); })
            )
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 } },
          React.createElement('button', { className: 'btn-secondary', onClick: function() { setEditEnrollment(null); setEditForm(null); } }, 'ยกเลิก'),
          React.createElement('button', {
            className: 'btn-primary',
            onClick: function() {
              var newEnrollments = student.enrollments.map(function(e, i) {
                return i === editEnrollment.idx ? Object.assign({}, e, editForm) : e;
              });
              actions.updateStudent(student.id, { enrollments: newEnrollments });
              setEditEnrollment(null); setEditForm(null);
            }
          }, '💾 บันทึก')
        )
      )
    )
  );
};


// ---- Curriculum Checklist ----
window.StudentChecklistView = function({ studentId: propStudentId }) {
  const { state } = window.useApp();
  const sid = propStudentId || state.currentUserId;
  const student = state.students.find(s => s.id === sid);
  if (!student) return React.createElement('div', {}, 'ไม่พบข้อมูลนักศึกษา');

  const { courses, curriculumMeta } = state;
  const statusMap = window.Utils.computeCurriculumStatus(student, courses);
  const totalEarned = window.Utils.totalEarnedCredits(student, courses);
  const gpax = window.Utils.calcGPAX(student.enrollments, courses);
  const totalRequired = curriculumMeta.totalCredits;

  const [expandedCat, setExpandedCat] = React.useState(null);
  const [printMode, setPrintMode] = React.useState(false);

  const catColorMap = {
    general: { bg: 'rgba(59,130,246,0.08)', border: '#3b82f6', text: '#1d4ed8', light: 'rgba(59,130,246,0.15)' },
    profession: { bg: 'rgba(34,197,94,0.08)', border: '#22c55e', text: '#15803d', light: 'rgba(34,197,94,0.15)' },
    major: { bg: 'rgba(168,85,247,0.08)', border: '#a855f7', text: '#7c3aed', light: 'rgba(168,85,247,0.15)' },
    major_elective: { bg: 'rgba(99,102,241,0.08)', border: '#6366f1', text: '#4338ca', light: 'rgba(99,102,241,0.15)' },
    elective: { bg: 'rgba(249,115,22,0.08)', border: '#f97316', text: '#c2410c', light: 'rgba(249,115,22,0.15)' },
  };

  const ringColors = ['blue','green','purple','indigo','orange'];

  return React.createElement('div', { className: 'fade-in' },
    // Header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', {},
        React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937', marginBottom: 2 } }, '✅ ตรวจสอบหลักสูตร'),
        React.createElement('p', { style: { fontSize: 13, color: '#6b7280' } }, student.name + ' — ' + curriculumMeta.name)
      ),
      React.createElement('button', {
        className: 'btn-secondary no-print',
        onClick: () => window.print(),
        style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }
      },
        React.createElement(window.Icon, { name: 'print', size: 16 }), 'พิมพ์'
      )
    ),

    // Summary overview
    React.createElement('div', { className: 'glass-card-dark', style: { padding: 24, marginBottom: 24 } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, alignItems: 'center' } },
        // Progress ring total
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 16 } },
          React.createElement(window.ProgressRing, {
            value: totalEarned, max: totalRequired,
            color: 'pink', size: 90,
            label: totalEarned + '/' + totalRequired,
            sublabel: 'หน่วยกิต'
          }),
          React.createElement('div', {},
            React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: '#1f2937' } }, gpax),
            React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'GPAX สะสม'),
            React.createElement('div', { style: { fontSize: 13, color: '#6b7280', marginTop: 4 } }, 'ปีที่ ' + student.year + ' เทอม ' + student.currentSemester)
          )
        ),
        // Per-category rings
        React.createElement('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' } },
          curriculumMeta.categories.map((cat, i) => {
            const cs = statusMap[cat.id];
            return React.createElement('div', { key: cat.id, style: { textAlign: 'center' } },
              React.createElement(window.ProgressRing, {
                value: cs.earnedCredits, max: cs.required,
                color: ringColors[i] || 'pink', size: 64,
                label: cs.earnedCredits + '/' + cs.required,
                sublabel: 'cr'
              }),
              React.createElement('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 4, maxWidth: 70 } }, cat.name)
            );
          })
        )
      )
    ),

    // Legend
    React.createElement('div', { className: 'no-print', style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 } },
      [
        { cls: 'course-row-pass', label: '✓ ผ่านแล้ว', color: '#22c55e' },
        { cls: 'course-row-studying', label: '📘 กำลังเรียน', color: '#3b82f6' },
        { cls: 'course-row-fail', label: '✗ ติด E/F', color: '#ef4444' },
        { cls: 'course-row-not-taken', label: '○ ยังไม่ได้เรียน', color: '#f97316' },
      ].map(item =>
        React.createElement('div', { key: item.label, style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 } },
          React.createElement('div', { style: { width: 12, height: 12, borderRadius: 3, background: item.color, opacity: 0.7 } }),
          React.createElement('span', { style: { color: '#6b7280' } }, item.label)
        )
      )
    ),

    // Teaching Practice Eligibility Card
    (() => {
      var tpCheck = window.Utils.checkTeachingPractice(student, courses);
      return React.createElement('div', { className: 'glass-card', style: { padding: '18px 20px', marginBottom: 20, border: '2px solid ' + (tpCheck.eligible ? (tpCheck.trend === 'at-risk' ? '#f59e0b' : '#22c55e') : '#ef4444') } },
        // Header row
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: tpCheck.efCourses.length > 0 ? 14 : 0 } },
          React.createElement('div', { style: { fontSize: 32 } }, tpCheck.eligible ? (tpCheck.trend === 'at-risk' ? '⚠️' : '✅') : '🚫'),
          React.createElement('div', { style: { flex: 1 } },
            React.createElement('div', { style: { fontSize: 16, fontWeight: 800, color: tpCheck.eligible ? (tpCheck.trend === 'at-risk' ? '#d97706' : '#15803d') : '#dc2626' } },
              tpCheck.eligible
                ? (tpCheck.trend === 'at-risk' ? 'มีความเสี่ยง — ต้องระวัง' : 'สามารถออกฝึกสอนได้')
                : 'ไม่สามารถออกฝึกสอนได้'
            ),
            React.createElement('div', { style: { fontSize: 13, color: '#6b7280', marginTop: 2 } },
              'มีรายวิชาที่ได้ E/F รวม ' + tpCheck.efCredits + ' หน่วยกิต ' +
              '(เกณฑ์: ไม่เกิน 8 หน่วยกิต)'
            )
          ),
          // Badge
          React.createElement('div', {
            style: {
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              background: tpCheck.eligible ? (tpCheck.trend === 'at-risk' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)') : 'rgba(239,68,68,0.15)',
              color: tpCheck.eligible ? (tpCheck.trend === 'at-risk' ? '#d97706' : '#15803d') : '#dc2626'
            }
          },
            tpCheck.trend === 'safe' ? '✓ ผ่านเกณฑ์' : tpCheck.trend === 'at-risk' ? '⚠ เสี่ยง' : '✗ ไม่ผ่านเกณฑ์'
          )
        ),
        // แสดงรายวิชาที่ E/F (ถ้ามี)
        tpCheck.efCourses.length > 0 && React.createElement('div', { style: { borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 12 } },
          React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8 } }, 'รายวิชาที่ได้ E/F:'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
            tpCheck.efCourses.map(function(c) {
              return React.createElement('div', { key: c.code, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'rgba(239,68,68,0.06)', borderRadius: 8 } },
                React.createElement('code', { style: { fontSize: 12, color: '#6b7280', minWidth: 70 } }, c.code),
                React.createElement('span', { style: { flex: 1, fontSize: 13 } }, c.name),
                React.createElement('span', { style: { fontSize: 12, color: '#6b7280' } }, c.credits + ' cr'),
                React.createElement('span', { style: { fontSize: 12, fontWeight: 700, color: '#dc2626', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 12 } }, c.grade)
              );
            })
          ),
          // Trend message
          tpCheck.trend === 'at-risk' && React.createElement('div', { style: { marginTop: 10, padding: '8px 12px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, fontSize: 13, color: '#92400e' } },
            '💡 แนวโน้ม: หากมีรายวิชา E/F เพิ่มอีก ' + (9 - tpCheck.efCredits) + ' หน่วยกิต จะไม่สามารถออกฝึกสอนได้'
          ),
          tpCheck.trend === 'ineligible' && React.createElement('div', { style: { marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, fontSize: 13, color: '#991b1b' } },
            '📋 ต้องแก้ไขรายวิชาที่ติด E/F ให้เหลือน้อยกว่า 9 หน่วยกิต จึงจะสามารถออกฝึกสอนได้'
          )
        )
      );
    })(),

    // Per-category detailed checklist
    curriculumMeta.categories.map((cat, ci) => {
      const cs = statusMap[cat.id];
      const cc = catColorMap[cat.id] || catColorMap.general;
      const isExpanded = expandedCat === cat.id || true; // always expanded for print

      const allCourses = [...cs.passCourses, ...cs.studyingCoursesList,
        ...cs.failedCourses.map(f => ({ ...f, isFail: true })),
        ...cs.notTakenCourses.map(c => ({ course: c, enrollment: null, notTaken: true }))
      ];

      return React.createElement('div', { key: cat.id, style: { marginBottom: 16 } },
        // Category header
        React.createElement('div', {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: 12, background: cs.completed ? cc.bg : 'rgba(255,255,255,0.25)', border: '1px solid ' + (cs.completed ? cc.border : 'rgba(255,255,255,0.4)'), marginBottom: cs.completed || expandedCat === cat.id ? 8 : 0, cursor: 'pointer' },
          onClick: () => setExpandedCat(expandedCat === cat.id ? null : cat.id)
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
            React.createElement('span', { style: { fontSize: 20 } }, cs.completed ? '✅' : cs.earnedCredits > 0 ? '🔄' : '○'),
            React.createElement('div', {},
              React.createElement('div', { style: { fontWeight: 700, fontSize: 16, color: '#1f2937' } }, cat.name),
              React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'ต้องการ ' + cat.requiredCredits + ' หน่วยกิต')
            )
          ),
          React.createElement('div', { style: { textAlign: 'right' } },
            React.createElement('div', { style: { fontSize: 20, fontWeight: 800, color: cc.text } }, cs.earnedCredits + '/' + cat.requiredCredits + ' cr'),
            cs.studyingCredits > 0 && React.createElement('div', { style: { fontSize: 12, color: '#3b82f6' } }, '+' + cs.studyingCredits + ' cr กำลังเรียน')
          )
        ),

        // Course list
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
          allCourses.map((item, i) => {
            const course = item.course;
            const enr = item.enrollment;
            const grade = enr ? enr.grade : null;
            const status = item.notTaken ? 'not-taken' : (item.isFail ? 'fail' : window.Utils.getGradeStatus(grade));
            const rowCls = status === 'pass' ? 'course-row-pass' : status === 'studying' ? 'course-row-studying' : status === 'fail' ? 'course-row-fail' : 'course-row-not-taken';

            return React.createElement('div', {
              key: i, className: rowCls,
              style: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 8, flexWrap: 'wrap' }
            },
              React.createElement('code', { style: { fontSize: 11, minWidth: 80, color: '#6b7280', fontWeight: 700 } }, course.code),
              React.createElement('span', { style: { flex: 1, fontSize: 14, minWidth: 140 } }, course.name),
              React.createElement('span', { style: { fontSize: 12, color: '#9ca3af' } }, course.credits + ' cr'),
              grade ? React.createElement(window.GradeBadge, { grade }) : React.createElement('span', { style: { fontSize: 13, color: '#9ca3af' } }, status === 'not-taken' ? '—' : ''),
              enr && enr.year && React.createElement('span', { style: { fontSize: 12, color: '#9ca3af' } }, 'ปี' + enr.year + '/ต' + enr.semester)
            );
          })
        )
      );
    })
  );
};


// ---- Grade Simulator ----
window.StudentSimulatorView = function() {
  const { state } = window.useApp();
  const student = state.students.find(s => s.id === state.currentUserId);
  if (!student) return null;

  const { courses } = state;
  const grades = ['A','B+','B','C+','C','D+','D','F','E'];
  const gradePoints = window.AppData.GRADE_POINTS;

  // Pending courses (not yet graded with a final grade)
  const pendingCourses = student.enrollments.filter(e => e.grade === 'กำลังเรียน').map(e => ({
    enrollment: e,
    course: courses.find(c => c.code === e.courseCode)
  })).filter(pc => pc.course);

  // Completed courses
  const completedEnrollments = student.enrollments.filter(e => e.grade !== 'กำลังเรียน');

  // Simulated grades state
  const [simGrades, setSimGrades] = React.useState(() => {
    const init = {};
    pendingCourses.forEach(pc => { init[pc.enrollment.courseCode] = 'B'; });
    return init;
  });

  // Calc current GPAX from completed
  const calcGPAX = (extraEnrollments) => {
    const allEnr = [...completedEnrollments, ...extraEnrollments];
    const latest = {};
    allEnr.forEach(e => {
      const key = e.courseCode;
      if (!latest[key] || (e.year * 10 + e.semester) > (latest[key].year * 10 + latest[key].semester)) latest[key] = e;
    });
    let totalPts = 0, totalCr = 0;
    Object.values(latest).forEach(e => {
      const gp = gradePoints[e.grade];
      if (gp === null || gp === undefined) return;
      const course = courses.find(c => c.code === e.courseCode);
      if (!course) return;
      totalPts += gp * course.credits;
      totalCr += course.credits;
    });
    return totalCr === 0 ? 0 : (totalPts / totalCr).toFixed(2);
  };

  const currentGPAX = parseFloat(window.Utils.calcGPAX(completedEnrollments, courses));
  const simExtraEnrollments = pendingCourses.map(pc => ({
    ...pc.enrollment, grade: simGrades[pc.enrollment.courseCode] || 'B'
  }));
  const simGPAX = parseFloat(calcGPAX(simExtraEnrollments));
  const diff = simGPAX - currentGPAX;

  // Semester GPA for simulated courses
  const semesterGPA = () => {
    let pts = 0, cr = 0;
    pendingCourses.forEach(pc => {
      const g = simGrades[pc.enrollment.courseCode];
      const gp = gradePoints[g];
      if (gp === null || gp === undefined) return;
      pts += gp * pc.course.credits;
      cr += pc.course.credits;
    });
    return cr === 0 ? '—' : (pts / cr).toFixed(2);
  };

  // Target GPAX calculator
  const [targetGPAX, setTargetGPAX] = React.useState('3.00');
  const totalEarnedCr = window.Utils.totalEarnedCredits(student, courses);
  const simEarnedCr = pendingCourses.reduce((sum, pc) => sum + pc.course.credits, 0);

  const calcRequiredGPA = () => {
    const target = parseFloat(targetGPAX);
    if (isNaN(target)) return null;
    const currentPts = currentGPAX * totalEarnedCr;
    const needed = (target * (totalEarnedCr + simEarnedCr) - currentPts) / simEarnedCr;
    return needed;
  };
  const requiredGPA = calcRequiredGPA();

  return React.createElement('div', { className: 'fade-in' },
    React.createElement('div', { style: { marginBottom: 24 } },
      React.createElement('h1', { style: { fontSize: 24, fontWeight: 800, color: '#1f2937', marginBottom: 4 } }, '🧮 จำลองเกรด & GPAX'),
      React.createElement('p', { style: { fontSize: 14, color: '#6b7280' } }, 'จำลองสถานการณ์เกรดเพื่อคาดการณ์ GPAX')
    ),

    // Summary cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 } },
      React.createElement('div', { className: 'glass-card stat-pink', style: { padding: '18px 20px' } },
        React.createElement('div', { style: { fontSize: 11, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase' } }, 'GPAX ปัจจุบัน'),
        React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: '#be185d' } }, currentGPAX.toFixed(2))
      ),
      React.createElement('div', { className: 'glass-card stat-blue', style: { padding: '18px 20px' } },
        React.createElement('div', { style: { fontSize: 11, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase' } }, 'GPAX จำลอง'),
        React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: '#1d4ed8' } }, simGPAX.toFixed(2)),
        diff !== 0 && React.createElement('div', { style: { fontSize: 12, color: diff > 0 ? '#15803d' : '#dc2626', fontWeight: 600 } }, (diff > 0 ? '▲ +' : '▼ ') + diff.toFixed(2))
      ),
      React.createElement('div', { className: 'glass-card stat-green', style: { padding: '18px 20px' } },
        React.createElement('div', { style: { fontSize: 11, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase' } }, 'GPA เทอมนี้ (จำลอง)'),
        React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: '#15803d' } }, semesterGPA())
      ),
      React.createElement('div', { className: 'glass-card stat-purple', style: { padding: '18px 20px' } },
        React.createElement('div', { style: { fontSize: 11, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase' } }, 'วิชาที่จำลอง'),
        React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: '#7c3aed' } }, pendingCourses.length)
      )
    ),

    pendingCourses.length === 0
      ? React.createElement('div', { className: 'glass-card', style: { padding: 32, textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: 48, marginBottom: 12 } }, '🎉'),
          React.createElement('p', { style: { color: '#6b7280', fontSize: 16 } }, 'ไม่มีวิชาที่กำลังเรียนอยู่ในขณะนี้')
        )
      : React.createElement(React.Fragment, null,
          // Sim inputs
          React.createElement('div', { className: 'glass-card', style: { padding: 24, marginBottom: 20 } },
            React.createElement('h2', { style: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1f2937' } }, '🎯 กรอกเกรดจำลองสำหรับวิชาที่กำลังเรียน'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
              pendingCourses.map((pc, i) =>
                React.createElement('div', {
                  key: i,
                  style: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: 10, flexWrap: 'wrap' }
                },
                  React.createElement('code', { style: { fontSize: 12, color: '#6b7280', minWidth: 90, fontWeight: 700 } }, pc.enrollment.courseCode),
                  React.createElement('span', { style: { flex: 1, fontSize: 14, minWidth: 150 } }, pc.course.name),
                  React.createElement('span', { style: { fontSize: 12, color: '#9ca3af' } }, pc.course.credits + ' cr'),
                  React.createElement('select', {
                    className: 'glass-input',
                    value: simGrades[pc.enrollment.courseCode] || 'B',
                    onChange: e => setSimGrades(g => ({ ...g, [pc.enrollment.courseCode]: e.target.value })),
                    style: { padding: '6px 32px 6px 10px', fontSize: 14, fontWeight: 700, minWidth: 80 }
                  },
                    grades.map(g => React.createElement('option', { key: g, value: g }, g))
                  )
                )
              )
            )
          ),

          // Target GPAX calculator
          React.createElement('div', { className: 'glass-card', style: { padding: 24 } },
            React.createElement('h2', { style: { fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#1f2937' } }, '🎯 คำนวณ GPA ที่ต้องการเพื่อให้ถึง GPAX เป้าหมาย'),
            React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' } },
              React.createElement('span', { style: { fontSize: 14, color: '#374151' } }, 'GPAX เป้าหมาย:'),
              React.createElement('input', {
                type: 'number', step: 0.01, min: 0, max: 4, value: targetGPAX,
                onChange: e => setTargetGPAX(e.target.value),
                className: 'glass-input',
                style: { width: 90, padding: '8px 12px', fontSize: 16, fontWeight: 700, textAlign: 'center' }
              }),
              requiredGPA !== null && React.createElement('div', {
                style: { padding: '10px 20px', borderRadius: 12, background: requiredGPA > 4 ? 'rgba(239,68,68,0.1)' : requiredGPA <= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)', border: '1px solid ' + (requiredGPA > 4 ? 'rgba(239,68,68,0.3)' : requiredGPA <= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)') }
              },
                requiredGPA > 4
                  ? React.createElement('span', { style: { color: '#dc2626', fontWeight: 700 } }, '❌ ไม่สามารถทำได้ในเทอมนี้ (ต้องการ GPA > 4.00)')
                  : requiredGPA <= 0
                    ? React.createElement('span', { style: { color: '#15803d', fontWeight: 700 } }, '✅ ผ่านเป้าหมายแล้ว!')
                    : React.createElement('span', { style: { color: '#1d4ed8', fontWeight: 700 } }, 'ต้องได้ GPA เทอมนี้: ' + requiredGPA.toFixed(2))
              )
            )
          )
        )
  );
};

window.StudentLicenseView = function({ student, actions }) {
  var exam = student.licenseExam || { status: 'not_taken', fileUrl: null, fileName: null };
  var [status, setStatus] = React.useState(exam.status || 'not_taken');
  var [uploading, setUploading] = React.useState(false);
  var [uploadError, setUploadError] = React.useState('');
  var [fileUrl, setFileUrl] = React.useState(exam.fileUrl || null);
  var [fileName, setFileName] = React.useState(exam.fileName || null);
  var [saveMsg, setSaveMsg] = React.useState('');
  var fileInputRef = React.useRef(null);

  var statusConfig = {
    'not_taken': { label: 'ยังไม่ได้สอบ', color: '#6b7280', bg: 'rgba(156,163,175,0.15)', border: 'rgba(156,163,175,0.3)', icon: '⏳' },
    'failed':    { label: 'สอบไม่ผ่าน',   color: '#dc2626', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   icon: '✗' },
    'passed':    { label: 'สอบผ่านแล้ว',  color: '#15803d', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)',   icon: '✓' }
  };

  var handleStatusChange = function(newStatus) {
    if (newStatus === 'passed' && !fileUrl) {
      setStatus(newStatus);
      setSaveMsg('⚠ กรุณาอัปโหลดหลักฐานการสอบผ่านก่อนบันทึก');
      return;
    }
    setSaveMsg('');
    setStatus(newStatus);
    actions.updateStudent(student.id, {
      licenseExam: {
        status: newStatus,
        fileUrl: newStatus !== 'passed' ? null : fileUrl,
        fileName: newStatus !== 'passed' ? null : fileName
      }
    });
  };

  var handleFileUpload = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    // Validate type
    var allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'application/pdf'];
    var isAllowed = allowed.indexOf(file.type) !== -1 || file.name.toLowerCase().endsWith('.pdf');
    if (!isAllowed) { setUploadError('รองรับเฉพาะไฟล์ PDF, JPG, PNG เท่านั้น'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError('ขนาดไฟล์ต้องไม่เกิน 10MB'); return; }
    var sb = actions.getSupabase ? actions.getSupabase() : null;
    if (!sb) { setUploadError('Supabase ยังไม่พร้อม กรุณาลองใหม่'); return; }
    setUploadError('');
    setUploading(true);
    var ext = file.name.split('.').pop() || 'pdf';
    var path = 'license-exams/' + student.id + '/' + Date.now() + '.' + ext;
    sb.storage.from('license-exams').upload(path, file, { upsert: true }).then(function(res) {
      setUploading(false);
      if (res.error) { setUploadError('อัปโหลดไม่สำเร็จ: ' + res.error.message); return; }
      var url = sb.storage.from('license-exams').getPublicUrl(path).data.publicUrl;
      setFileUrl(url);
      setFileName(file.name);
      setSaveMsg && setSaveMsg('');
      actions.updateStudent(student.id, {
        licenseExam: { status: 'passed', fileUrl: url, fileName: file.name }
      });
    });
  };

  var sc = statusConfig[status] || statusConfig['not_taken'];

  return React.createElement('div', { className: 'fade-in', style: { padding: '24px', maxWidth: 640, margin: '0 auto' } },
    React.createElement('div', { style: { marginBottom: 24 } },
      React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937' } }, '📜 ใบประกอบวิชาชีพครู'),
      React.createElement('p', { style: { fontSize: 14, color: '#6b7280', marginTop: 4 } }, 'อัปเดตสถานะการสอบใบอนุญาตประกอบวิชาชีพครูของคุณ')
    ),
    React.createElement('div', { className: 'glass-card', style: { padding: '20px 24px', marginBottom: 20, border: '2px solid ' + sc.border, background: sc.bg } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 14 } },
        React.createElement('div', { style: { fontSize: 40 } }, sc.icon),
        React.createElement('div', {},
          React.createElement('div', { style: { fontSize: 13, color: '#6b7280', fontWeight: 600 } }, 'สถานะปัจจุบัน'),
          React.createElement('div', { style: { fontSize: 22, fontWeight: 800, color: sc.color, marginTop: 2 } }, sc.label)
        )
      )
    ),
    React.createElement('div', { className: 'glass-card', style: { padding: '20px 24px', marginBottom: 20 } },
      React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 14 } }, 'เปลี่ยนสถานะการสอบ'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        [
          { value: 'not_taken', label: 'ยังไม่ได้สอบ', icon: '⏳', desc: 'ยังไม่ได้เข้าสอบใบอนุญาตประกอบวิชาชีพครู' },
          { value: 'failed',    label: 'สอบไม่ผ่าน',   icon: '✗',  desc: 'เข้าสอบแล้วแต่ยังไม่ผ่านเกณฑ์' },
          { value: 'passed',    label: 'สอบผ่านแล้ว',  icon: '✓',  desc: 'สอบผ่านและได้รับใบอนุญาตแล้ว (กรุณาแนบหลักฐาน)' }
        ].map(function(opt) {
          var isSelected = status === opt.value;
          var optSc = statusConfig[opt.value];
          return React.createElement('div', {
            key: opt.value,
            onClick: function() { handleStatusChange(opt.value); },
            style: {
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
              border: '2px solid ' + (isSelected ? optSc.border : 'rgba(0,0,0,0.07)'),
              background: isSelected ? optSc.bg : 'rgba(255,255,255,0.4)', transition: 'all 0.2s'
            }
          },
            React.createElement('div', { style: { fontSize: 22 } }, opt.icon),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('div', { style: { fontSize: 15, fontWeight: isSelected ? 700 : 500, color: isSelected ? optSc.color : '#374151' } }, opt.label),
              React.createElement('div', { style: { fontSize: 12, color: '#9ca3af', marginTop: 2 } }, opt.desc)
            ),
            isSelected && React.createElement('div', { style: { width: 20, height: 20, borderRadius: '50%', background: optSc.color, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement('div', { style: { width: 8, height: 8, borderRadius: '50%', background: 'white' } })
            )
          );
        })
      )
    ),
    saveMsg && React.createElement('div', { style: { marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#c2410c', fontSize: 14, fontWeight: 600 } }, saveMsg),
    status === 'passed' && React.createElement('div', { className: 'glass-card', style: { padding: '20px 24px' } },
      React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 14 } }, '📎 แนบหลักฐานการสอบผ่าน'),
      fileUrl
        ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(34,197,94,0.08)', borderRadius: 10, marginBottom: 12 } },
            React.createElement('div', { style: { fontSize: 24 } }, '✅'),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('div', { style: { fontSize: 14, fontWeight: 600, color: '#15803d' } }, 'อัปโหลดสำเร็จ'),
              React.createElement('div', { style: { fontSize: 12, color: '#6b7280' } }, fileName || 'ไฟล์หลักฐาน')
            ),
            React.createElement('a', { href: fileUrl, target: '_blank', rel: 'noopener noreferrer', className: 'btn-ghost', style: { fontSize: 13 } }, '👁 ดู')
          )
        : null,
      React.createElement('div', {
        onClick: function() { if (fileInputRef.current) fileInputRef.current.click(); },
        style: { border: '2px dashed rgba(0,0,0,0.15)', borderRadius: 12, padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(255,255,255,0.3)' }
      },
        uploading
          ? React.createElement('div', { style: { color: '#6b7280', fontSize: 14 } }, '⏳ กำลังอัปโหลด...')
          : React.createElement('div', {},
              React.createElement('div', { style: { fontSize: 28, marginBottom: 8 } }, '📤'),
              React.createElement('div', { style: { fontSize: 14, fontWeight: 600, color: '#374151' } }, fileUrl ? 'เปลี่ยนไฟล์' : 'คลิกเพื่ออัปโหลดไฟล์'),
              React.createElement('div', { style: { fontSize: 12, color: '#9ca3af', marginTop: 4 } }, 'รองรับ PDF, JPG, PNG ขนาดไม่เกิน 10MB')
            )
      ),
      React.createElement('input', {
        ref: fileInputRef, type: 'file', accept: '.pdf,image/*',
        style: { display: 'none' }, onChange: handleFileUpload
      }),
      uploadError && React.createElement('div', { style: { marginTop: 10, color: '#dc2626', fontSize: 13 } }, '⚠ ' + uploadError)
    )
  );
};

console.log('✅ Student views loaded');
