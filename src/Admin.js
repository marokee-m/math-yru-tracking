// ============================================================
// ADMIN VIEWS
// ============================================================

// ---- Curriculum Manager ----
window.AdminCurriculumView = function() {
  const { state, actions } = window.useApp();
  const { courses, curriculumMeta } = state;

  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedYear, setSelectedYear] = React.useState('all');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showBulkModal, setShowBulkModal] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [bulkText, setBulkText] = React.useState('');
  const [bulkPreview, setBulkPreview] = React.useState([]);
  const [bulkError, setBulkError] = React.useState('');

  const [form, setForm] = React.useState({
    code: '', name: '', credits: 3, category: 'general', year: 1, semester: 1, isElective: false
  });

  const categories = curriculumMeta.categories;

  const filtered = courses.filter(c => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedYear !== 'all' && String(c.year) !== selectedYear) return false;
    if (searchTerm && !c.name.includes(searchTerm) && !c.code.includes(searchTerm)) return false;
    return true;
  });

  const grouped = {};
  filtered.forEach(c => {
    const key = c.isElective || !c.year ? 'วิชาเลือก' : `ปีที่ ${c.year} เทอม ${c.semester}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === 'วิชาเลือก') return 1;
    if (b === 'วิชาเลือก') return -1;
    return a.localeCompare(b);
  });

  const catBg = {
    general: 'rgba(59,130,246,0.12)', profession: 'rgba(34,197,94,0.12)',
    major: 'rgba(168,85,247,0.12)', major_elective: 'rgba(99,102,241,0.12)',
    elective: 'rgba(249,115,22,0.12)'
  };
  const catText = {
    general: '#1d4ed8', profession: '#15803d', major: '#7c3aed',
    major_elective: '#4338ca', elective: '#c2410c'
  };

  const openAdd = () => {
    setForm({ code: '', name: '', credits: 3, category: 'general', year: 1, semester: 1, isElective: false });
    setEditingCourse(null);
    setShowAddModal(true);
  };

  const openEdit = (course) => {
    setForm({ ...course });
    setEditingCourse(course);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!form.code || !form.name) return alert('กรุณากรอกรหัสและชื่อวิชา');
    if (editingCourse) {
      actions.updateCourse(editingCourse.code, form);
    } else {
      if (courses.find(c => c.code === form.code)) return alert('รหัสวิชานี้มีอยู่แล้ว');
      actions.addCourse(form);
    }
    setShowAddModal(false);
  };

  const handleDelete = (code) => {
    actions.deleteCourse(code);
    setConfirmDelete(null);
  };

  // Bulk parse courses
  const handleBulkParse = () => {
    setBulkError('');
    const lines = bulkText.trim().split('\n').filter(l => l.trim());
    const results = [];
    const errors = [];
    lines.forEach((line, i) => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length < 4) { errors.push(`บรรทัด ${i+1}: ข้อมูลไม่ครบ`); return; }
      const [code, name, creditsStr, category, yearStr, semStr] = parts;
      const credits = parseInt(creditsStr) || 3;
      const year = parseInt(yearStr) || null;
      const semester = parseInt(semStr) || null;
      const isElective = category === 'major_elective' || category === 'elective';
      const validCats = ['general','profession','major','major_elective','elective'];
      if (!validCats.includes(category)) { errors.push(`บรรทัด ${i+1}: หมวด "${category}" ไม่ถูกต้อง`); return; }
      results.push({ code, name, credits, category, year: isElective ? null : year, semester: isElective ? null : semester, isElective });
    });
    if (errors.length) { setBulkError(errors.join('\n')); return; }
    setBulkPreview(results);
  };

  const handleBulkImport = () => {
    let imported = 0;
    bulkPreview.forEach(c => {
      if (!courses.find(ex => ex.code === c.code)) {
        actions.addCourse(c);
        imported++;
      }
    });
    alert(`นำเข้าสำเร็จ ${imported} รายวิชา`);
    setShowBulkModal(false);
    setBulkText(''); setBulkPreview([]); setBulkError('');
  };

  const creditSummary = categories.map(cat => {
    const catCourses = courses.filter(c => c.category === cat.id);
    const total = catCourses.reduce((sum, c) => sum + c.credits, 0);
    return { ...cat, totalCourses: catCourses.length, totalCredits: total };
  });

  return React.createElement('div', { className: 'fade-in' },
    // Page header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', {},
        React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937', marginBottom: 4 } }, '📚 จัดการหลักสูตร'),
        React.createElement('p', { style: { fontSize: 13, color: '#6b7280' } }, curriculumMeta.name + ' — ' + curriculumMeta.totalCredits + ' หน่วยกิตรวม')
      ),
      React.createElement('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } },
        React.createElement('button', { className: 'btn-secondary', onClick: () => setShowBulkModal(true), style: { fontSize: 14, padding: '10px 18px' } }, '📋 นำเข้าหลายรายการ'),
        React.createElement('button', { className: 'btn-primary', onClick: openAdd, style: { display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement(window.Icon, { name: 'add', size: 18, color: 'white' }), 'เพิ่มรายวิชา'
        )
      )
    ),

    // Credit summary by category
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 } },
      creditSummary.map(cat =>
        React.createElement('div', {
          key: cat.id, className: 'glass-card',
          style: { padding: '14px 16px', cursor: 'pointer', border: selectedCategory === cat.id ? `2px solid ${catText[cat.id]}` : '1px solid rgba(255,255,255,0.5)', background: selectedCategory === cat.id ? catBg[cat.id] : undefined },
          onClick: () => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)
        },
          React.createElement('div', { style: { fontSize: 11, color: catText[cat.id], fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' } }, cat.id),
          React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: '#1f2937', marginBottom: 6, lineHeight: 1.3 } }, cat.name),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13 } },
            React.createElement('span', { style: { color: '#6b7280' } }, cat.totalCourses + ' วิชา'),
            React.createElement('span', { style: { color: catText[cat.id], fontWeight: 700 } }, cat.totalCredits + '/' + cat.requiredCredits + ' cr')
          ),
          React.createElement('div', { className: 'progress-bar-bg', style: { height: 4, marginTop: 6 } },
            React.createElement('div', { className: 'progress-bar-fill', style: { width: Math.min(100, (cat.totalCredits / cat.requiredCredits) * 100) + '%', background: catText[cat.id], height: 4 } })
          )
        )
      )
    ),

    // Search + Year filter
    React.createElement('div', { className: 'glass-card', style: { padding: '10px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' } },
      React.createElement('div', { style: { flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 10, padding: '8px 12px' } },
        React.createElement(window.Icon, { name: 'search', size: 16, color: '#9ca3af' }),
        React.createElement('input', {
          type: 'text', placeholder: 'ค้นหารหัสหรือชื่อวิชา...', value: searchTerm,
          onChange: e => setSearchTerm(e.target.value),
          style: { border: 'none', background: 'transparent', fontSize: 14, width: '100%', outline: 'none' }
        })
      ),
      React.createElement('select', {
        className: 'glass-input', value: selectedYear, onChange: e => setSelectedYear(e.target.value),
        style: { padding: '8px 36px 8px 12px', fontSize: 14 }
      },
        React.createElement('option', { value: 'all' }, 'ทุกชั้นปี'),
        [1,2,3,4].map(y => React.createElement('option', { key: y, value: String(y) }, 'ปีที่ ' + y))
      )
    ),

    // Course list grouped
    sortedKeys.map(groupKey =>
      React.createElement('div', { key: groupKey, style: { marginBottom: 16 } },
        React.createElement('h3', { style: { fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8, paddingLeft: 4, display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement('span', { style: { width: 3, height: 16, background: '#ec4899', borderRadius: 2, display: 'inline-block' } }),
          groupKey,
          React.createElement('span', { style: { fontSize: 12, color: '#9ca3af', fontWeight: 400 } }, '(' + grouped[groupKey].length + ' วิชา)')
        ),
        React.createElement('div', { className: 'glass-card', style: { overflow: 'auto', padding: 0 } },
          React.createElement('table', { className: 'glass-table', style: { minWidth: 500 } },
            React.createElement('thead', {},
              React.createElement('tr', {},
                ['รหัสวิชา','ชื่อวิชา','หน่วยกิต','หมวดวิชา','จัดการ'].map(h =>
                  React.createElement('th', { key: h }, h)
                )
              )
            ),
            React.createElement('tbody', {},
              grouped[groupKey].map(course =>
                React.createElement('tr', { key: course.code },
                  React.createElement('td', {},
                    React.createElement('code', { style: { fontSize: 12, background: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: 6 } }, course.code)
                  ),
                  React.createElement('td', { style: { fontWeight: 500, fontSize: 14 } }, course.name),
                  React.createElement('td', { style: { textAlign: 'center', fontWeight: 700 } }, course.credits),
                  React.createElement('td', {},
                    React.createElement('span', { style: { fontSize: 11, padding: '3px 8px', borderRadius: 20, background: catBg[course.category], color: catText[course.category], fontWeight: 600 } },
                      categories.find(c => c.id === course.category)?.name || course.category)
                  ),
                  React.createElement('td', {},
                    React.createElement('div', { style: { display: 'flex', gap: 6 } },
                      React.createElement('button', { className: 'btn-ghost', onClick: () => openEdit(course), style: { padding: '5px 10px', fontSize: 12 } }, '✏️ แก้ไข'),
                      React.createElement('button', { className: 'btn-danger', onClick: () => setConfirmDelete(course.code), style: { padding: '5px 10px', fontSize: 12 } }, '🗑️')
                    )
                  )
                )
              )
            )
          )
        )
      )
    ),

    // Add/Edit Modal
    React.createElement(window.Modal, {
      open: showAddModal, onClose: () => setShowAddModal(false),
      title: editingCourse ? '✏️ แก้ไขรายวิชา' : '➕ เพิ่มรายวิชา', width: '500px'
    },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
          React.createElement('div', {},
            React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'รหัสวิชา *'),
            React.createElement('input', {
              className: 'glass-input', value: form.code, onChange: e => setForm(f => ({ ...f, code: e.target.value })),
              placeholder: 'เช่น GE1001', style: { width: '100%', padding: '10px 12px', fontSize: 14 }, disabled: !!editingCourse
            })
          ),
          React.createElement('div', {},
            React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'หน่วยกิต'),
            React.createElement('input', {
              className: 'glass-input', type: 'number', min: 1, max: 9, value: form.credits,
              onChange: e => setForm(f => ({ ...f, credits: parseInt(e.target.value) || 3 })),
              style: { width: '100%', padding: '10px 12px', fontSize: 14 }
            })
          )
        ),
        React.createElement('div', {},
          React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'ชื่อวิชา *'),
          React.createElement('input', {
            className: 'glass-input', value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })),
            placeholder: 'กรอกชื่อวิชาภาษาไทย', style: { width: '100%', padding: '10px 12px', fontSize: 14 }
          })
        ),
        React.createElement('div', {},
          React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'หมวดวิชา'),
          React.createElement('select', {
            className: 'glass-input', value: form.category,
            onChange: e => {
              const isElective = e.target.value === 'major_elective' || e.target.value === 'elective';
              setForm(f => ({ ...f, category: e.target.value, isElective, year: isElective ? null : (f.year || 1), semester: isElective ? null : (f.semester || 1) }));
            },
            style: { width: '100%', padding: '10px 12px', fontSize: 14 }
          },
            categories.map(c => React.createElement('option', { key: c.id, value: c.id }, c.name))
          )
        ),
        !form.isElective && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
          React.createElement('div', {},
            React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'ชั้นปีที่'),
            React.createElement('select', {
              className: 'glass-input', value: form.year || 1, onChange: e => setForm(f => ({ ...f, year: parseInt(e.target.value) })),
              style: { width: '100%', padding: '10px 12px', fontSize: 14 }
            }, [1,2,3,4].map(y => React.createElement('option', { key: y, value: y }, 'ปีที่ ' + y)))
          ),
          React.createElement('div', {},
            React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'เทอม'),
            React.createElement('select', {
              className: 'glass-input', value: form.semester || 1, onChange: e => setForm(f => ({ ...f, semester: parseInt(e.target.value) })),
              style: { width: '100%', padding: '10px 12px', fontSize: 14 }
            }, [1,2].map(s => React.createElement('option', { key: s, value: s }, 'เทอม ' + s)))
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 } },
          React.createElement('button', { className: 'btn-secondary', onClick: () => setShowAddModal(false) }, 'ยกเลิก'),
          React.createElement('button', { className: 'btn-primary', onClick: handleSave }, editingCourse ? 'บันทึก' : 'เพิ่มรายวิชา')
        )
      )
    ),

    // Bulk Import Modal
    React.createElement(window.Modal, {
      open: showBulkModal, onClose: () => { setShowBulkModal(false); setBulkText(''); setBulkPreview([]); setBulkError(''); },
      title: '📋 นำเข้าหลายรายวิชา', width: '620px'
    },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        React.createElement('div', { style: { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#374151', lineHeight: 1.6 } },
          React.createElement('div', { style: { fontWeight: 700, marginBottom: 4 } }, '📌 รูปแบบข้อมูล (Tab-separated, 1 วิชา/บรรทัด):'),
          React.createElement('code', { style: { fontSize: 12, display: 'block', background: 'rgba(255,255,255,0.6)', padding: '8px 10px', borderRadius: 6, marginTop: 4 } },
            'รหัสวิชา\tชื่อวิชา\tหน่วยกิต\tหมวด\tปี\tเทอม\n' +
            'GE9001\tวิชาทดสอบ\t3\tgeneral\t1\t1\n' +
            'หมวด: general | profession | major | major_elective | elective'
          )
        ),
        React.createElement('textarea', {
          value: bulkText, onChange: e => { setBulkText(e.target.value); setBulkPreview([]); setBulkError(''); },
          placeholder: 'วางข้อมูลหลายรายวิชาที่นี่ (Tab-separated)...',
          className: 'glass-input',
          style: { width: '100%', minHeight: 120, padding: '10px 12px', fontSize: 13, fontFamily: 'monospace', resize: 'vertical', display: 'block' }
        }),
        bulkError && React.createElement('div', { style: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 12px', color: '#dc2626', fontSize: 13, whiteSpace: 'pre-line' } }, bulkError),
        bulkPreview.length > 0 && React.createElement('div', {},
          React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 8 } }, '✅ พร้อมนำเข้า ' + bulkPreview.length + ' รายวิชา'),
          React.createElement('div', { style: { maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 } },
            bulkPreview.map((c, i) =>
              React.createElement('div', { key: i, style: { fontSize: 13, padding: '6px 10px', background: 'rgba(34,197,94,0.08)', borderRadius: 6, display: 'flex', gap: 10 } },
                React.createElement('code', { style: { color: '#6b7280', minWidth: 80 } }, c.code),
                React.createElement('span', { style: { flex: 1 } }, c.name),
                React.createElement('span', { style: { color: '#9ca3af' } }, c.credits + 'cr')
              )
            )
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
          React.createElement('button', { className: 'btn-secondary', onClick: () => { setShowBulkModal(false); setBulkText(''); setBulkPreview([]); setBulkError(''); } }, 'ยกเลิก'),
          bulkPreview.length === 0
            ? React.createElement('button', { className: 'btn-primary', onClick: handleBulkParse }, '🔍 ตรวจสอบ')
            : React.createElement('button', { className: 'btn-primary', onClick: handleBulkImport }, '📥 นำเข้า ' + bulkPreview.length + ' รายวิชา')
        )
      )
    ),

    React.createElement(window.ConfirmDialog, {
      open: !!confirmDelete, message: 'ยืนยันลบรายวิชานี้ออกจากหลักสูตร?',
      onConfirm: () => handleDelete(confirmDelete), onCancel: () => setConfirmDelete(null)
    })
  );
};


// ---- User Manager (Students + Advisors) ----
window.AdminUserView = function() {
  const { state, actions } = window.useApp();
  const { students, advisors } = state;

  const [tab, setTab] = React.useState('students');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [showBulkModal, setShowBulkModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const [bulkText, setBulkText] = React.useState('');
  const [bulkPreview, setBulkPreview] = React.useState([]);
  const [bulkError, setBulkError] = React.useState('');
  const [showPassIds, setShowPassIds] = React.useState({});

  const emptyStudent = { id: '', studentId: '', name: '', username: '', password: '1234', advisorId: '', year: 1, currentSemester: 1, enrollments: [] };
  const emptyAdvisor = { id: '', name: '', username: '', password: '1234', email: '', department: 'สาขาวิชาการประถมศึกษา', phone: '', studentIds: [] };
  const [form, setForm] = React.useState(emptyStudent);

  const openAdd = () => {
    setForm(tab === 'students' ? { ...emptyStudent } : { ...emptyAdvisor });
    setEditingItem(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({ ...item });
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = () => {
    if (tab === 'students') {
      if (!form.name || !form.studentId) return alert('กรุณากรอกรหัสและชื่อนักศึกษา');
      const username = form.username || form.studentId;
      if (editingItem) {
        actions.updateStudent(editingItem.id, { ...form, username });
      } else {
        actions.addStudent({ ...form, id: 's' + Date.now(), username, enrollments: [] });
      }
    } else {
      if (!form.name || !form.username) return alert('กรุณากรอกชื่อและ username');
      if (editingItem) {
        actions.updateAdvisor(editingItem.id, form);
      } else {
        actions.addAdvisor({ ...form, id: 'a' + Date.now(), studentIds: [] });
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (tab === 'students') actions.deleteStudent(id);
    else actions.deleteAdvisor(id);
    setConfirmDelete(null);
  };

  // Bulk parse students
  const handleBulkParse = () => {
    setBulkError('');
    const lines = bulkText.trim().split('\n').filter(l => l.trim());
    const results = [];
    const errors = [];
    lines.forEach((line, i) => {
      const parts = line.split('\t').map(p => p.trim());
      if (tab === 'students') {
        if (parts.length < 2) { errors.push(`บรรทัด ${i+1}: ข้อมูลไม่ครบ (ต้องการอย่างน้อย รหัส\tชื่อ)`); return; }
        const [studentId, name, password, advisorId, yearStr] = parts;
        results.push({
          studentId, name, username: studentId,
          password: password || '1234',
          advisorId: advisorId || '',
          year: parseInt(yearStr) || 1,
          currentSemester: 1, enrollments: []
        });
      } else {
        if (parts.length < 3) { errors.push(`บรรทัด ${i+1}: ข้อมูลไม่ครบ (ต้องการอย่างน้อย ชื่อ\tusername\tpassword)`); return; }
        const [name, username, password, email, phone] = parts;
        results.push({ name, username, password: password || '1234', email: email || '', phone: phone || '', department: 'สาขาวิชาการประถมศึกษา', studentIds: [] });
      }
    });
    if (errors.length) { setBulkError(errors.join('\n')); return; }
    setBulkPreview(results);
  };

  const handleBulkImport = () => {
    let imported = 0;
    bulkPreview.forEach(item => {
      if (tab === 'students') {
        if (!students.find(s => s.studentId === item.studentId)) {
          actions.addStudent({ ...item, id: 's' + Date.now() + imported });
          imported++;
        }
      } else {
        if (!advisors.find(a => a.username === item.username)) {
          actions.addAdvisor({ ...item, id: 'a' + Date.now() + imported });
          imported++;
        }
      }
    });
    alert(`นำเข้าสำเร็จ ${imported} รายการ`);
    setShowBulkModal(false);
    setBulkText(''); setBulkPreview([]); setBulkError('');
  };

  const toggleShowPass = (id) => setShowPassIds(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredStudents = students.filter(s => !searchTerm || s.name.includes(searchTerm) || s.studentId.includes(searchTerm) || (s.username || '').includes(searchTerm));
  const filteredAdvisors = advisors.filter(a => !searchTerm || a.name.includes(searchTerm) || (a.username || '').includes(searchTerm));

  const bulkFormat = tab === 'students'
    ? 'รหัสนักศึกษา\tชื่อ-นามสกุล\tpassword\tรหัสอาจารย์\tชั้นปี\n6640112010\tนายทดสอบ ระบบ\t1234\ta001\t1'
    : 'ชื่อ-นามสกุล\tusername\tpassword\tอีเมล\tเบอร์โทร\nผศ.ดร.ทดสอบ ระบบ\tadvisor03\t1234\ttest@yru.ac.th\t073-000-000';

  return React.createElement('div', { className: 'fade-in' },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 } },
      React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937' } }, '👥 จัดการบัญชีผู้ใช้'),
      React.createElement('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } },
        React.createElement('button', { className: 'btn-secondary', onClick: () => { setBulkText(''); setBulkPreview([]); setBulkError(''); setShowBulkModal(true); }, style: { fontSize: 14, padding: '10px 18px' } }, '📋 นำเข้าหลายรายการ'),
        React.createElement('button', { className: 'btn-primary', onClick: openAdd, style: { display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement(window.Icon, { name: 'add', size: 18, color: 'white' }), 'เพิ่ม' + (tab === 'students' ? 'นักศึกษา' : 'อาจารย์')
        )
      )
    ),

    // Stats
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 } },
      React.createElement('div', { className: 'glass-card stat-pink', style: { padding: '14px 18px' } },
        React.createElement('div', { style: { fontSize: 26, fontWeight: 800, color: '#be185d' } }, students.length),
        React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'นักศึกษาทั้งหมด')
      ),
      React.createElement('div', { className: 'glass-card stat-green', style: { padding: '14px 18px' } },
        React.createElement('div', { style: { fontSize: 26, fontWeight: 800, color: '#15803d' } }, advisors.length),
        React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'อาจารย์ที่ปรึกษา')
      ),
      React.createElement('div', { className: 'glass-card stat-orange', style: { padding: '14px 18px' } },
        React.createElement('div', { style: { fontSize: 26, fontWeight: 800, color: '#c2410c' } },
          students.filter(s => { const r = window.Utils.getAtRiskIndicators(s, state.courses); return r.failCount > 0; }).length
        ),
        React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'มีความเสี่ยง')
      )
    ),

    // Tabs
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 16 } },
      [{ key: 'students', label: '🎓 นักศึกษา' }, { key: 'advisors', label: '👨‍🏫 อาจารย์' }].map(t =>
        React.createElement('button', {
          key: t.key, onClick: () => { setTab(t.key); setSearchTerm(''); },
          style: { padding: '10px 22px', borderRadius: 12, fontFamily: 'Sarabun,sans-serif', fontSize: 15, fontWeight: 600, cursor: 'pointer', background: tab === t.key ? 'linear-gradient(135deg,#e91e8c,#f06292)' : 'rgba(255,255,255,0.4)', color: tab === t.key ? 'white' : '#4b5563', border: '1px solid rgba(255,255,255,0.5)', boxShadow: tab === t.key ? '0 4px 15px rgba(233,30,140,0.25)' : 'none' }
        }, t.label)
      )
    ),

    // Search
    React.createElement('div', { className: 'glass-card', style: { padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 } },
      React.createElement(window.Icon, { name: 'search', size: 16, color: '#9ca3af' }),
      React.createElement('input', {
        type: 'text', placeholder: 'ค้นหา...', value: searchTerm, onChange: e => setSearchTerm(e.target.value),
        style: { border: 'none', background: 'transparent', fontSize: 14, width: '100%', outline: 'none' }
      })
    ),

    // Students table
    tab === 'students' && React.createElement('div', { className: 'glass-card', style: { overflow: 'auto', padding: 0 } },
      React.createElement('table', { className: 'glass-table', style: { minWidth: 700 } },
        React.createElement('thead', {},
          React.createElement('tr', {},
            ['รหัส','ชื่อ-นามสกุล','Username','Password','ปี','อาจารย์','GPAX','สถานะ','จัดการ'].map(h =>
              React.createElement('th', { key: h }, h)
            )
          )
        ),
        React.createElement('tbody', {},
          filteredStudents.map(s => {
            const gpax = parseFloat(window.Utils.calcGPAX(s.enrollments, state.courses));
            const advisor = advisors.find(a => a.id === s.advisorId);
            const risk = window.Utils.getAtRiskIndicators(s, state.courses);
            const showPass = showPassIds[s.id];
            return React.createElement('tr', { key: s.id },
              React.createElement('td', {}, React.createElement('code', { style: { fontSize: 12 } }, s.studentId)),
              React.createElement('td', { style: { fontWeight: 500, fontSize: 14 } }, s.name),
              React.createElement('td', {}, React.createElement('code', { style: { fontSize: 13, color: '#6b7280' } }, s.username || s.studentId)),
              React.createElement('td', {},
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                  React.createElement('code', { style: { fontSize: 13 } }, showPass ? (s.password || '1234') : '••••'),
                  React.createElement('button', { onClick: () => toggleShowPass(s.id), className: 'btn-ghost', style: { padding: '2px 8px', fontSize: 11 } }, showPass ? 'ซ่อน' : 'แสดง')
                )
              ),
              React.createElement('td', { style: { textAlign: 'center', fontSize: 13 } }, 'ปี ' + s.year + '/' + s.currentSemester),
              React.createElement('td', { style: { fontSize: 12, color: '#6b7280' } }, advisor ? advisor.name.split(' ')[0] : '-'),
              React.createElement('td', { style: { textAlign: 'center', fontWeight: 700, color: gpax >= 3.0 ? '#15803d' : gpax >= 2.0 ? '#854d0e' : '#dc2626' } }, gpax.toFixed(2)),
              React.createElement('td', {}, risk.failCount > 0 ? React.createElement('span', { className: 'badge badge-fail' }, '⚠ E/F ' + risk.failCount) : React.createElement('span', { className: 'badge badge-pass' }, '✓')),
              React.createElement('td', {},
                React.createElement('div', { style: { display: 'flex', gap: 6 } },
                  React.createElement('button', { className: 'btn-ghost', onClick: () => openEdit(s), style: { padding: '5px 10px', fontSize: 12 } }, '✏️'),
                  React.createElement('button', { className: 'btn-danger', onClick: () => setConfirmDelete(s.id), style: { padding: '5px 10px', fontSize: 12 } }, '🗑️')
                )
              )
            );
          })
        )
      )
    ),

    // Advisors table
    tab === 'advisors' && React.createElement('div', { className: 'glass-card', style: { overflow: 'auto', padding: 0 } },
      React.createElement('table', { className: 'glass-table', style: { minWidth: 650 } },
        React.createElement('thead', {},
          React.createElement('tr', {},
            ['ชื่อ-นามสกุล','Username','Password','อีเมล','ภาควิชา','นักศึกษา','จัดการ'].map(h =>
              React.createElement('th', { key: h }, h)
            )
          )
        ),
        React.createElement('tbody', {},
          filteredAdvisors.map(a => {
            const myStudents = students.filter(s => s.advisorId === a.id);
            const showPass = showPassIds[a.id];
            return React.createElement('tr', { key: a.id },
              React.createElement('td', { style: { fontWeight: 600, fontSize: 14 } }, a.name),
              React.createElement('td', {}, React.createElement('code', { style: { fontSize: 13, color: '#6b7280' } }, a.username || '-')),
              React.createElement('td', {},
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                  React.createElement('code', { style: { fontSize: 13 } }, showPass ? (a.password || '1234') : '••••'),
                  React.createElement('button', { onClick: () => toggleShowPass(a.id), className: 'btn-ghost', style: { padding: '2px 8px', fontSize: 11 } }, showPass ? 'ซ่อน' : 'แสดง')
                )
              ),
              React.createElement('td', { style: { fontSize: 12, color: '#6b7280' } }, a.email || '-'),
              React.createElement('td', { style: { fontSize: 12 } }, a.department || '-'),
              React.createElement('td', { style: { textAlign: 'center' } }, React.createElement('span', { className: 'badge badge-pass' }, myStudents.length + ' คน')),
              React.createElement('td', {},
                React.createElement('div', { style: { display: 'flex', gap: 6 } },
                  React.createElement('button', { className: 'btn-ghost', onClick: () => openEdit(a), style: { padding: '5px 10px', fontSize: 12 } }, '✏️'),
                  React.createElement('button', { className: 'btn-danger', onClick: () => setConfirmDelete(a.id), style: { padding: '5px 10px', fontSize: 12 } }, '🗑️')
                )
              )
            );
          })
        )
      )
    ),

    // Add/Edit Modal
    React.createElement(window.Modal, {
      open: showModal, onClose: () => setShowModal(false),
      title: (editingItem ? '✏️ แก้ไข' : '➕ เพิ่ม') + (tab === 'students' ? 'นักศึกษา' : 'อาจารย์')
    },
      tab === 'students'
        ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              React.createElement('div', {},
                React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'รหัสนักศึกษา *'),
                React.createElement('input', { className: 'glass-input', value: form.studentId || '', onChange: e => setForm(f => ({ ...f, studentId: e.target.value, username: e.target.value })), style: { width: '100%', padding: '10px 12px', fontSize: 14 }, placeholder: '6640112001' })
              ),
              React.createElement('div', {},
                React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'ชั้นปีที่'),
                React.createElement('select', { className: 'glass-input', value: form.year || 1, onChange: e => setForm(f => ({ ...f, year: parseInt(e.target.value) })), style: { width: '100%', padding: '10px 12px', fontSize: 14 } },
                  [1,2,3,4].map(y => React.createElement('option', { key: y, value: y }, 'ปีที่ ' + y))
                )
              )
            ),
            React.createElement('div', {},
              React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'ชื่อ-นามสกุล *'),
              React.createElement('input', { className: 'glass-input', value: form.name || '', onChange: e => setForm(f => ({ ...f, name: e.target.value })), style: { width: '100%', padding: '10px 12px', fontSize: 14 }, placeholder: 'นายสมชาย ใจดี' })
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              React.createElement('div', {},
                React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'Username'),
                React.createElement('input', { className: 'glass-input', value: form.username || '', onChange: e => setForm(f => ({ ...f, username: e.target.value })), style: { width: '100%', padding: '10px 12px', fontSize: 14 }, placeholder: 'ค่าเริ่มต้น = รหัสนักศึกษา' })
              ),
              React.createElement('div', {},
                React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'Password'),
                React.createElement('input', { className: 'glass-input', value: form.password || '', onChange: e => setForm(f => ({ ...f, password: e.target.value })), style: { width: '100%', padding: '10px 12px', fontSize: 14 }, placeholder: '1234' })
              )
            ),
            React.createElement('div', {},
              React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'อาจารย์ที่ปรึกษา'),
              React.createElement('select', { className: 'glass-input', value: form.advisorId || '', onChange: e => setForm(f => ({ ...f, advisorId: e.target.value })), style: { width: '100%', padding: '10px 12px', fontSize: 14 } },
                React.createElement('option', { value: '' }, '-- เลือกอาจารย์ --'),
                advisors.map(a => React.createElement('option', { key: a.id, value: a.id }, a.name))
              )
            ),
            React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 } },
              React.createElement('button', { className: 'btn-secondary', onClick: () => setShowModal(false) }, 'ยกเลิก'),
              React.createElement('button', { className: 'btn-primary', onClick: handleSave }, editingItem ? 'บันทึก' : 'เพิ่ม')
            )
          )
        : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
            React.createElement('div', {},
              React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'ชื่อ-นามสกุล (รวมคำนำหน้า) *'),
              React.createElement('input', { className: 'glass-input', value: form.name || '', onChange: e => setForm(f => ({ ...f, name: e.target.value })), style: { width: '100%', padding: '10px 12px', fontSize: 14 }, placeholder: 'ผศ.ดร.ชื่อ นามสกุล' })
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              React.createElement('div', {},
                React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'Username *'),
                React.createElement('input', { className: 'glass-input', value: form.username || '', onChange: e => setForm(f => ({ ...f, username: e.target.value })), style: { width: '100%', padding: '10px 12px', fontSize: 14 }, placeholder: 'advisor01' })
              ),
              React.createElement('div', {},
                React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'Password'),
                React.createElement('input', { className: 'glass-input', value: form.password || '', onChange: e => setForm(f => ({ ...f, password: e.target.value })), style: { width: '100%', padding: '10px 12px', fontSize: 14 }, placeholder: '1234' })
              )
            ),
            React.createElement('div', {},
              React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'อีเมล'),
              React.createElement('input', { className: 'glass-input', type: 'email', value: form.email || '', onChange: e => setForm(f => ({ ...f, email: e.target.value })), style: { width: '100%', padding: '10px 12px', fontSize: 14 }, placeholder: 'email@yru.ac.th' })
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              React.createElement('div', {},
                React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'ภาควิชา'),
                React.createElement('input', { className: 'glass-input', value: form.department || '', onChange: e => setForm(f => ({ ...f, department: e.target.value })), style: { width: '100%', padding: '10px 12px', fontSize: 14 } })
              ),
              React.createElement('div', {},
                React.createElement('label', { style: { fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' } }, 'เบอร์โทร'),
                React.createElement('input', { className: 'glass-input', value: form.phone || '', onChange: e => setForm(f => ({ ...f, phone: e.target.value })), style: { width: '100%', padding: '10px 12px', fontSize: 14 } })
              )
            ),
            React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 } },
              React.createElement('button', { className: 'btn-secondary', onClick: () => setShowModal(false) }, 'ยกเลิก'),
              React.createElement('button', { className: 'btn-primary', onClick: handleSave }, editingItem ? 'บันทึก' : 'เพิ่ม')
            )
          )
    ),

    // Bulk Import Modal
    React.createElement(window.Modal, {
      open: showBulkModal,
      onClose: () => { setShowBulkModal(false); setBulkText(''); setBulkPreview([]); setBulkError(''); },
      title: '📋 นำเข้าหลายรายการ — ' + (tab === 'students' ? 'นักศึกษา' : 'อาจารย์'),
      width: '620px'
    },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        React.createElement('div', { style: { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '12px 14px', fontSize: 13, lineHeight: 1.7 } },
          React.createElement('div', { style: { fontWeight: 700, marginBottom: 4 } }, '📌 รูปแบบ (Tab-separated, 1 รายการ/บรรทัด):'),
          React.createElement('pre', { style: { fontSize: 12, background: 'rgba(255,255,255,0.6)', padding: '8px 10px', borderRadius: 6, marginTop: 4, overflowX: 'auto', whiteSpace: 'pre-wrap' } }, bulkFormat)
        ),
        React.createElement('textarea', {
          value: bulkText, onChange: e => { setBulkText(e.target.value); setBulkPreview([]); setBulkError(''); },
          placeholder: 'วางข้อมูลที่นี่...',
          className: 'glass-input',
          style: { width: '100%', minHeight: 130, padding: '10px 12px', fontSize: 13, fontFamily: 'monospace', resize: 'vertical', display: 'block' }
        }),
        bulkError && React.createElement('div', { style: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 12px', color: '#dc2626', fontSize: 13, whiteSpace: 'pre-line' } }, bulkError),
        bulkPreview.length > 0 && React.createElement('div', {},
          React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 8 } }, '✅ พร้อมนำเข้า ' + bulkPreview.length + ' รายการ'),
          React.createElement('div', { style: { maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 } },
            bulkPreview.map((item, i) =>
              React.createElement('div', { key: i, style: { fontSize: 13, padding: '6px 10px', background: 'rgba(34,197,94,0.08)', borderRadius: 6, display: 'flex', gap: 12 } },
                React.createElement('span', { style: { fontWeight: 600 } }, tab === 'students' ? item.studentId : item.username),
                React.createElement('span', { style: { flex: 1 } }, item.name),
                React.createElement('span', { style: { color: '#9ca3af', fontSize: 12 } }, 'pass: ' + item.password)
              )
            )
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
          React.createElement('button', { className: 'btn-secondary', onClick: () => { setShowBulkModal(false); setBulkText(''); setBulkPreview([]); setBulkError(''); } }, 'ยกเลิก'),
          bulkPreview.length === 0
            ? React.createElement('button', { className: 'btn-primary', onClick: handleBulkParse }, '🔍 ตรวจสอบ')
            : React.createElement('button', { className: 'btn-primary', onClick: handleBulkImport }, '📥 นำเข้า ' + bulkPreview.length + ' รายการ')
        )
      )
    ),

    React.createElement(window.ConfirmDialog, {
      open: !!confirmDelete, message: 'ยืนยันลบข้อมูลนี้?',
      onConfirm: () => handleDelete(confirmDelete), onCancel: () => setConfirmDelete(null)
    })
  );
};

console.log('✅ Admin views loaded');
