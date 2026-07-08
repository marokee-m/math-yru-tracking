// ============================================================
// BORROW SYSTEM — ระบบยืมคืนอุปกรณ์สาขาคณิตศาสตร์
// ============================================================

// ---- Admin: Equipment Management ----
window.AdminEquipmentView = function() {
  var ctx = window.useApp();
  var state = ctx.state; var actions = ctx.actions;
  var equipment = state.equipment || [];

  var [showModal, setShowModal] = React.useState(false);
  var [editItem, setEditItem] = React.useState(null);
  var [form, setForm] = React.useState({ code: '', name: '', totalQuantity: 1, availableQuantity: 1, imageUrl: '', description: '', location: '' });
  var [imagePreview, setImagePreview] = React.useState(null);
  var [imageFile, setImageFile] = React.useState(null);
  var [uploading, setUploading] = React.useState(false);
  var [uploadProgress, setUploadProgress] = React.useState(0);
  var [deleteTarget, setDeleteTarget] = React.useState(null);
  var [saving, setSaving] = React.useState(false);
  var [msg, setMsg] = React.useState('');
  var fileInputRef = React.useRef(null);
  var [eqSearch, setEqSearch] = React.useState('');

  var genNextCode = function() {
    var nums = equipment.map(function(e) {
      var m = (e.code || '').match(/(\d+)$/);
      return m ? parseInt(m[1]) : 0;
    });
    var next = nums.length > 0 ? Math.max.apply(null, nums) + 1 : 1;
    return 'MATH-' + String(next).padStart(3, '0');
  };

  var openAdd = function() {
    setEditItem(null);
    setForm({ code: genNextCode(), name: '', totalQuantity: 1, availableQuantity: 1, imageUrl: '', description: '', borrowType: 'borrow', location: '' });
    setImagePreview(null); setImageFile(null); setUploadProgress(0); setMsg('');
    setShowModal(true);
  };
  var openEdit = function(item) {
    setEditItem(item);
    setForm({ code: item.code || '', name: item.name || '', totalQuantity: item.totalQuantity || 1, availableQuantity: item.availableQuantity !== undefined ? item.availableQuantity : item.totalQuantity, imageUrl: item.imageUrl || '', description: item.description || '', borrowType: item.borrowType || 'borrow', location: item.location || '' });
    setImagePreview(item.imageUrl || null); setImageFile(null); setUploadProgress(0); setMsg('');
    setShowModal(true);
  };

  var handleImageSelect = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMsg('⚠ รองรับเฉพาะไฟล์รูปภาพ'); return; }
    if (file.size > 5 * 1024 * 1024) { setMsg('⚠ ขนาดไฟล์ต้องไม่เกิน 5MB'); return; }
    setMsg('');
    setImageFile(file);
    var reader = new FileReader();
    reader.onload = function(ev) { setImagePreview(ev.target.result); };
    reader.readAsDataURL(file);
  };

  var handleUploadAndSave = function() {
    if (!form.name.trim()) { setMsg('⚠ กรุณากรอกชื่ออุปกรณ์'); return; }
    if (imageFile) {
      var sb = actions.getSupabase ? actions.getSupabase() : null;
      if (!sb) { setMsg('⚠ Supabase ยังไม่พร้อม'); return; }
      setUploading(true); setUploadProgress(30); setMsg('');
      var ext = imageFile.name.split('.').pop() || 'jpg';
      var path = 'equipment/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext;
      sb.storage.from('equipment-images').upload(path, imageFile, { upsert: true }).then(function(res) {
        setUploading(false); setUploadProgress(0);
        if (res.error) { setMsg('⚠ อัปโหลดไม่สำเร็จ: ' + res.error.message); return; }
        var url = sb.storage.from('equipment-images').getPublicUrl(path).data.publicUrl;
        var data = Object.assign({}, form, { imageUrl: url, totalQuantity: parseInt(form.totalQuantity) || 1, availableQuantity: parseInt(form.availableQuantity) || 1 });
        doSave(data);
      });
    } else {
      var data = Object.assign({}, form, { totalQuantity: parseInt(form.totalQuantity) || 1, availableQuantity: parseInt(form.availableQuantity) || 1 });
      doSave(data);
    }
  };

  var doSave = function(data) {
    setSaving(true);
    if (editItem) {
      actions.updateEquipment(editItem.id, data).then(function() { setSaving(false); setShowModal(false); }).catch(function(e) { setSaving(false); setMsg('⚠ บันทึกไม่สำเร็จ'); });
    } else {
      actions.addEquipment(data).then(function() { setSaving(false); setShowModal(false); }).catch(function(e) { setSaving(false); setMsg('⚠ บันทึกไม่สำเร็จ'); });
    }
  };

  var handleDelete = function(item) {
    setDeleteTarget(item);
  };
  var confirmDelete = function() {
    if (!deleteTarget) return;
    actions.deleteEquipment(deleteTarget.id);
    setDeleteTarget(null);
  };

  var setF = function(key, val) { setForm(function(f) { return Object.assign({}, f, { [key]: val }); }); };

  var labelStyle = { fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4, display: 'block' };
  var inputStyle = { width: '100%', padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' };

  var filteredEquipment = eqSearch ? equipment.filter(function(item) { var q = eqSearch.toLowerCase(); return (item.name||'').toLowerCase().includes(q) || (item.code||'').toLowerCase().includes(q); }) : equipment;

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'fade-in', style: { padding: '8px 4px', maxWidth: 1000, margin: '0 auto' } },
      // Header
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 } },
        React.createElement('div', {},
          React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937' } }, '🗄️ จัดการอุปกรณ์'),
          React.createElement('p', { style: { fontSize: 14, color: '#6b7280', marginTop: 4 } }, 'อุปกรณ์ทั้งหมด ' + equipment.length + ' รายการ')
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flex: '1 1 260px', justifyContent: 'flex-end' } },
          React.createElement('input', { className: 'glass-input', placeholder: '🔍 ค้นหาอุปกรณ์...', value: eqSearch, onChange: function(e) { setEqSearch(e.target.value); }, style: { padding: '9px 14px', fontSize: 14, flex: '1 1 160px', minWidth: 0, boxSizing: 'border-box' } }),
          React.createElement('button', { className: 'btn-primary', onClick: openAdd, style: { whiteSpace: 'nowrap' } }, '+ เพิ่มอุปกรณ์')
        )
      ),
      // Table (เลื่อนแนวนอนได้บนจอมือถือ)
      React.createElement('div', { className: 'glass-card', style: { overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: 0 } },
        React.createElement('table', { className: 'glass-table', style: { minWidth: 760 } },
          React.createElement('thead', {},
            React.createElement('tr', {},
              React.createElement('th', { style: { width: 60 } }, 'ภาพ'),
              React.createElement('th', {}, 'รหัส'),
              React.createElement('th', {}, 'ชื่ออุปกรณ์'),
              React.createElement('th', {}, 'ประเภท'),
              React.createElement('th', { style: { textAlign: 'center' } }, 'ทั้งหมด'),
              React.createElement('th', { style: { textAlign: 'center' } }, 'คงเหลือ'),
              React.createElement('th', {}, 'สถานที่เก็บ'),
              React.createElement('th', { style: { width: 120 } }, '')
            )
          ),
          React.createElement('tbody', {},
            filteredEquipment.length === 0
              ? React.createElement('tr', {}, React.createElement('td', { colSpan: 8, style: { textAlign: 'center', color: '#9ca3af', padding: '32px' } }, eqSearch ? 'ไม่พบอุปกรณ์ที่ค้นหา' : 'ยังไม่มีอุปกรณ์'))
              : filteredEquipment.map(function(item) {
                var avail = item.availableQuantity || 0;
                var total = item.totalQuantity || 1;
                var pct = Math.round(avail / total * 100);
                return React.createElement('tr', { key: item.id },
                  React.createElement('td', {},
                    item.imageUrl
                      ? React.createElement('img', { src: item.imageUrl, style: { width: 48, height: 48, objectFit: 'cover', borderRadius: 8 } })
                      : React.createElement('div', { style: { width: 48, height: 48, borderRadius: 8, background: 'rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 } }, '📦')
                  ),
                  React.createElement('td', {}, React.createElement('code', { style: { fontSize: 12, color: '#6b7280' } }, item.code || '—')),
                  React.createElement('td', { style: { fontWeight: 600 } }, item.name),
                  React.createElement('td', {},
                    item.borrowType === 'requisition'
                      ? React.createElement('span', { style: { fontSize: 12, padding: '3px 8px', borderRadius: 12, background: 'rgba(139,92,246,0.12)', color: '#7c3aed', fontWeight: 600 } }, '📤 เบิกจ่าย')
                      : React.createElement('span', { style: { fontSize: 12, padding: '3px 8px', borderRadius: 12, background: 'rgba(59,130,246,0.12)', color: '#1d4ed8', fontWeight: 600 } }, '🔄 ยืมคืน')
                  ),
                  React.createElement('td', { style: { textAlign: 'center', fontWeight: 700 } }, total),
                  React.createElement('td', { style: { textAlign: 'center' } },
                    React.createElement('span', { style: { fontWeight: 700, color: avail === 0 ? '#dc2626' : avail < total * 0.3 ? '#d97706' : '#15803d' } }, avail),
                    React.createElement('div', { style: { width: 60, height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 99, margin: '4px auto 0' } },
                      React.createElement('div', { style: { width: pct + '%', height: '100%', borderRadius: 99, background: avail === 0 ? '#ef4444' : avail < total * 0.3 ? '#f59e0b' : '#22c55e' } })
                    )
                  ),
                  React.createElement('td', { style: { fontSize: 13, color: item.location ? '#374151' : '#9ca3af' } },
                    item.location ? React.createElement('span', {}, '📍 ' + item.location) : '—'
                  ),
                  React.createElement('td', {},
                    React.createElement('div', { style: { display: 'flex', gap: 6 } },
                      React.createElement('button', { className: 'btn-ghost', style: { padding: '6px 12px', fontSize: 13 }, onClick: function() { openEdit(item); } }, '✏️ แก้ไข'),
                      React.createElement('button', { className: 'btn-danger', style: { padding: '6px 12px', fontSize: 13 }, onClick: function() { handleDelete(item); } }, '🗑️')
                    )
                  )
                );
              })
          )
        )
      )
    ),
    // Add/Edit Modal
    React.createElement(window.Modal, {
      open: showModal,
      onClose: function() { setShowModal(false); },
      title: editItem ? '✏️ แก้ไขอุปกรณ์' : '➕ เพิ่มอุปกรณ์',
      width: '560px'
    },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        // Image upload area
        React.createElement('div', {},
          React.createElement('label', { style: labelStyle }, 'รูปภาพอุปกรณ์'),
          React.createElement('div', { style: { display: 'flex', gap: 14, alignItems: 'flex-start' } },
            // Preview
            React.createElement('div', {
              onClick: function() { if (fileInputRef.current) fileInputRef.current.click(); },
              style: { width: 96, height: 96, borderRadius: 12, border: '2px dashed rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }
            },
              imagePreview
                ? React.createElement('img', { src: imagePreview, style: { width: '100%', height: '100%', objectFit: 'cover' } })
                : React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('div', { style: { fontSize: 28 } }, '📷'),
                    React.createElement('div', { style: { fontSize: 11, color: '#9ca3af', marginTop: 4 } }, 'คลิกเพื่อเลือก')
                  )
            ),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('button', { type: 'button', className: 'btn-ghost', style: { fontSize: 13, marginBottom: 8 }, onClick: function() { if (fileInputRef.current) fileInputRef.current.click(); } }, '📁 เลือกรูปภาพ'),
              React.createElement('div', { style: { fontSize: 12, color: '#9ca3af' } }, 'รองรับ JPG, PNG ขนาดไม่เกิน 5MB'),
              React.createElement('div', { style: { fontSize: 12, color: '#9ca3af', marginTop: 4 } }, 'ระบบจะอัปโหลดไปยัง Supabase Storage โดยอัตโนมัติ'),
              uploading && React.createElement('div', { style: { marginTop: 8 } },
                React.createElement('div', { style: { fontSize: 12, color: '#be185d', marginBottom: 4 } }, 'กำลังอัปโหลด... ' + uploadProgress + '%'),
                React.createElement('div', { style: { height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' } },
                  React.createElement('div', { style: { width: uploadProgress + '%', height: '100%', background: '#ec4899', borderRadius: 99, transition: 'width 0.3s' } })
                )
              )
            )
          ),
          React.createElement('input', { ref: fileInputRef, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: handleImageSelect })
        ),
        // Code + Name
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 } },
          React.createElement('div', {},
            React.createElement('label', { style: labelStyle }, 'รหัสอุปกรณ์'),
            React.createElement('input', { className: 'glass-input', style: inputStyle, placeholder: 'MATH-001', value: form.code, onChange: function(e) { setF('code', e.target.value); } })
          ),
          React.createElement('div', {},
            React.createElement('label', { style: labelStyle }, 'ชื่ออุปกรณ์ *'),
            React.createElement('input', { className: 'glass-input', style: inputStyle, placeholder: 'ชื่ออุปกรณ์', value: form.name, onChange: function(e) { setF('name', e.target.value); } })
          )
        ),
        // ประเภทอุปกรณ์
        React.createElement('div', {},
          React.createElement('label', { style: labelStyle }, 'ประเภทการใช้งาน'),
          React.createElement('div', { style: { display: 'flex', gap: 10 } },
            ['borrow', 'requisition'].map(function(type) {
              var labels = { borrow: { icon: '🔄', text: 'ยืมคืน', desc: 'ต้องส่งคืน' }, requisition: { icon: '📤', text: 'เบิกจ่าย', desc: 'ไม่ต้องส่งคืน' } };
              var L = labels[type];
              var selected = form.borrowType === type;
              return React.createElement('div', {
                key: type,
                onClick: function() { setF('borrowType', type); },
                style: { flex: 1, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', border: '2px solid ' + (selected ? '#ec4899' : 'rgba(0,0,0,0.1)'), background: selected ? 'rgba(236,72,153,0.08)' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }
              },
                React.createElement('div', { style: { fontSize: 20, marginBottom: 4 } }, L.icon),
                React.createElement('div', { style: { fontSize: 14, fontWeight: selected ? 700 : 500, color: selected ? '#be185d' : '#374151' } }, L.text),
                React.createElement('div', { style: { fontSize: 11, color: '#9ca3af' } }, L.desc)
              );
            })
          )
        ),
        // Quantities
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
          React.createElement('div', {},
            React.createElement('label', { style: labelStyle }, 'จำนวนทั้งหมด'),
            React.createElement('input', { type: 'number', min: 1, className: 'glass-input', style: inputStyle, value: form.totalQuantity, onChange: function(e) { setF('totalQuantity', e.target.value); } })
          ),
          React.createElement('div', {},
            React.createElement('label', { style: labelStyle }, 'จำนวนพร้อมให้ยืม'),
            React.createElement('input', { type: 'number', min: 0, className: 'glass-input', style: inputStyle, value: form.availableQuantity, onChange: function(e) { setF('availableQuantity', e.target.value); } })
          )
        ),
        // สถานที่เก็บ
        React.createElement('div', {},
          React.createElement('label', { style: labelStyle }, 'สถานที่เก็บ'),
          React.createElement('input', { className: 'glass-input', style: inputStyle, placeholder: 'เช่น ห้องพัสดุสาขาคณิตศาสตร์ ตู้ A1', value: form.location, onChange: function(e) { setF('location', e.target.value); } })
        ),
        // Description
        React.createElement('div', {},
          React.createElement('label', { style: labelStyle }, 'คำอธิบาย'),
          React.createElement('textarea', { className: 'glass-input', style: Object.assign({}, inputStyle, { minHeight: 60, resize: 'vertical' }), placeholder: 'รายละเอียดอุปกรณ์...', value: form.description, onChange: function(e) { setF('description', e.target.value); } })
        ),
        msg && React.createElement('div', { style: { fontSize: 13, color: '#dc2626' } }, msg),
        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
          React.createElement('button', { className: 'btn-secondary', onClick: function() { setShowModal(false); } }, 'ยกเลิก'),
          React.createElement('button', {
            className: 'btn-primary',
            disabled: uploading || saving,
            onClick: handleUploadAndSave
          }, uploading ? '⏳ กำลังอัปโหลด...' : saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก')
        )
      )
    ),
    // Delete confirm
    React.createElement(window.ConfirmDialog, {
      open: !!deleteTarget,
      title: 'ลบอุปกรณ์',
      message: deleteTarget ? 'ต้องการลบ "' + deleteTarget.name + '" ออกจากระบบ?' : '',
      onConfirm: confirmDelete,
      onCancel: function() { setDeleteTarget(null); }
    })
  );
};

// ---- Student: Equipment Catalog ----
window.StudentEquipmentCatalog = function() {
  var ctx = window.useApp();
  var state = ctx.state; var actions = ctx.actions;
  var equipment = state.equipment || [];
  var studentId = state.currentUserId;
  var student = state.students.find(function(s) { return s.id === studentId; });

  var [borrowItem, setBorrowItem] = React.useState(null);
  var [borrowForm, setBorrowForm] = React.useState({ quantity: 1, borrowDate: '', returnDate: '', reason: '' });
  var [submitting, setSubmitting] = React.useState(false);
  var [msg, setMsg] = React.useState('');
  var [successMsg, setSuccessMsg] = React.useState('');
  var [catSearch, setCatSearch] = React.useState('');

  var today = new Date().toISOString().split('T')[0];

  var openBorrow = function(item) {
    if ((item.availableQuantity || 0) === 0) return;
    setBorrowItem(item);
    setBorrowForm({ quantity: 1, borrowDate: today, returnDate: '', reason: '' });
    setMsg(''); setSuccessMsg('');
  };

  var handleSubmit = function() {
    if (!borrowForm.borrowDate || !borrowForm.returnDate) { setMsg('⚠ กรุณาระบุวันที่ยืมและวันที่คืน'); return; }
    if (borrowForm.returnDate < borrowForm.borrowDate) { setMsg('⚠ วันคืนต้องหลังวันยืม'); return; }
    if (!borrowForm.reason.trim()) { setMsg('⚠ กรุณาระบุเหตุผลในการยืม'); return; }
    var qty = parseInt(borrowForm.quantity) || 1;
    if (qty < 1 || qty > (borrowItem.availableQuantity || 1)) { setMsg('⚠ จำนวนเกินที่มี'); return; }
    setSubmitting(true);
    var req = {
      studentId: studentId,
      studentName: student ? student.name : studentId,
      studentCode: student ? student.studentId : studentId,
      equipmentId: borrowItem.id,
      equipmentCode: borrowItem.code || '',
      equipmentName: borrowItem.name,
      quantity: qty,
      borrowDate: borrowForm.borrowDate,
      returnDate: borrowForm.returnDate,
      reason: borrowForm.reason.trim(),
      status: 'pending',
      borrowType: borrowItem.borrowType || 'borrow',
      createdAt: new Date().toISOString()
    };
    actions.addBorrowRequest(req).then(function() {
      setSubmitting(false);
      setBorrowItem(null);
      setSuccessMsg('✅ ส่งคำขอยืม "' + req.equipmentName + '" เรียบร้อยแล้ว');
      setTimeout(function() { setSuccessMsg(''); }, 4000);
    }).catch(function(e) { setSubmitting(false); setMsg('⚠ ส่งคำขอไม่สำเร็จ'); });
  };

  var setF = function(key, val) { setBorrowForm(function(f) { return Object.assign({}, f, { [key]: val }); }); };
  var labelStyle = { fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4, display: 'block' };
  var inputStyle = { width: '100%', padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' };

  var filteredCatalog = catSearch ? equipment.filter(function(item) { var q = catSearch.toLowerCase(); return (item.name||'').toLowerCase().includes(q) || (item.code||'').toLowerCase().includes(q); }) : equipment;

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'fade-in', style: { padding: '8px 4px', maxWidth: 1100, margin: '0 auto' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 } },
        React.createElement('div', {},
          React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937' } }, '📦 คลังอุปกรณ์คณิตศาสตร์'),
          React.createElement('p', { style: { fontSize: 14, color: '#6b7280', marginTop: 4 } }, 'คลิกที่อุปกรณ์เพื่อส่งคำขอยืม')
        ),
        React.createElement('input', { className: 'glass-input', placeholder: '🔍 ค้นหาอุปกรณ์...', value: catSearch, onChange: function(e) { setCatSearch(e.target.value); }, style: { padding: '9px 14px', fontSize: 14, flex: '1 1 160px', minWidth: 0, maxWidth: 260, boxSizing: 'border-box' } })
      ),
      successMsg && React.createElement('div', { style: { padding: '12px 16px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, marginBottom: 16, fontSize: 14, color: '#15803d', fontWeight: 600 } }, successMsg),
      // Grid
      filteredCatalog.length === 0
        ? React.createElement('div', { style: { textAlign: 'center', color: '#9ca3af', padding: '48px' } }, catSearch ? 'ไม่พบอุปกรณ์ที่ค้นหา' : 'ยังไม่มีอุปกรณ์ในระบบ')
        : React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 } },
            filteredCatalog.map(function(item) {
              var avail = item.availableQuantity || 0;
              var available = avail > 0;
              return React.createElement('div', {
                key: item.id,
                className: 'glass-card',
                style: { overflow: 'hidden', cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.65, transition: 'all 0.2s', border: available ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(239,68,68,0.3)' },
                onClick: function() { openBorrow(item); }
              },
                // Image
                React.createElement('div', { style: { height: 140, background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } },
                  item.imageUrl
                    ? React.createElement('img', { src: item.imageUrl, style: { width: '100%', height: '100%', objectFit: 'cover' } })
                    : React.createElement('div', { style: { fontSize: 48, opacity: 0.4 } }, '📦')
                ),
                // Info
                React.createElement('div', { style: { padding: '14px 16px' } },
                  React.createElement('div', { style: { fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' } }, item.code || ''),
                  React.createElement('div', { style: { fontSize: 15, fontWeight: 700, color: '#1f2937', marginTop: 4, marginBottom: 8 } }, item.name),
                  item.location && React.createElement('div', { style: { fontSize: 12, color: '#6b7280', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 } }, '📍 ' + item.location),
                  // Availability
                  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    React.createElement('span', { style: { fontSize: 12, color: '#6b7280' } }, 'คงเหลือ'),
                    React.createElement('span', { style: { fontSize: 14, fontWeight: 700, color: avail === 0 ? '#dc2626' : avail <= 2 ? '#d97706' : '#15803d' } }, avail + '/' + (item.totalQuantity || 0))
                  ),
                  React.createElement('div', { style: { marginTop: 6, height: 5, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow: 'hidden' } },
                    React.createElement('div', { style: { width: (avail / (item.totalQuantity || 1) * 100) + '%', height: '100%', background: avail === 0 ? '#ef4444' : avail <= 2 ? '#f59e0b' : '#22c55e', borderRadius: 99 } })
                  ),
                  React.createElement('div', { style: { marginTop: 10, padding: '6px 0', textAlign: 'center', borderRadius: 8, fontSize: 13, fontWeight: 600, background: available ? 'rgba(219,39,119,0.1)' : 'rgba(239,68,68,0.1)', color: available ? '#be185d' : '#dc2626' } },
                    available ? (item.borrowType === 'requisition' ? '👆 คลิกเพื่อขอเบิก' : '👆 คลิกเพื่อยืม') : '❌ ไม่มีคงเหลือ'
                  )
                )
              );
            })
          )
    ),
    // Borrow modal
    React.createElement(window.Modal, {
      open: !!borrowItem,
      onClose: function() { setBorrowItem(null); },
      title: borrowItem ? (borrowItem.borrowType === 'requisition' ? '📤 ส่งคำขอเบิก' : '📋 ส่งคำขอยืม') : '📋 ส่งคำขอยืม',
      width: '480px'
    },
      borrowItem && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        // Equipment info
        React.createElement('div', { style: { display: 'flex', gap: 12, padding: '12px 16px', background: 'rgba(219,39,119,0.06)', borderRadius: 10 } },
          React.createElement('div', { style: { fontSize: 28 } }, '📦'),
          React.createElement('div', {},
            React.createElement('div', { style: { fontSize: 15, fontWeight: 700 } }, borrowItem.name),
            React.createElement('div', { style: { fontSize: 12, color: '#6b7280' } }, 'คงเหลือ ' + (borrowItem.availableQuantity || 0) + ' ชิ้น'),
            borrowItem.location && React.createElement('div', { style: { fontSize: 12, color: '#6b7280', marginTop: 2 } }, '📍 สถานที่เก็บ: ' + borrowItem.location)
          )
        ),
        // Quantity
        React.createElement('div', {},
          React.createElement('label', { style: labelStyle }, 'จำนวนที่ต้องการยืม'),
          React.createElement('input', { type: 'number', min: 1, max: borrowItem.availableQuantity || 1, className: 'glass-input', style: inputStyle, value: borrowForm.quantity, onChange: function(e) { setF('quantity', e.target.value); } })
        ),
        // Dates
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
          React.createElement('div', {},
            React.createElement('label', { style: labelStyle }, 'วันที่ยืม'),
            React.createElement('input', { type: 'date', className: 'glass-input', style: inputStyle, value: borrowForm.borrowDate, onChange: function(e) { setF('borrowDate', e.target.value); } })
          ),
          React.createElement('div', {},
            React.createElement('label', { style: labelStyle }, 'วันที่คาดว่าจะคืน'),
            React.createElement('input', { type: 'date', className: 'glass-input', style: inputStyle, value: borrowForm.returnDate, onChange: function(e) { setF('returnDate', e.target.value); } })
          )
        ),
        // Reason
        React.createElement('div', {},
          React.createElement('label', { style: labelStyle }, 'เหตุผลในการยืม *'),
          React.createElement('textarea', { className: 'glass-input', style: Object.assign({}, inputStyle, { minHeight: 72, resize: 'vertical' }), placeholder: 'เช่น นำไปใช้ฝึกสอนวิชาคณิตศาสตร์ / จัดกิจกรรมการเรียนรู้...', value: borrowForm.reason, onChange: function(e) { setF('reason', e.target.value); } })
        ),
        msg && React.createElement('div', { style: { fontSize: 13, color: '#dc2626' } }, msg),
        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
          React.createElement('button', { className: 'btn-secondary', onClick: function() { setBorrowItem(null); } }, 'ยกเลิก'),
          React.createElement('button', { className: 'btn-primary', disabled: submitting, onClick: handleSubmit }, submitting ? '⏳ กำลังส่ง...' : borrowItem && borrowItem.borrowType === 'requisition' ? '📤 ส่งคำขอเบิก' : '📤 ส่งคำขอยืม')
        )
      )
    )
  );
};

// ---- Student: My Borrow Requests ----
window.StudentMyBorrowsView = function() {
  var ctx = window.useApp();
  var state = ctx.state; var actions = ctx.actions;
  var studentId = state.currentUserId;
  var allRequests = state.borrowRequests || [];
  var equipment = state.equipment || [];
  var myRequests = allRequests.filter(function(r) { return r.studentId === studentId; });

  var [borrowSearch, setBorrowSearch] = React.useState('');
  var [editItem, setEditItem] = React.useState(null);
  var [editForm, setEditForm] = React.useState({ quantity: 1, borrowDate: '', returnDate: '', reason: '' });
  var [deleteTarget, setDeleteTarget] = React.useState(null);
  var [submitting, setSubmitting] = React.useState(false);
  var [editMsg, setEditMsg] = React.useState('');

  var statusMap = {
    pending:  { label: 'รออนุมัติ',       color: '#d97706', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', icon: '🟡' },
    approved: { label: 'อนุมัติแล้ว/ยืมอยู่', color: '#1d4ed8', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', icon: '🟢' },
    returned: { label: 'คืนแล้ว',          color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.35)', icon: '🔴' },
    rejected: { label: 'ปฏิเสธ',           color: '#dc2626', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',   icon: '❌' }
  };

  var openEdit = function(req) {
    setEditItem(req);
    setEditForm({ quantity: req.quantity || 1, borrowDate: req.borrowDate || '', returnDate: req.returnDate || '', reason: req.reason || '' });
    setEditMsg('');
  };

  // จำนวนสูงสุดที่แก้ได้ = คงเหลือของอุปกรณ์ตอนนี้ (คำขอที่รออนุมัติยังไม่ได้ตัดสต็อก)
  var editMaxQty = function() {
    if (!editItem) return 1;
    var eq = equipment.find(function(e) { return e.id === editItem.equipmentId; });
    return eq ? (eq.availableQuantity || 0) : (editItem.quantity || 1);
  };

  var handleSaveEdit = function() {
    if (!editItem) return;
    if (!editForm.borrowDate || !editForm.returnDate) { setEditMsg('⚠ กรุณาระบุวันที่ยืมและวันที่คืน'); return; }
    if (editForm.returnDate < editForm.borrowDate) { setEditMsg('⚠ วันคืนต้องหลังวันยืม'); return; }
    if (!editForm.reason.trim()) { setEditMsg('⚠ กรุณาระบุเหตุผลในการยืม'); return; }
    var qty = parseInt(editForm.quantity) || 1;
    var maxQty = editMaxQty();
    if (qty < 1 || qty > maxQty) { setEditMsg('⚠ จำนวนต้องอยู่ระหว่าง 1 ถึง ' + maxQty); return; }
    setSubmitting(true);
    actions.updateBorrowRequest(editItem.id, {
      quantity: qty, borrowDate: editForm.borrowDate, returnDate: editForm.returnDate, reason: editForm.reason.trim()
    }).then(function() {
      setSubmitting(false); setEditItem(null);
    }).catch(function(e) {
      setSubmitting(false); setEditMsg('⚠ บันทึกไม่สำเร็จ: ' + (e && e.message ? e.message : 'กรุณาลองใหม่'));
    });
  };

  var confirmDelete = function() {
    if (!deleteTarget) return;
    var id = deleteTarget.id;
    setDeleteTarget(null);
    actions.deleteBorrowRequest(id).catch(function(e) {
      alert('⚠ ลบไม่สำเร็จ: ' + (e && e.message ? e.message : 'กรุณาลองใหม่'));
    });
  };

  var setEF = function(key, val) { setEditForm(function(f) { return Object.assign({}, f, { [key]: val }); }); };
  var labelStyle = { fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4, display: 'block' };
  var inputStyle = { width: '100%', padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' };

  var filteredBorrows = borrowSearch ? myRequests.filter(function(r) { return (r.equipmentName||'').toLowerCase().includes(borrowSearch.toLowerCase()); }) : myRequests;

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'fade-in', style: { padding: '8px 4px', maxWidth: 900, margin: '0 auto' } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', {},
        React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937' } }, '📋 ประวัติการยืมของฉัน'),
        React.createElement('p', { style: { fontSize: 14, color: '#6b7280', marginTop: 4 } }, 'คำขอทั้งหมด ' + myRequests.length + ' รายการ')
      ),
      React.createElement('input', { className: 'glass-input', placeholder: '🔍 ค้นหาอุปกรณ์...', value: borrowSearch, onChange: function(e) { setBorrowSearch(e.target.value); }, style: { padding: '9px 14px', fontSize: 14, flex: '1 1 160px', minWidth: 0, maxWidth: 260, boxSizing: 'border-box' } })
    ),
    filteredBorrows.length === 0
      ? React.createElement('div', { className: 'glass-card', style: { padding: '48px', textAlign: 'center', color: '#9ca3af' } }, borrowSearch ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีประวัติการยืม')
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
          filteredBorrows.map(function(req) {
            var sm = statusMap[req.status] || statusMap.pending;
            var eqLoc = (equipment.find(function(e) { return e.id === req.equipmentId; }) || {}).location;
            var isOverdue = req.status === 'approved' && req.returnDate && req.returnDate < new Date().toISOString().split('T')[0];
            var canModify = req.status === 'pending';
            return React.createElement('div', { key: req.id, className: 'glass-card', style: { padding: '16px 20px', borderLeft: '4px solid ' + sm.color + (isOverdue ? '' : ''), background: isOverdue ? 'rgba(239,68,68,0.04)' : undefined } },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' } },
                React.createElement('div', { style: { flex: '1 1 200px', minWidth: 0 } },
                  React.createElement('div', { style: { fontSize: 16, fontWeight: 700, marginBottom: 4 } }, req.equipmentName),
                  React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, 'จำนวน ' + req.quantity + ' ชิ้น • ยืม ' + req.borrowDate + ' → คืน ' + req.returnDate),
                  eqLoc && React.createElement('div', { style: { fontSize: 13, color: '#6b7280', marginTop: 2 } }, '📍 สถานที่เก็บ: ' + eqLoc),
                  React.createElement('div', { style: { fontSize: 13, color: '#6b7280', marginTop: 2 } }, 'เหตุผล: ' + req.reason),
                  isOverdue && React.createElement('div', { style: { marginTop: 6, fontSize: 12, fontWeight: 700, color: '#dc2626' } }, '⚠️ เกินกำหนดคืน!')
                ),
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 } },
                  React.createElement('span', { style: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: sm.bg, color: sm.color, border: '1px solid ' + sm.border, whiteSpace: 'nowrap' } }, sm.icon + ' ' + sm.label),
                  React.createElement('span', { style: { fontSize: 11, color: '#9ca3af' } }, req.createdAt ? req.createdAt.substring(0, 10) : ''),
                  canModify && React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 2 } },
                    React.createElement('button', { className: 'btn-ghost', style: { padding: '5px 10px', fontSize: 12 }, onClick: function() { openEdit(req); } }, '✏️ แก้ไข'),
                    React.createElement('button', { className: 'btn-danger', style: { padding: '5px 10px', fontSize: 12 }, onClick: function() { setDeleteTarget(req); } }, '🗑️ ลบ')
                  )
                )
              )
            );
          })
        )
    ),
    // Edit modal (เฉพาะคำขอที่รออนุมัติ)
    React.createElement(window.Modal, {
      open: !!editItem,
      onClose: function() { setEditItem(null); },
      title: '✏️ แก้ไขคำขอยืม',
      width: '480px'
    },
      editItem && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        React.createElement('div', { style: { display: 'flex', gap: 12, padding: '12px 16px', background: 'rgba(219,39,119,0.06)', borderRadius: 10 } },
          React.createElement('div', { style: { fontSize: 28 } }, '📦'),
          React.createElement('div', {},
            React.createElement('div', { style: { fontSize: 15, fontWeight: 700 } }, editItem.equipmentName),
            React.createElement('div', { style: { fontSize: 12, color: '#6b7280' } }, 'ยืมได้สูงสุด ' + editMaxQty() + ' ชิ้น')
          )
        ),
        React.createElement('div', {},
          React.createElement('label', { style: labelStyle }, 'จำนวนที่ต้องการยืม'),
          React.createElement('input', { type: 'number', min: 1, max: editMaxQty(), className: 'glass-input', style: inputStyle, value: editForm.quantity, onChange: function(e) { setEF('quantity', e.target.value); } })
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
          React.createElement('div', {},
            React.createElement('label', { style: labelStyle }, 'วันที่ยืม'),
            React.createElement('input', { type: 'date', className: 'glass-input', style: inputStyle, value: editForm.borrowDate, onChange: function(e) { setEF('borrowDate', e.target.value); } })
          ),
          React.createElement('div', {},
            React.createElement('label', { style: labelStyle }, 'วันที่คาดว่าจะคืน'),
            React.createElement('input', { type: 'date', className: 'glass-input', style: inputStyle, value: editForm.returnDate, onChange: function(e) { setEF('returnDate', e.target.value); } })
          )
        ),
        React.createElement('div', {},
          React.createElement('label', { style: labelStyle }, 'เหตุผลในการยืม *'),
          React.createElement('textarea', { className: 'glass-input', style: Object.assign({}, inputStyle, { minHeight: 72, resize: 'vertical' }), value: editForm.reason, onChange: function(e) { setEF('reason', e.target.value); } })
        ),
        editMsg && React.createElement('div', { style: { fontSize: 13, color: '#dc2626' } }, editMsg),
        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
          React.createElement('button', { className: 'btn-secondary', onClick: function() { setEditItem(null); } }, 'ยกเลิก'),
          React.createElement('button', { className: 'btn-primary', disabled: submitting, onClick: handleSaveEdit }, submitting ? '⏳ กำลังบันทึก...' : '💾 บันทึก')
        )
      )
    ),
    React.createElement(window.ConfirmDialog, {
      open: !!deleteTarget,
      title: 'ลบคำขอยืม',
      message: deleteTarget ? 'ต้องการลบคำขอยืม "' + deleteTarget.equipmentName + '" ใช่หรือไม่?' : '',
      onConfirm: confirmDelete,
      onCancel: function() { setDeleteTarget(null); }
    })
  );
};

// ---- Advisor: Approval Dashboard ----
window.AdvisorBorrowApprovalView = function() {
  var ctx = window.useApp();
  var state = ctx.state; var actions = ctx.actions;
  var allRequests = state.borrowRequests || [];
  var equipment = state.equipment || [];
  var pendingRequests = allRequests.filter(function(r) { return r.status === 'pending'; });

  var [processing, setProcessing] = React.useState({});
  var [approveSearch, setApproveSearch] = React.useState('');

  var clearBusy = function(id) { setProcessing(function(p) { var n = Object.assign({}, p); delete n[id]; return n; }); };

  var handleApprove = function(req) {
    setProcessing(function(p) { return Object.assign({}, p, { [req.id]: true }); });
    actions.updateBorrowRequest(req.id, { status: 'approved', approvedAt: new Date().toISOString() }).then(function() {
      // นับยอดคงเหลือ: ลดจำนวนที่พร้อมให้ยืมลงตามที่อนุมัติ
      var eq = equipment.find(function(e) { return e.id === req.equipmentId; });
      if (eq) return actions.updateEquipment(eq.id, { availableQuantity: Math.max(0, (eq.availableQuantity || 0) - (req.quantity || 1)) });
    }).then(function() {
      clearBusy(req.id);
    }).catch(function(e) {
      clearBusy(req.id);
      alert('⚠ อนุมัติไม่สำเร็จ: ' + (e && e.message ? e.message : 'กรุณาลองใหม่'));
    });
  };

  var handleReject = function(req) {
    setProcessing(function(p) { return Object.assign({}, p, { [req.id]: true }); });
    actions.updateBorrowRequest(req.id, { status: 'rejected', rejectedAt: new Date().toISOString() }).then(function() {
      clearBusy(req.id);
    }).catch(function(e) {
      clearBusy(req.id);
      alert('⚠ ปฏิเสธไม่สำเร็จ: ' + (e && e.message ? e.message : 'กรุณาลองใหม่'));
    });
  };

  var filteredPending = approveSearch ? pendingRequests.filter(function(r) { var q = approveSearch.toLowerCase(); return (r.studentName||'').toLowerCase().includes(q) || (r.equipmentName||'').toLowerCase().includes(q); }) : pendingRequests;

  return React.createElement('div', { className: 'fade-in', style: { padding: '8px 4px', maxWidth: 900, margin: '0 auto' } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', {},
        React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937' } }, '✅ อนุมัติการยืมอุปกรณ์'),
        React.createElement('p', { style: { fontSize: 14, color: '#6b7280', marginTop: 4 } }, 'คำขอรออนุมัติ ' + pendingRequests.length + ' รายการ')
      ),
      React.createElement('input', { className: 'glass-input', placeholder: '🔍 ค้นหา นศ./อุปกรณ์...', value: approveSearch, onChange: function(e) { setApproveSearch(e.target.value); }, style: { padding: '9px 14px', fontSize: 14, flex: '1 1 160px', minWidth: 0, maxWidth: 260, boxSizing: 'border-box' } })
    ),
    filteredPending.length === 0
      ? React.createElement('div', { className: 'glass-card', style: { padding: '48px', textAlign: 'center', color: '#9ca3af' } }, approveSearch ? 'ไม่พบรายการที่ค้นหา' : '✅ ไม่มีคำขอรออนุมัติ')
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
          filteredPending.map(function(req) {
            var busy = processing[req.id];
            var eqLoc = (equipment.find(function(e) { return e.id === req.equipmentId; }) || {}).location;
            return React.createElement('div', { key: req.id, className: 'glass-card', style: { padding: '16px 20px' } },
              React.createElement('div', { style: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' } },
                React.createElement('div', { style: { flex: 1 } },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 } },
                    React.createElement('span', { style: { fontSize: 15, fontWeight: 700 } }, req.studentName),
                    React.createElement('code', { style: { fontSize: 12, color: '#6b7280' } }, req.studentCode || req.studentId)
                  ),
                  React.createElement('div', { style: { fontSize: 14, color: '#374151', marginBottom: 2 } }, '📦 ' + req.equipmentName + ' × ' + req.quantity),
                  React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, '📅 ' + req.borrowDate + ' → ' + req.returnDate),
                  eqLoc && React.createElement('div', { style: { fontSize: 13, color: '#6b7280', marginTop: 2 } }, '📍 ' + eqLoc),
                  React.createElement('div', { style: { fontSize: 13, color: '#6b7280', marginTop: 2 } }, '📝 ' + req.reason)
                ),
                React.createElement('div', { style: { display: 'flex', gap: 8, flexShrink: 0 } },
                  React.createElement('button', {
                    className: 'btn-primary', disabled: busy,
                    style: { padding: '8px 16px', fontSize: 13 },
                    onClick: function() { handleApprove(req); }
                  }, busy ? '...' : '✅ อนุมัติ'),
                  React.createElement('button', {
                    className: 'btn-danger', disabled: busy,
                    style: { padding: '8px 16px', fontSize: 13 },
                    onClick: function() { handleReject(req); }
                  }, busy ? '...' : '✗ ปฏิเสธ')
                )
              )
            );
          })
        )
  );
};

// ---- Advisor: Return Tracking ----
window.AdvisorReturnTrackingView = function() {
  var ctx = window.useApp();
  var state = ctx.state; var actions = ctx.actions;
  var allRequests = state.borrowRequests || [];
  var equipment = state.equipment || [];
  var activeLoans = allRequests.filter(function(r) { return r.status === 'approved' && r.borrowType !== 'requisition'; });
  var approvedRequisitions = allRequests.filter(function(r) { return r.status === 'approved' && r.borrowType === 'requisition'; });
  var today = new Date().toISOString().split('T')[0];

  var [processing, setProcessing] = React.useState({});
  var [returnSearch, setReturnSearch] = React.useState('');

  var handleReturn = function(req) {
    setProcessing(function(p) { return Object.assign({}, p, { [req.id]: true }); });
    actions.updateBorrowRequest(req.id, { status: 'returned', returnedAt: new Date().toISOString() }).then(function() {
      // นับยอดคงเหลือ: คืนจำนวนที่ยืมกลับเข้าสต็อก (ไม่เกินจำนวนทั้งหมด)
      var eq = equipment.find(function(e) { return e.id === req.equipmentId; });
      if (eq) return actions.updateEquipment(eq.id, { availableQuantity: Math.min(eq.totalQuantity || 0, (eq.availableQuantity || 0) + (req.quantity || 1)) });
    }).then(function() {
      setProcessing(function(p) { var n = Object.assign({}, p); delete n[req.id]; return n; });
    }).catch(function(e) {
      setProcessing(function(p) { var n = Object.assign({}, p); delete n[req.id]; return n; });
      alert('⚠ บันทึกการคืนไม่สำเร็จ: ' + (e && e.message ? e.message : 'กรุณาลองใหม่'));
    });
  };

  var searchedLoans = returnSearch ? activeLoans.filter(function(r) { var q = returnSearch.toLowerCase(); return (r.studentName||'').toLowerCase().includes(q) || (r.equipmentName||'').toLowerCase().includes(q); }) : activeLoans;
  var overdueLoans = searchedLoans.filter(function(r) { return r.returnDate && r.returnDate < today; });
  var onTimeLoans  = searchedLoans.filter(function(r) { return !r.returnDate || r.returnDate >= today; });

  var renderLoan = function(req, isOverdue) {
    var busy = processing[req.id];
    var eqLoc = (equipment.find(function(e) { return e.id === req.equipmentId; }) || {}).location;
    var daysLeft = req.returnDate ? Math.ceil((new Date(req.returnDate) - new Date(today)) / 86400000) : null;
    return React.createElement('div', { key: req.id, className: 'glass-card', style: { padding: '14px 18px', borderLeft: '4px solid ' + (isOverdue ? '#ef4444' : '#3b82f6'), background: isOverdue ? 'rgba(239,68,68,0.04)' : undefined } },
      React.createElement('div', { style: { display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' } },
        React.createElement('div', { style: { flex: '1 1 200px', minWidth: 0 } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 } },
            isOverdue && React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: '#dc2626', background: 'rgba(239,68,68,0.12)', padding: '2px 8px', borderRadius: 20 } }, '⚠️ เกินกำหนด ' + Math.abs(daysLeft) + ' วัน'),
            !isOverdue && daysLeft !== null && daysLeft <= 2 && React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: '#d97706', background: 'rgba(245,158,11,0.12)', padding: '2px 8px', borderRadius: 20 } }, '⏰ อีก ' + daysLeft + ' วัน')
          ),
          React.createElement('div', { style: { fontWeight: 700, fontSize: 15 } }, req.studentName + ' '),
          React.createElement('div', { style: { fontSize: 13, color: '#374151' } }, '📦 ' + req.equipmentName + ' × ' + req.quantity),
          React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, '📅 ยืม ' + req.borrowDate + ' • กำหนดคืน ' + req.returnDate),
          eqLoc && React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, '📍 ' + eqLoc)
        ),
        React.createElement('button', {
          className: 'btn-primary', disabled: busy,
          style: { padding: '8px 16px', fontSize: 13, flexShrink: 0 },
          onClick: function() { handleReturn(req); }
        }, busy ? '...' : '✅ ยืนยันคืนแล้ว')
      )
    );
  };

  return React.createElement('div', { className: 'fade-in', style: { padding: '8px 4px', maxWidth: 900, margin: '0 auto' } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', {},
        React.createElement('h1', { style: { fontSize: 22, fontWeight: 800, color: '#1f2937' } }, '📦 ติดตามการคืนอุปกรณ์'),
        React.createElement('p', { style: { fontSize: 14, color: '#6b7280', marginTop: 4 } }, 'กำลังยืมอยู่ ' + activeLoans.length + ' รายการ')
      ),
      React.createElement('input', { className: 'glass-input', placeholder: '🔍 ค้นหา นศ./อุปกรณ์...', value: returnSearch, onChange: function(e) { setReturnSearch(e.target.value); }, style: { padding: '9px 14px', fontSize: 14, flex: '1 1 160px', minWidth: 0, maxWidth: 260, boxSizing: 'border-box' } })
    ),
    // Overdue section
    overdueLoans.length > 0 && React.createElement('div', { style: { marginBottom: 20 } },
      React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 } },
        React.createElement('span', { style: { padding: '4px 12px', background: 'rgba(239,68,68,0.15)', borderRadius: 20 } }, '🔴 เกินกำหนดคืน ' + overdueLoans.length + ' รายการ')
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        overdueLoans.map(function(r) { return renderLoan(r, true); })
      )
    ),
    // Active loans
    onTimeLoans.length > 0 && React.createElement('div', {},
      overdueLoans.length > 0 && React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 10 } }, '🟢 ยืมอยู่ (ยังไม่เกินกำหนด)'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        onTimeLoans.map(function(r) { return renderLoan(r, false); })
      )
    ),
    activeLoans.length === 0 && approvedRequisitions.length === 0 && React.createElement('div', { className: 'glass-card', style: { padding: '48px', textAlign: 'center', color: '#9ca3af' } }, returnSearch ? 'ไม่พบรายการที่ค้นหา' : 'ไม่มีอุปกรณ์ที่กำลังถูกยืมอยู่'),
    approvedRequisitions.length > 0 && React.createElement('div', { style: { marginTop: 20 } },
      React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#7c3aed', marginBottom: 10 } }, '📤 รายการเบิกจ่ายที่อนุมัติแล้ว (ไม่ต้องส่งคืน)'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        approvedRequisitions.map(function(req) {
          var reqLoc = (equipment.find(function(e) { return e.id === req.equipmentId; }) || {}).location;
          return React.createElement('div', { key: req.id, className: 'glass-card', style: { padding: '12px 16px', borderLeft: '4px solid #8b5cf6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('div', {},
              React.createElement('div', { style: { fontWeight: 600 } }, req.studentName),
              React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, '📦 ' + req.equipmentName + ' × ' + req.quantity + ' • วันที่เบิก ' + req.borrowDate),
              reqLoc && React.createElement('div', { style: { fontSize: 13, color: '#6b7280' } }, '📍 ' + reqLoc)
            ),
            React.createElement('span', { style: { fontSize: 12, padding: '4px 10px', background: 'rgba(139,92,246,0.12)', color: '#7c3aed', borderRadius: 20, fontWeight: 600 } }, '✅ เบิกแล้ว')
          );
        })
      )
    )
  );
};

console.log('✅ Borrow.js loaded');
