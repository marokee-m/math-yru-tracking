// ============================================================
// PLO TRACKING SYSTEM — ระบบจัดการ/ติดตามผลลัพธ์การเรียนรู้ (PLO) รายหลักสูตร
// ============================================================
//
// โครงสร้างข้อมูล
//  settings id='plo_config' (jsonb array):
//    { id, curriculumId, code, name, description, threshold(=70),
//      courses: [ { courseCode, fullMarks } ] }   // รายวิชาที่ส่งผลต่อ PLO นี้ + คะแนนเต็ม
//  ตาราง plo_scores: { id, studentId, courseCode, ploId, score, updatedAt }
//    id = studentId__courseCode__ploId  (studentId = รหัสนักศึกษา)
//
// การคิดร้อยละผ่านเกณฑ์ (นับเฉพาะวิชาที่ "เรียนแล้ว" = มีการกรอกคะแนน):
//    % = (คะแนนที่ได้รวมใน PLO จากทุกวิชาที่เรียนแล้ว) / (คะแนนเต็มรวมของวิชาเหล่านั้น) * 100
// ============================================================

window.PLOUtils = {
  admissionYear: function(studentId) {
    var s = String(studentId || '');
    return s.length >= 2 ? s.slice(0, 2) : s;
  },
  studentCurrId: function(student) {
    return (student && student.curriculumId) ? student.curriculumId : '__default__';
  },
  curriculaOptions: function(state) {
    return [{ id: '__default__', name: (state.curriculumMeta && state.curriculumMeta.name) || 'หลักสูตรหลัก' }]
      .concat(state.curricula || []);
  },
  plosOf: function(state, curriculumId) {
    return (state.ploConfig || []).filter(function(p) { return (p.curriculumId || '__default__') === curriculumId; });
  },
  coursesOf: function(state, curriculumId) {
    return (state.courses || []).filter(function(c) {
      if (curriculumId === '__default__') return !c.curriculumId || c.curriculumId === '__default__' || c.curriculumId === '';
      return c.curriculumId === curriculumId;
    });
  },
  studentsOf: function(state, curriculumId) {
    var self = this;
    return (state.students || []).filter(function(s) { return self.studentCurrId(s) === curriculumId; });
  },
  courseName: function(state, code) {
    var c = (state.courses || []).find(function(x) { return x.code === code; });
    return c ? c.name : code;
  },
  scoreId: function(studentId, courseCode, ploId) {
    return studentId + '__' + courseCode + '__' + ploId;
  },
  getScoreRow: function(scores, studentId, courseCode, ploId) {
    var id = studentId + '__' + courseCode + '__' + ploId;
    return (scores || []).find(function(x) { return x.id === id; }) || null;
  },
  // คำนวณผล PLO ของนักศึกษา 1 คน (นับเฉพาะวิชาที่มีการกรอกคะแนน)
  computePloResult: function(plo, student, scores) {
    var self = this;
    var perCourse = [];
    var earned = 0, full = 0, gradedCount = 0;
    (plo.courses || []).forEach(function(cm) {
      var row = self.getScoreRow(scores, student.studentId, cm.courseCode, plo.id);
      var graded = row !== null && row.score !== null && row.score !== undefined && row.score !== '';
      var sc = graded ? (parseFloat(row.score) || 0) : null;
      if (graded) { earned += sc; full += (parseFloat(cm.fullMarks) || 0); gradedCount++; }
      perCourse.push({ courseCode: cm.courseCode, fullMarks: parseFloat(cm.fullMarks) || 0, score: sc, graded: graded });
    });
    var percent = full > 0 ? (earned / full * 100) : null;
    var threshold = (plo.threshold === undefined || plo.threshold === null) ? 70 : plo.threshold;
    return { perCourse: perCourse, earned: earned, full: full, gradedCount: gradedCount, percent: percent, threshold: threshold, pass: percent !== null && percent >= threshold };
  },
  // ชั้นปีที่นักศึกษาเรียนวิชานี้ (จาก enrollment ล่าสุด)
  courseStudyYear: function(student, courseCode) {
    var e = window.Utils.getLatestEnrollment(student.enrollments || [], courseCode);
    return e ? e.year : null;
  },
  // พัฒนาการ PLO แยกตามชั้นปี (สะสมถึงปีนั้น)
  computeProgress: function(plo, student, scores) {
    var self = this;
    var out = [];
    [1, 2, 3, 4].forEach(function(Y) {
      var earned = 0, full = 0, n = 0;
      (plo.courses || []).forEach(function(cm) {
        var yr = self.courseStudyYear(student, cm.courseCode);
        if (yr === null || yr > Y) return;
        var row = self.getScoreRow(scores, student.studentId, cm.courseCode, plo.id);
        if (row && row.score !== null && row.score !== undefined && row.score !== '') {
          earned += parseFloat(row.score) || 0;
          full += parseFloat(cm.fullMarks) || 0;
          n++;
        }
      });
      if (full > 0) {
        var pct = earned / full * 100;
        var th = (plo.threshold === undefined || plo.threshold === null) ? 70 : plo.threshold;
        out.push({ year: Y, percent: pct, courses: n, pass: pct >= th });
      }
    });
    return out;
  }
};

// สีตามผลผ่าน/ไม่ผ่าน
function ploColor(pass, percent) {
  if (percent === null || percent === undefined) return '#9ca3af';
  return pass ? '#15803d' : '#dc2626';
}

// ── Dropdown ตัวเลือกร่วม (หลักสูตร + รหัสปีการศึกษา) ──
function CurriculumYearBar(props) {
  var state = props.state;
  var currOptions = window.PLOUtils.curriculaOptions(state);
  var studentsInCurr = window.PLOUtils.studentsOf(state, props.curriculumId);
  var years = {};
  studentsInCurr.forEach(function(s) { years[window.PLOUtils.admissionYear(s.studentId)] = true; });
  var yearList = Object.keys(years).sort();
  var selStyle = { padding: '9px 12px', fontSize: 14, boxSizing: 'border-box', minWidth: 160 };
  return React.createElement('div', { className: 'no-print', style: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' } },
    React.createElement('select', { className: 'glass-input', style: selStyle, value: props.curriculumId, onChange: function(e) { props.onCurriculum(e.target.value); } },
      currOptions.map(function(c) { return React.createElement('option', { key: c.id, value: c.id }, '📚 ' + c.name); })
    ),
    props.showYear !== false && React.createElement('select', { className: 'glass-input', style: selStyle, value: props.year, onChange: function(e) { props.onYear(e.target.value); } },
      React.createElement('option', { value: 'all' }, 'ทุกรหัสปีการศึกษา'),
      yearList.map(function(y) { return React.createElement('option', { key: y, value: y }, 'รหัส ' + y); })
    ),
    props.children
  );
}

// ============================================================
// ADMIN — จัดการ PLO
// ============================================================
window.AdminPLOView = function() {
  var ctx = window.useApp();
  var state = ctx.state; var actions = ctx.actions;

  var [currId, setCurrId] = React.useState('__default__');
  var [showPloModal, setShowPloModal] = React.useState(false);
  var [editingPlo, setEditingPlo] = React.useState(null);
  var [ploForm, setPloForm] = React.useState({ code: '', name: '', description: '', threshold: 70 });
  var [confirmDel, setConfirmDel] = React.useState(null);
  var [courseModal, setCourseModal] = React.useState(null); // { plo, courseCode, fullMarks }

  var plos = window.PLOUtils.plosOf(state, currId);
  var courses = window.PLOUtils.coursesOf(state, currId);
  var currOptions = window.PLOUtils.curriculaOptions(state);

  var labelStyle = { fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4, display: 'block' };
  var inputStyle = { width: '100%', padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' };

  var openAddPlo = function() { setEditingPlo(null); setPloForm({ code: '', name: '', description: '', threshold: 70 }); setShowPloModal(true); };
  var openEditPlo = function(p) { setEditingPlo(p); setPloForm({ code: p.code || '', name: p.name || '', description: p.description || '', threshold: p.threshold === undefined ? 70 : p.threshold }); setShowPloModal(true); };

  var savePlo = function() {
    if (!ploForm.code.trim() || !ploForm.name.trim()) { alert('กรุณากรอกรหัสและชื่อ PLO'); return; }
    var th = parseInt(ploForm.threshold); if (isNaN(th)) th = 70;
    if (editingPlo) {
      actions.updatePlo(editingPlo.id, { code: ploForm.code.trim(), name: ploForm.name.trim(), description: ploForm.description, threshold: th });
    } else {
      actions.addPlo({ id: 'plo_' + Date.now(), curriculumId: currId, code: ploForm.code.trim(), name: ploForm.name.trim(), description: ploForm.description, threshold: th, courses: [] });
    }
    setShowPloModal(false);
  };

  // ผลรวมคะแนนเต็มของรายวิชาหนึ่ง across PLOs ในหลักสูตรเดียวกัน (ยกเว้น PLO ที่ระบุ)
  var courseTotalExcept = function(courseCode, exceptPloId) {
    var total = 0;
    plos.forEach(function(p) {
      if (p.id === exceptPloId) return;
      (p.courses || []).forEach(function(cm) { if (cm.courseCode === courseCode) total += parseFloat(cm.fullMarks) || 0; });
    });
    return total;
  };

  var saveCourseMapping = function() {
    var cm = courseModal; if (!cm) return;
    if (!cm.courseCode) { alert('กรุณาเลือกรายวิชา'); return; }
    var marks = parseFloat(cm.fullMarks); if (isNaN(marks) || marks <= 0) { alert('กรุณากรอกคะแนนเต็ม (> 0)'); return; }
    var other = courseTotalExcept(cm.courseCode, cm.plo.id);
    if (other + marks > 100) { alert('คะแนนรวมของรายวิชานี้ในทุก PLO ต้องไม่เกิน 100\nขณะนี้ PLO อื่นใช้ไปแล้ว ' + other + ' คะแนน (ใส่ได้อีกไม่เกิน ' + (100 - other) + ')'); return; }
    var plo = state.ploConfig.find(function(p) { return p.id === cm.plo.id; }) || cm.plo;
    var newCourses = (plo.courses || []).filter(function(x) { return x.courseCode !== cm.courseCode; }).concat([{ courseCode: cm.courseCode, fullMarks: marks }]);
    actions.updatePlo(plo.id, { courses: newCourses });
    setCourseModal(null);
  };

  var removeCourseMapping = function(plo, courseCode) {
    var newCourses = (plo.courses || []).filter(function(x) { return x.courseCode !== courseCode; });
    actions.updatePlo(plo.id, { courses: newCourses });
  };

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'fade-in', style: { padding: '8px 4px', maxWidth: 1000, margin: '0 auto' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 } },
        React.createElement('div', {},
          React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937' } }, '🎯 จัดการ PLO'),
          React.createElement('p', { style: { fontSize: 13, color: '#6b7280', marginTop: 4 } }, 'ผลลัพธ์การเรียนรู้ระดับหลักสูตร (Program Learning Outcomes)')
        ),
        React.createElement('button', { className: 'btn-primary', onClick: openAddPlo }, '+ เพิ่ม PLO')
      ),
      // Curriculum selector
      React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 } },
        currOptions.map(function(c) {
          var sel = currId === c.id;
          return React.createElement('button', {
            key: c.id, onClick: function() { setCurrId(c.id); },
            style: { padding: '8px 18px', borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sarabun,sans-serif', background: sel ? 'linear-gradient(135deg,#e91e8c,#f06292)' : 'rgba(255,255,255,0.5)', color: sel ? 'white' : '#374151', border: '1px solid ' + (sel ? 'transparent' : 'rgba(0,0,0,0.1)') }
          }, c.name);
        })
      ),
      // PLO list
      plos.length === 0
        ? React.createElement('div', { className: 'glass-card', style: { padding: '40px', textAlign: 'center', color: '#9ca3af' } }, 'ยังไม่มี PLO ในหลักสูตรนี้ — กด "เพิ่ม PLO" เพื่อเริ่มต้น')
        : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
            plos.map(function(plo) {
              var sumFull = (plo.courses || []).reduce(function(a, c) { return a + (parseFloat(c.fullMarks) || 0); }, 0);
              return React.createElement('div', { key: plo.id, className: 'glass-card', style: { padding: '18px 20px' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' } },
                  React.createElement('div', { style: { flex: '1 1 240px', minWidth: 0 } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                      React.createElement('span', { style: { fontSize: 12, fontWeight: 800, color: '#be185d', background: 'rgba(219,39,119,0.1)', padding: '3px 10px', borderRadius: 8 } }, plo.code),
                      React.createElement('span', { style: { fontSize: 16, fontWeight: 700, color: '#1f2937' } }, plo.name)
                    ),
                    plo.description && React.createElement('div', { style: { fontSize: 13, color: '#6b7280', marginTop: 6 } }, plo.description)
                  ),
                  React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 } },
                    React.createElement('span', { style: { fontSize: 12, fontWeight: 700, color: '#0369a1', background: 'rgba(3,105,161,0.1)', padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap' } }, 'เกณฑ์ผ่าน ' + (plo.threshold === undefined ? 70 : plo.threshold) + '%'),
                    React.createElement('button', { className: 'btn-ghost', style: { padding: '5px 10px', fontSize: 12 }, onClick: function() { openEditPlo(plo); } }, '✏️'),
                    React.createElement('button', { className: 'btn-danger', style: { padding: '5px 10px', fontSize: 12 }, onClick: function() { setConfirmDel(plo); } }, '🗑️')
                  )
                ),
                // course mappings
                React.createElement('div', { style: { marginTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 12 } },
                  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 } },
                    React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: '#374151' } }, '📘 รายวิชาที่ส่งผลต่อ PLO นี้ (คะแนนเต็มรวม ' + sumFull + ')'),
                    React.createElement('button', { className: 'btn-secondary', style: { padding: '6px 12px', fontSize: 13 }, onClick: function() { setCourseModal({ plo: plo, courseCode: '', fullMarks: '' }); } }, '+ เพิ่มรายวิชา')
                  ),
                  (plo.courses || []).length === 0
                    ? React.createElement('div', { style: { fontSize: 13, color: '#9ca3af', padding: '8px 0' } }, 'ยังไม่มีรายวิชา')
                    : React.createElement('div', { style: { overflowX: 'auto' } },
                        React.createElement('table', { className: 'glass-table', style: { minWidth: 420 } },
                          React.createElement('thead', {}, React.createElement('tr', {},
                            React.createElement('th', {}, 'รหัสวิชา'),
                            React.createElement('th', {}, 'ชื่อวิชา'),
                            React.createElement('th', { style: { textAlign: 'center' } }, 'คะแนนเต็ม'),
                            React.createElement('th', { style: { width: 60 } }, '')
                          )),
                          React.createElement('tbody', {},
                            (plo.courses || []).map(function(cm) {
                              return React.createElement('tr', { key: cm.courseCode },
                                React.createElement('td', {}, React.createElement('code', { style: { fontSize: 12 } }, cm.courseCode)),
                                React.createElement('td', { style: { fontSize: 14 } }, window.PLOUtils.courseName(state, cm.courseCode)),
                                React.createElement('td', { style: { textAlign: 'center', fontWeight: 700 } }, cm.fullMarks),
                                React.createElement('td', {}, React.createElement('button', { className: 'btn-danger', style: { padding: '4px 9px', fontSize: 12 }, onClick: function() { removeCourseMapping(plo, cm.courseCode); } }, '✕'))
                              );
                            })
                          )
                        )
                      )
                )
              );
            })
          )
    ),
    // PLO add/edit modal
    React.createElement(window.Modal, { open: showPloModal, onClose: function() { setShowPloModal(false); }, title: editingPlo ? '✏️ แก้ไข PLO' : '➕ เพิ่ม PLO', width: '480px' },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 } },
          React.createElement('div', {}, React.createElement('label', { style: labelStyle }, 'รหัส PLO *'),
            React.createElement('input', { className: 'glass-input', style: inputStyle, placeholder: 'PLO1', value: ploForm.code, onChange: function(e) { setPloForm(Object.assign({}, ploForm, { code: e.target.value })); } })),
          React.createElement('div', {}, React.createElement('label', { style: labelStyle }, 'ชื่อ PLO *'),
            React.createElement('input', { className: 'glass-input', style: inputStyle, placeholder: 'เช่น สามารถออกแบบการเรียนรู้ได้', value: ploForm.name, onChange: function(e) { setPloForm(Object.assign({}, ploForm, { name: e.target.value })); } }))
        ),
        React.createElement('div', {}, React.createElement('label', { style: labelStyle }, 'คำอธิบาย'),
          React.createElement('textarea', { className: 'glass-input', style: Object.assign({}, inputStyle, { minHeight: 60, resize: 'vertical' }), value: ploForm.description, onChange: function(e) { setPloForm(Object.assign({}, ploForm, { description: e.target.value })); } })),
        React.createElement('div', {}, React.createElement('label', { style: labelStyle }, 'เกณฑ์การผ่าน (ร้อยละ)'),
          React.createElement('input', { type: 'number', min: 0, max: 100, className: 'glass-input', style: inputStyle, value: ploForm.threshold, onChange: function(e) { setPloForm(Object.assign({}, ploForm, { threshold: e.target.value })); } })),
        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
          React.createElement('button', { className: 'btn-secondary', onClick: function() { setShowPloModal(false); } }, 'ยกเลิก'),
          React.createElement('button', { className: 'btn-primary', onClick: savePlo }, '💾 บันทึก')
        )
      )
    ),
    // course mapping modal
    React.createElement(window.Modal, { open: !!courseModal, onClose: function() { setCourseModal(null); }, title: '📘 เพิ่มรายวิชาที่ส่งผลต่อ PLO', width: '460px' },
      courseModal && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'PLO: ', React.createElement('b', {}, courseModal.plo.code + ' ' + courseModal.plo.name)),
        React.createElement('div', {}, React.createElement('label', { style: labelStyle }, 'รายวิชา *'),
          React.createElement('select', { className: 'glass-input', style: inputStyle, value: courseModal.courseCode, onChange: function(e) { setCourseModal(Object.assign({}, courseModal, { courseCode: e.target.value })); } },
            React.createElement('option', { value: '' }, '-- เลือกรายวิชา --'),
            courses.map(function(c) { return React.createElement('option', { key: c.code, value: c.code }, c.code + ' — ' + c.name); })
          )
        ),
        React.createElement('div', {}, React.createElement('label', { style: labelStyle }, 'คะแนนเต็มที่วิชานี้ส่งให้ PLO นี้ *'),
          React.createElement('input', { type: 'number', min: 1, className: 'glass-input', style: inputStyle, placeholder: 'เช่น 70', value: courseModal.fullMarks, onChange: function(e) { setCourseModal(Object.assign({}, courseModal, { fullMarks: e.target.value })); } }),
          courseModal.courseCode && React.createElement('div', { style: { fontSize: 12, color: '#9ca3af', marginTop: 4 } }, 'วิชานี้ถูกใช้ใน PLO อื่นแล้ว ' + courseTotalExcept(courseModal.courseCode, courseModal.plo.id) + ' คะแนน (รวมทุก PLO ไม่เกิน 100)')
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
          React.createElement('button', { className: 'btn-secondary', onClick: function() { setCourseModal(null); } }, 'ยกเลิก'),
          React.createElement('button', { className: 'btn-primary', onClick: saveCourseMapping }, '💾 บันทึก')
        )
      )
    ),
    React.createElement(window.ConfirmDialog, {
      open: !!confirmDel, title: 'ลบ PLO',
      message: confirmDel ? 'ต้องการลบ "' + confirmDel.code + ' ' + confirmDel.name + '" ใช่หรือไม่? (คะแนนที่กรอกไว้จะยังอยู่แต่จะไม่ถูกนำมาคิด)' : '',
      onConfirm: function() { actions.deletePlo(confirmDel.id); setConfirmDel(null); }, onCancel: function() { setConfirmDel(null); }
    })
  );
};

// ============================================================
// องค์ประกอบร่วม: ตารางสรุปผล PLO (ใช้ทั้งอาจารย์และนักศึกษา)
// ============================================================
function PLOSummaryTables(props) {
  var state = props.state;
  var plos = props.plos;
  var students = props.students;
  var scores = state.ploScores || [];
  if (plos.length === 0) return React.createElement('div', { className: 'glass-card', style: { padding: 32, textAlign: 'center', color: '#9ca3af' } }, 'ยังไม่มี PLO ในหลักสูตรนี้');
  if (students.length === 0) return React.createElement('div', { className: 'glass-card', style: { padding: 32, textAlign: 'center', color: '#9ca3af' } }, 'ไม่พบนักศึกษาตามเงื่อนไข');

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
    plos.map(function(plo) {
      var cms = plo.courses || [];
      return React.createElement('div', { key: plo.id, className: 'glass-card', style: { padding: '16px 18px' } },
        React.createElement('div', { style: { fontSize: 15, fontWeight: 800, color: '#be185d', marginBottom: 10 } },
          plo.code + ' — ' + plo.name + '  ', React.createElement('span', { style: { fontSize: 12, fontWeight: 600, color: '#0369a1' } }, '(เกณฑ์ ' + (plo.threshold === undefined ? 70 : plo.threshold) + '%)')
        ),
        cms.length === 0
          ? React.createElement('div', { style: { fontSize: 13, color: '#9ca3af' } }, 'ยังไม่ได้กำหนดรายวิชาให้ PLO นี้')
          : React.createElement('div', { style: { overflowX: 'auto' } },
              React.createElement('table', { className: 'glass-table', style: { minWidth: 480 } },
                React.createElement('thead', {},
                  React.createElement('tr', {},
                    [React.createElement('th', { key: '_c' }, 'รหัส/ชื่อ นศ.')]
                      .concat(cms.map(function(cm) { return React.createElement('th', { key: cm.courseCode, style: { textAlign: 'center' } }, React.createElement('div', {}, cm.courseCode), React.createElement('div', { style: { fontSize: 10, fontWeight: 400, color: '#9ca3af' } }, 'เต็ม ' + cm.fullMarks)); }))
                      .concat([
                        React.createElement('th', { key: '_sum', style: { textAlign: 'center' } }, 'รวม'),
                        React.createElement('th', { key: '_pct', style: { textAlign: 'center' } }, 'ร้อยละ'),
                        React.createElement('th', { key: '_res', style: { textAlign: 'center' } }, 'ผล')
                      ])
                  )
                ),
                React.createElement('tbody', {},
                  students.map(function(stu) {
                    var r = window.PLOUtils.computePloResult(plo, stu, scores);
                    return React.createElement('tr', { key: stu.id },
                      [React.createElement('td', { key: '_n' },
                        React.createElement('div', { style: { fontSize: 13, fontWeight: 600 } }, stu.name),
                        React.createElement('code', { style: { fontSize: 11, color: '#9ca3af' } }, stu.studentId)
                      )].concat(r.perCourse.map(function(pc, i) {
                        return React.createElement('td', { key: i, style: { textAlign: 'center', fontSize: 13, color: pc.graded ? '#374151' : '#cbd5e1' } }, pc.graded ? (pc.score + '/' + pc.fullMarks) : '–');
                      })).concat([
                        React.createElement('td', { key: '_sum', style: { textAlign: 'center', fontWeight: 700 } }, r.full > 0 ? (r.earned + '/' + r.full) : '–'),
                        React.createElement('td', { key: '_pct', style: { textAlign: 'center', fontWeight: 800, color: ploColor(r.pass, r.percent) } }, r.percent === null ? '–' : r.percent.toFixed(1) + '%'),
                        React.createElement('td', { key: '_res', style: { textAlign: 'center' } }, r.percent === null
                          ? React.createElement('span', { style: { fontSize: 12, color: '#9ca3af' } }, 'ยังไม่มีข้อมูล')
                          : React.createElement('span', { className: 'badge ' + (r.pass ? 'badge-pass' : 'badge-fail') }, r.pass ? 'ผ่าน' : 'ไม่ผ่าน'))
                      ])
                    );
                  })
                )
              )
            )
      );
    })
  );
}

// ============================================================
// องค์ประกอบร่วม: พัฒนาการ PLO ของนักศึกษา 1 คน แยกตามชั้นปี
// ============================================================
function PLOProgress(props) {
  var state = props.state; var student = props.student; var plos = props.plos;
  var scores = state.ploScores || [];
  if (!student) return React.createElement('div', { className: 'glass-card', style: { padding: 32, textAlign: 'center', color: '#9ca3af' } }, 'กรุณาเลือกนักศึกษา');
  if (plos.length === 0) return React.createElement('div', { className: 'glass-card', style: { padding: 32, textAlign: 'center', color: '#9ca3af' } }, 'ยังไม่มี PLO');

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
    React.createElement('div', { style: { fontSize: 14, color: '#6b7280' } }, 'นักศึกษา: ', React.createElement('b', { style: { color: '#1f2937' } }, student.name + ' (' + student.studentId + ')')),
    plos.map(function(plo) {
      var prog = window.PLOUtils.computeProgress(plo, student, scores);
      return React.createElement('div', { key: plo.id, className: 'glass-card', style: { padding: '16px 18px' } },
        React.createElement('div', { style: { fontSize: 15, fontWeight: 800, color: '#be185d', marginBottom: 12 } }, plo.code + ' — ' + plo.name),
        prog.length === 0
          ? React.createElement('div', { style: { fontSize: 13, color: '#9ca3af' } }, 'ยังไม่มีคะแนนที่กรอกสำหรับ PLO นี้')
          : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
              prog.map(function(pt) {
                return React.createElement('div', { key: pt.year, style: { display: 'flex', alignItems: 'center', gap: 10 } },
                  React.createElement('div', { style: { width: 54, fontSize: 13, color: '#6b7280', flexShrink: 0 } }, 'ปี ' + pt.year),
                  React.createElement('div', { style: { flex: 1, height: 22, background: 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'hidden', position: 'relative' } },
                    React.createElement('div', { style: { width: Math.min(100, pt.percent) + '%', height: '100%', borderRadius: 99, background: pt.pass ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#f59e0b,#ef4444)', transition: 'width 0.6s ease' } })
                  ),
                  React.createElement('div', { style: { width: 96, textAlign: 'right', fontSize: 13, fontWeight: 700, color: ploColor(pt.pass, pt.percent), flexShrink: 0 } }, pt.percent.toFixed(1) + '% ' + (pt.pass ? '✓' : ''))
                );
              })
            )
      );
    })
  );
}

// ============================================================
// ADVISOR — ติดตาม PLO (กรอกคะแนน / สรุปผล / พัฒนาการ)
// ============================================================
window.AdvisorPLOView = function() {
  var ctx = window.useApp();
  var state = ctx.state; var actions = ctx.actions;

  var [tab, setTab] = React.useState('entry');
  var [currId, setCurrId] = React.useState('__default__');
  var [year, setYear] = React.useState('all');

  var plos = window.PLOUtils.plosOf(state, currId);
  var studentsInCurr = window.PLOUtils.studentsOf(state, currId);
  var filteredStudents = year === 'all' ? studentsInCurr : studentsInCurr.filter(function(s) { return window.PLOUtils.admissionYear(s.studentId) === year; });

  // ── Tab: กรอกคะแนน ──
  var coursesWithPlo = {};
  plos.forEach(function(p) { (p.courses || []).forEach(function(cm) { coursesWithPlo[cm.courseCode] = true; }); });
  var courseList = Object.keys(coursesWithPlo);
  var [selCourse, setSelCourse] = React.useState('');
  var [grid, setGrid] = React.useState({});
  var [savingGrid, setSavingGrid] = React.useState(false);
  var [gridMsg, setGridMsg] = React.useState('');

  // PLOs ที่วิชานี้ส่งผล + คะแนนเต็มของวิชานี้ในแต่ละ PLO
  var coursePlos = selCourse ? plos.filter(function(p) { return (p.courses || []).some(function(cm) { return cm.courseCode === selCourse; }); }) : [];
  var courseFullMark = function(plo) { var cm = (plo.courses || []).find(function(x) { return x.courseCode === selCourse; }); return cm ? (parseFloat(cm.fullMarks) || 0) : 0; };

  // นักศึกษาที่ลงทะเบียนวิชานี้ (+ กรองรหัสปี)
  var entryStudents = selCourse ? filteredStudents.filter(function(s) { return (s.enrollments || []).some(function(e) { return e.courseCode === selCourse; }); }) : [];

  React.useEffect(function() {
    if (!selCourse) { setGrid({}); return; }
    var g = {};
    entryStudents.forEach(function(stu) {
      coursePlos.forEach(function(plo) {
        var row = window.PLOUtils.getScoreRow(state.ploScores, stu.studentId, selCourse, plo.id);
        if (row && row.score !== null && row.score !== undefined) g[stu.studentId + '__' + plo.id] = String(row.score);
      });
    });
    setGrid(g);
    setGridMsg('');
  }, [selCourse, currId, year]);

  var saveGrid = function() {
    var upserts = [], deleteIds = [], errors = [];
    entryStudents.forEach(function(stu) {
      coursePlos.forEach(function(plo) {
        var key = stu.studentId + '__' + plo.id;
        var raw = grid[key];
        var id = window.PLOUtils.scoreId(stu.studentId, selCourse, plo.id);
        var existed = !!window.PLOUtils.getScoreRow(state.ploScores, stu.studentId, selCourse, plo.id);
        if (raw === undefined || raw === null || String(raw).trim() === '') { if (existed) deleteIds.push(id); return; }
        var v = parseFloat(raw);
        var full = courseFullMark(plo);
        if (isNaN(v) || v < 0) { errors.push(stu.studentId + ' / ' + plo.code + ': คะแนนไม่ถูกต้อง'); return; }
        if (v > full) { errors.push(stu.studentId + ' / ' + plo.code + ': เกินคะแนนเต็ม (' + full + ')'); return; }
        upserts.push({ id: id, studentId: stu.studentId, courseCode: selCourse, ploId: plo.id, score: v, updatedAt: new Date().toISOString() });
      });
    });
    if (errors.length) { setGridMsg('⚠ ' + errors.join(' | ')); return; }
    setSavingGrid(true); setGridMsg('');
    actions.commitPloScores(upserts, deleteIds).then(function() {
      setSavingGrid(false); setGridMsg('✅ บันทึกคะแนนเรียบร้อย (' + upserts.length + ' รายการ)');
      setTimeout(function() { setGridMsg(''); }, 3000);
    }).catch(function(e) { setSavingGrid(false); setGridMsg('⚠ บันทึกไม่สำเร็จ: ' + (e && e.message ? e.message : '')); });
  };

  // ── Tab: พัฒนาการ ──
  var [progStudentId, setProgStudentId] = React.useState('');
  var progStudent = filteredStudents.find(function(s) { return s.id === progStudentId; }) || null;

  var tabs = [{ k: 'entry', t: '✍️ กรอกคะแนน' }, { k: 'summary', t: '📊 สรุปผล' }, { k: 'progress', t: '📈 พัฒนาการ' }];
  var selStyle = { padding: '9px 12px', fontSize: 14, boxSizing: 'border-box', minWidth: 160 };

  return React.createElement('div', { className: 'fade-in', style: { padding: '8px 4px', maxWidth: 1100, margin: '0 auto' } },
    React.createElement('div', { className: 'no-print', style: { marginBottom: 16 } },
      React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937', marginBottom: 4 } }, '🎯 ติดตาม PLO'),
      React.createElement('p', { style: { fontSize: 13, color: '#6b7280' } }, 'บันทึกคะแนน / สรุปผล / พัฒนาการ ผลลัพธ์การเรียนรู้ระดับหลักสูตร')
    ),
    // tabs
    React.createElement('div', { className: 'no-print', style: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' } },
      tabs.map(function(t) {
        var sel = tab === t.k;
        return React.createElement('button', { key: t.k, onClick: function() { setTab(t.k); },
          style: { padding: '9px 18px', borderRadius: 12, fontFamily: 'Sarabun,sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', background: sel ? 'linear-gradient(135deg,#e91e8c,#f06292)' : 'rgba(255,255,255,0.5)', color: sel ? 'white' : '#4b5563', border: '1px solid rgba(255,255,255,0.5)' } }, t.t);
      })
    ),
    CurriculumYearBar({ state: state, curriculumId: currId, onCurriculum: function(v) { setCurrId(v); setSelCourse(''); setProgStudentId(''); }, year: year, onYear: setYear, showYear: tab !== 'entry' ? true : true }),

    // ENTRY
    tab === 'entry' && React.createElement('div', {},
      React.createElement('div', { className: 'no-print', style: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 } },
        React.createElement('select', { className: 'glass-input', style: selStyle, value: selCourse, onChange: function(e) { setSelCourse(e.target.value); } },
          React.createElement('option', { value: '' }, '-- เลือกรายวิชา --'),
          courseList.map(function(code) { return React.createElement('option', { key: code, value: code }, code + ' — ' + window.PLOUtils.courseName(state, code)); })
        ),
        selCourse && React.createElement('button', { className: 'btn-primary', disabled: savingGrid, onClick: saveGrid }, savingGrid ? '⏳ กำลังบันทึก...' : '💾 บันทึกคะแนน')
      ),
      gridMsg && React.createElement('div', { style: { fontSize: 13, marginBottom: 12, color: gridMsg.indexOf('✅') === 0 ? '#15803d' : '#dc2626' } }, gridMsg),
      !selCourse
        ? React.createElement('div', { className: 'glass-card', style: { padding: 32, textAlign: 'center', color: '#9ca3af' } }, courseList.length === 0 ? 'ยังไม่มีรายวิชาที่ผูกกับ PLO ในหลักสูตรนี้ (ให้ผู้ดูแลกำหนดใน "จัดการ PLO")' : 'เลือกรายวิชาเพื่อกรอกคะแนน')
        : entryStudents.length === 0
          ? React.createElement('div', { className: 'glass-card', style: { padding: 32, textAlign: 'center', color: '#9ca3af' } }, 'ไม่พบนักศึกษาที่ลงทะเบียนวิชานี้ (ตามรหัสปีที่เลือก)')
          : React.createElement('div', { className: 'glass-card', style: { overflowX: 'auto', padding: 0 } },
              React.createElement('table', { className: 'glass-table', style: { minWidth: 480 } },
                React.createElement('thead', {}, React.createElement('tr', {},
                  [React.createElement('th', { key: '_n' }, 'รหัส/ชื่อ นศ.')].concat(coursePlos.map(function(plo) {
                    return React.createElement('th', { key: plo.id, style: { textAlign: 'center' } }, React.createElement('div', {}, plo.code), React.createElement('div', { style: { fontSize: 10, fontWeight: 400, color: '#9ca3af' } }, 'เต็ม ' + courseFullMark(plo)));
                  }))
                )),
                React.createElement('tbody', {},
                  entryStudents.map(function(stu) {
                    return React.createElement('tr', { key: stu.id },
                      [React.createElement('td', { key: '_n' }, React.createElement('div', { style: { fontSize: 13, fontWeight: 600 } }, stu.name), React.createElement('code', { style: { fontSize: 11, color: '#9ca3af' } }, stu.studentId))]
                        .concat(coursePlos.map(function(plo) {
                          var key = stu.studentId + '__' + plo.id;
                          return React.createElement('td', { key: plo.id, style: { textAlign: 'center' } },
                            React.createElement('input', { type: 'number', min: 0, max: courseFullMark(plo), className: 'glass-input', style: { width: 76, padding: '6px 8px', fontSize: 13, textAlign: 'center', boxSizing: 'border-box' }, value: grid[key] === undefined ? '' : grid[key], onChange: function(e) { var v = e.target.value; setGrid(function(g) { var n = Object.assign({}, g); n[key] = v; return n; }); } })
                          );
                        }))
                    );
                  })
                )
              )
            )
    ),

    // SUMMARY
    tab === 'summary' && React.createElement('div', {},
      React.createElement('div', { className: 'no-print', style: { marginBottom: 12 } },
        React.createElement('button', { className: 'btn-secondary', onClick: function() { window.print(); } }, '🖨️ พิมพ์ / บันทึก PDF')
      ),
      React.createElement('div', { style: { fontSize: 13, color: '#6b7280', marginBottom: 12 } }, 'หลักสูตร: ' + (window.PLOUtils.curriculaOptions(state).find(function(c) { return c.id === currId; }) || {}).name + (year !== 'all' ? ' • รหัส ' + year : '') + ' • นักศึกษา ' + filteredStudents.length + ' คน'),
      React.createElement(PLOSummaryTables, { state: state, plos: plos, students: filteredStudents })
    ),

    // PROGRESS
    tab === 'progress' && React.createElement('div', {},
      React.createElement('div', { className: 'no-print', style: { marginBottom: 14 } },
        React.createElement('select', { className: 'glass-input', style: selStyle, value: progStudentId, onChange: function(e) { setProgStudentId(e.target.value); } },
          React.createElement('option', { value: '' }, '-- เลือกนักศึกษา --'),
          filteredStudents.map(function(s) { return React.createElement('option', { key: s.id, value: s.id }, s.studentId + ' — ' + s.name); })
        )
      ),
      React.createElement(PLOProgress, { state: state, student: progStudent, plos: plos })
    )
  );
};

// ============================================================
// STUDENT — PLO ของฉัน (สรุปผล / พัฒนาการ)
// ============================================================
window.StudentPLOView = function() {
  var ctx = window.useApp();
  var state = ctx.state;
  var student = (state.students || []).find(function(s) { return s.id === state.currentUserId; });
  var [tab, setTab] = React.useState('summary');

  if (!student) return React.createElement('div', { className: 'glass-card', style: { padding: 32, textAlign: 'center', color: '#9ca3af', margin: '20px auto', maxWidth: 500 } }, 'ไม่พบข้อมูลนักศึกษา');

  var currId = window.PLOUtils.studentCurrId(student);
  var plos = window.PLOUtils.plosOf(state, currId);
  var tabs = [{ k: 'summary', t: '📊 สรุปผล' }, { k: 'progress', t: '📈 พัฒนาการ' }];

  return React.createElement('div', { className: 'fade-in', style: { padding: '8px 4px', maxWidth: 1000, margin: '0 auto' } },
    React.createElement('div', { className: 'no-print', style: { marginBottom: 14 } },
      React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937', marginBottom: 4 } }, '🎯 PLO ของฉัน'),
      React.createElement('p', { style: { fontSize: 13, color: '#6b7280' } }, 'ผลลัพธ์การเรียนรู้ระดับหลักสูตรของ ' + student.name)
    ),
    React.createElement('div', { className: 'no-print', style: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' } },
      tabs.map(function(t) {
        var sel = tab === t.k;
        return React.createElement('button', { key: t.k, onClick: function() { setTab(t.k); },
          style: { padding: '9px 18px', borderRadius: 12, fontFamily: 'Sarabun,sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', background: sel ? 'linear-gradient(135deg,#e91e8c,#f06292)' : 'rgba(255,255,255,0.5)', color: sel ? 'white' : '#4b5563', border: '1px solid rgba(255,255,255,0.5)' } }, t.t);
      }),
      tab === 'summary' && React.createElement('button', { className: 'btn-secondary', style: { marginLeft: 'auto' }, onClick: function() { window.print(); } }, '🖨️ พิมพ์ / PDF')
    ),
    tab === 'summary'
      ? React.createElement(PLOSummaryTables, { state: state, plos: plos, students: [student] })
      : React.createElement(PLOProgress, { state: state, student: student, plos: plos })
  );
};

console.log('✅ PLO.js loaded');
