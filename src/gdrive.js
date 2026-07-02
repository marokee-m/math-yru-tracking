// ============================================================
// Google Drive Uploader Helper
// ต้องกำหนด GDRIVE_CLIENT_ID ใน firebase-config.js ก่อนใช้งาน
// ============================================================

window.GDRIVE_FOLDERS = {
  LICENSE_EXAM: '1QoQi2Tgdm9cbrCIhnlvBBqBUHJad7_OA',
  EQUIPMENT:    '1ebC098WLr2mR0-aqpq3bsxWKZfwAZcno'
};

window.GDriveUploader = (function() {
  var _tokenClient = null;
  var _accessToken = null;
  var _pendingCallbacks = [];

  function _initTokenClient() {
    if (!window.GDRIVE_CLIENT_ID) {
      console.warn('GDrive: GDRIVE_CLIENT_ID not set');
      return false;
    }
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      console.warn('GDrive: Google Identity Services not loaded');
      return false;
    }
    if (_tokenClient) return true;
    _tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: window.GDRIVE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: function(response) {
        if (response.error) {
          _pendingCallbacks.forEach(function(cb) { cb(new Error(response.error)); });
          _pendingCallbacks = [];
          return;
        }
        _accessToken = response.access_token;
        var cbs = _pendingCallbacks.slice();
        _pendingCallbacks = [];
        cbs.forEach(function(cb) { cb(null, _accessToken); });
      }
    });
    return true;
  }

  function _getToken(callback) {
    if (_accessToken) { callback(null, _accessToken); return; }
    if (!_initTokenClient()) {
      callback(new Error('Google Drive ยังไม่ได้ตั้งค่า Client ID')); return;
    }
    _pendingCallbacks.push(callback);
    if (_pendingCallbacks.length === 1) {
      _tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  }

  function uploadFile(file, folderId, onProgress, callback) {
    if (typeof onProgress === 'function' && typeof callback === 'undefined') {
      callback = onProgress; onProgress = null;
    }
    _getToken(function(err, token) {
      if (err) { callback(err); return; }
      var metadata = { name: file.name, parents: [folderId] };
      var form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name');
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      if (onProgress) {
        xhr.upload.onprogress = function(e) {
          if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
        };
      }
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          var data = JSON.parse(xhr.responseText);
          // Make file public
          fetch('https://www.googleapis.com/drive/v3/files/' + data.id + '/permissions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'reader', type: 'anyone' })
          }).then(function() {
            callback(null, {
              fileId: data.id,
              fileName: data.name,
              viewUrl: 'https://drive.google.com/file/d/' + data.id + '/view',
              directUrl: 'https://drive.google.com/uc?export=view&id=' + data.id
            });
          }).catch(function(e) { callback(e); });
        } else {
          // Token might be expired — clear it
          _accessToken = null;
          callback(new Error('Upload failed: ' + xhr.responseText));
        }
      };
      xhr.onerror = function() { callback(new Error('Network error')); };
      xhr.send(form);
    });
  }

  function clearToken() { _accessToken = null; }

  return { uploadFile: uploadFile, clearToken: clearToken };
})();
