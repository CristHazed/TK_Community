// admin.js - Top Kings Admin Portal Management Script

let pendingRequests = [];
let activeRoster = [];
let activeStreamers = [];
let currentRoleFilter = 'ALL';
let currentVersionFilter = 'ALL';
let pendingApprovalId = null;
let pendingKickId = null;


// ================================
// Admin Authentication
// ================================

const adminToken = localStorage.getItem('tk_admin_token');

if (!adminToken) {
  window.location.href = '/Admin/login.html';
}

(function checkAuthGuard() {
  const token = localStorage.getItem('tk_admin_token');
  if (!token) {
    // replace() drops the protected page from navigation history stack
    window.location.replace('/Admin/login.html');
  }
})();

// ================================
// Helpers
// ================================

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


function mapUserRecord(user) {
  return {
    id: user._id,
    name: user.name,
    ign: user.IGN,
    uid: user.UID,
    streamerId: user.streamerId,
    role: user.role,
    version: user.version || 'v1',

    fbLink: user.FB,

    gameProfileImg: user.inGProfile
      ? user.inGProfile.url
      : '',

    fbProfileImg: user.fbProfile
      ? user.fbProfile.url
      : '',

    username:
      user.username ||
      (user.IGN ? `@${user.IGN.toLowerCase()}` : ''),

    tiktokName:
      user.tiktokName ||
      user.IGN,

    tiktokUrl:
      user.tiktokUrl ||
      '',

    following:
      user.following ||
      0,

    followers:
      user.followers ||
      0,

    details:
      user.details ||
      '',

    image:
      user.streamerImage ||
      ''
  };
}


// ================================
// API Request
// ================================

async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('tk_admin_token');

  if (!token) {
    window.location.href = '/Admin/login.html';
    return;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const text = await res.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error('Server did not return JSON:', text);
    throw new Error('Server returned an unexpected response.');
  }

  if (!res.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

const adminLogoutBtn = document.getElementById('admin-logout-btn');
if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('tk_admin_token');
      sessionStorage.clear();
      window.location.replace('/Admin/login.html');
    }
  });
}

function initAdminPortal() {
  // Navigation Tab Switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      switchTab(tabId, button);
    });
  });

  // Search Input Listener
  const searchInput = document.getElementById('admin-roster-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderAdminRoster);
  }

  const pendingSearchInput = document.getElementById('pending-search');
  if (pendingSearchInput) {
    pendingSearchInput.addEventListener('input', renderRequests);
  }

  const streamerSearchInput = document.getElementById('streamer-search');
  if (streamerSearchInput) {
    streamerSearchInput.addEventListener('input', renderAdminStreamers);
  }

  // Refresh Button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadData);
  }

  // Role Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentRoleFilter = btn.getAttribute('data-role');
      renderAdminRoster();
    });
  });

  // Version Filter Buttons (All, V1, V2)
  const versionFilterBtns = document.querySelectorAll('.version-filter-btn');
  versionFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      versionFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentVersionFilter = btn.getAttribute('data-version');
      renderAdminRoster();
    });
  });

  // Member Edit Form Submission
  const editForm = document.getElementById('edit-member-form');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const idInput = document.getElementById('edit-member-id');
      const ignInput = document.getElementById('edit-member-ign');
      const roleInput = document.getElementById('edit-member-role');
      const versionInput = document.getElementById('edit-member-version');

      if (!idInput || !ignInput || !roleInput || !versionInput) return;

      const id = idInput.value;

      try {
        await apiRequest(`/api/admin/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ign: ignInput.value.trim(),
            role: roleInput.value,
            version: versionInput.value
          })
        });
        closeEditModal();
        await loadData();
      } catch (err) {
        console.error('Failed to update member:', err);
        alert(`Error: ${err.message}`);
      }
    });
  }

  const editStreamerForm = document.getElementById('edit-streamer-form');
  if (editStreamerForm) {
    editStreamerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const streamerId = document.getElementById('edit-streamer-id').value;

      const payload = {
        ign: document.getElementById('edit-streamer-ign').value.trim(),
        username: document.getElementById('edit-streamer-username').value.trim(),
        tiktokName: document.getElementById('edit-streamer-tiktok-name').value.trim(),
        following: document.getElementById('edit-streamer-following').value,
        followers: document.getElementById('edit-streamer-followers').value,
        tiktokUrl: document.getElementById('edit-streamer-tiktok-url').value.trim(),
        details: document.getElementById('edit-streamer-details').value.trim()
      };

      const imageInput = document.getElementById('edit-streamer-image');
      if (imageInput.files[0]) {
        payload.streamerImage = await readFileAsDataURL(imageInput.files[0]);
      }

      try {
        await apiRequest(`/api/admin/users/${streamerId}/streamer`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        closeStreamerModal();
        await loadData();
      } catch (err) {
        console.error('Failed to update streamer:', err);
        alert(`Error: ${err.message}`);
      }
    });
  }

  // Modal Background Click Controls
  window.addEventListener('click', (e) => {
    const approvalModal = document.getElementById('approvalModal');
    const editModal = document.getElementById('editModal');
    const kickModal = document.getElementById('kickModal');
    const applicantModal = document.getElementById('applicantModal');
    const imagePreviewModal = document.getElementById('imagePreviewModal');

    if (e.target === approvalModal) closeApprovalModal();
    if (e.target === editModal) closeEditModal();
    if (e.target === kickModal) closeKickModal();
    if (e.target === applicantModal) closeApplicantModal();
    if (e.target === imagePreviewModal) closeImagePreview();
  });

  loadData();
}

// Tab Switching Helper
function switchTab(tabId, targetBtn) {
  document
    .querySelectorAll('.tab-content')
    .forEach((el) => el.classList.remove('active'));
  document
    .querySelectorAll('.tab-btn')
    .forEach((el) => el.classList.remove('active'));

  const selectedTab = document.getElementById(tabId);
  if (selectedTab) selectedTab.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');
}

// Load data from the API
async function loadData() {
  try {
    const [pendingData, approvedData] = await Promise.all([
      apiRequest('/api/admin/users'),
      apiRequest('/api/admin/users/approved')
    ]);

    pendingRequests = (pendingData.users || []).map(mapUserRecord);

    const approvedUsers = (approvedData.users || []).map(mapUserRecord);
    activeStreamers = approvedUsers.filter((u) => u.role === 'Streamer');
    activeRoster = approvedUsers.filter((u) => u.role !== 'Streamer');
  } catch (err) {
    console.error('Failed to load data from server:', err);
    alert('Could not load data from the server. Please refresh and try again.');
    return;
  }

  const pendingCount = document.getElementById('pending-count');
  const rosterCount = document.getElementById('roster-count');

  if (pendingCount) pendingCount.innerText = pendingRequests.length;
  if (rosterCount) rosterCount.innerText = activeRoster.length;
  const streamerCount = document.getElementById('streamer-count');
  if (streamerCount) streamerCount.innerText = activeStreamers.length;

  renderRequests();
  renderAdminRoster();
  renderAdminStreamers();
}

// Render Pending Application Cards
function renderRequests() {
  const container = document.getElementById('requests-list');
  if (!container) return;
  container.innerHTML = '';

  const searchInput = document.getElementById('pending-search');
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const filteredRequests = pendingRequests.filter((request) =>
    [request.ign, request.name, request.role, request.uid]
      .filter(Boolean)
      .some((value) => value.toString().toLowerCase().includes(searchQuery)),
  );

  if (filteredRequests.length === 0) {
    container.innerHTML = `<p class="empty-state">${pendingRequests.length === 0 ? 'No pending registration requests.' : 'No applicants match your search.'}</p>`;
    return;
  }

  filteredRequests.forEach((req) => {
    const card = document.createElement('div');
    card.className = 'request-card applicant-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View application from ${req.ign}`);
    card.innerHTML = `
            <div class="request-header">
                <div>
                    <h3>${req.ign} <span style="font-size: 0.9rem; color: #888;">(${req.name})</span></h3>
                    <p style="color: var(--tk-red-primary, #d32f2f); font-weight: bold; margin-top: 0.2rem;">Preferred Role: ${req.role}</p>
                </div>
                <span class="applicant-view-label">View credentials &rsaquo;</span>
            </div>
        `;
    card.addEventListener('click', () => openApplicantModal(req.id));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openApplicantModal(req.id);
      }
    });
    container.appendChild(card);
  });
}

function renderAdminStreamers() {
  const container = document.getElementById('admin-streamers-list');
  if (!container) return;

  container.innerHTML = '';
  const searchInput = document.getElementById('streamer-search');
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const filteredStreamers = activeStreamers.filter((streamer) =>
    [streamer.ign, streamer.username, streamer.tiktokName, streamer.details]
      .filter(Boolean)
      .some((value) => value.toString().toLowerCase().includes(searchQuery)),
  );

  if (filteredStreamers.length === 0) {
    const message =
      activeStreamers.length === 0
        ? 'No streamers found.'
        : 'No streamers match your search.';
    container.innerHTML = `<p class="empty-state">${message}</p>`;
    return;
  }

  filteredStreamers
    .slice()
    .sort((a, b) => a.ign.localeCompare(b.ign))
    .forEach((streamer) => {
      const item = document.createElement('div');
      item.className = 'roster-admin-item streamer-admin-item';
      item.innerHTML = `
        <div class="roster-info streamer-admin-info">
          ${streamer.image ? `<img src="${streamer.image}" alt="${streamer.ign}" class="streamer-admin-avatar">` : '<div class="streamer-admin-avatar streamer-admin-avatar-empty">TK</div>'}
          <div>
            <h4>${streamer.ign} <small>${streamer.username || `@${streamer.ign.toLowerCase()}`}</small></h4>
            <span>${streamer.tiktokName || 'TikTok name not added'} · ${streamer.followers || 0} followers · ${streamer.following || 0} following</span>
          </div>
        </div>
        <button class="btn btn-refresh streamer-edit-btn" type="button">Edit</button>
      `;
      item
        .querySelector('.streamer-edit-btn')
        .addEventListener('click', () => openStreamerModal(streamer.id));
      container.appendChild(item);
    });
}

function openStreamerModal(id) {
  const streamer = activeStreamers.find(
    (item) => String(item.id) === String(id),
  );
  if (!streamer) return;

  document.getElementById('edit-streamer-id').value = streamer.id;
  document.getElementById('edit-streamer-ign').value = streamer.ign;
  document.getElementById('edit-streamer-username').value =
    streamer.username || `@${streamer.ign.toLowerCase()}`;
  document.getElementById('edit-streamer-tiktok-name').value =
    streamer.tiktokName || streamer.ign;
  document.getElementById('edit-streamer-following').value =
    streamer.following || 0;
  document.getElementById('edit-streamer-followers').value =
    streamer.followers || 0;
  document.getElementById('edit-streamer-tiktok-url').value =
    streamer.tiktokUrl || '';
  document.getElementById('edit-streamer-details').value =
    streamer.details || '';
  document.getElementById('edit-streamer-image').value = '';
  document.getElementById('editStreamerModal').style.display = 'flex';
}

function closeStreamerModal() {
  const modal = document.getElementById('editStreamerModal');
  if (modal) modal.style.display = 'none';
}

function openApplicantModal(id) {
  const req = pendingRequests.find((request) => String(request.id) === String(id));
  if (!req) return;

  const nameElement = document.getElementById('applicant-modal-name');
  const detailsElement = document.getElementById('applicant-modal-details');
  const proofsElement = document.getElementById('applicant-modal-proofs');
  const approveButton = document.getElementById('applicant-approve-btn');
  const rejectButton = document.getElementById('applicant-reject-btn');
  const modal = document.getElementById('applicantModal');

  if (!nameElement || !detailsElement || !proofsElement || !modal) return;

  nameElement.textContent = `${req.ign} (${req.name})`;
  detailsElement.innerHTML = `
    <p><strong>Preferred Role</strong><span>${req.role}</span></p>
    <p><strong>UID</strong><span>${req.uid}</span></p>
    <p><strong>Streamer Mode ID</strong><span>${req.streamerId}</span></p>
    <p><strong>Facebook</strong><a href="${req.fbLink}" target="_blank" rel="noopener">${req.fbLink}</a></p>
  `;
  proofsElement.innerHTML = `
    <div class="proof-box">
      <span>In-Game Profile</span>
      ${req.gameProfileImg ? `<button class="image-preview-trigger" type="button" onclick="openImagePreview('${req.gameProfileImg}', 'In-Game Profile')"><img src="${req.gameProfileImg}" alt="Game Profile"></button>` : '<p>No image provided</p>'}
    </div>
    <div class="proof-box">
      <span>FB Profile</span>
      ${req.fbProfileImg ? `<button class="image-preview-trigger" type="button" onclick="openImagePreview('${req.fbProfileImg}', 'FB Profile')"><img src="${req.fbProfileImg}" alt="Facebook Profile"></button>` : '<p>No image provided</p>'}
    </div>
  `;

  approveButton.onclick = () => {
    closeApplicantModal();
    openApprovalModal(id);
  };
  rejectButton.onclick = () => {
    closeApplicantModal();
    rejectMember(id);
  };
  modal.style.display = 'flex';
}

function closeApplicantModal() {
  const modal = document.getElementById('applicantModal');
  if (modal) modal.style.display = 'none';
}

function openImagePreview(src, label) {
  const modal = document.getElementById('imagePreviewModal');
  const image = document.getElementById('image-preview');
  const labelElement = document.getElementById('image-preview-label');
  if (!modal || !image || !labelElement) return;

  image.src = src;
  image.alt = `${label} attachment preview`;
  labelElement.textContent = label;
  modal.style.display = 'flex';
}

function closeImagePreview() {
  const modal = document.getElementById('imagePreviewModal');
  const image = document.getElementById('image-preview');
  if (modal) modal.style.display = 'none';
  if (image) image.removeAttribute('src');
}

// Render Active Members Roster
function renderAdminRoster() {
  const container = document.getElementById('admin-roster-list');
  if (!container) return;

  const searchInput = document.getElementById('admin-roster-search');
  const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';

  const filtered = activeRoster.filter((m) => {
    const matchesSearch = m.ign.toLowerCase().includes(searchQuery);
    const matchesRole =
      currentRoleFilter === 'ALL' || m.role === currentRoleFilter;
    const matchesVersion =
      currentVersionFilter === 'ALL' ||
      (m.version || 'v1') === currentVersionFilter;
    return matchesSearch && matchesRole && matchesVersion;
  });

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; font-size: 1.1rem; color: #888; padding: 2rem;">No active roster members found.</p>';
    return;
  }

  filtered.forEach((member) => {
    const versionBadge = member.version === 'v2' ? 'V2' : 'V1';
    const item = document.createElement('div');
    item.className = 'roster-admin-item';
    item.style.cssText =
      'display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; background: #222; margin-bottom: 0.5rem; border-radius: 4px;';

    item.innerHTML = `
            <div class="roster-info">
                <h4 style="margin: 0; font-size: 1.2rem;">${member.ign} <span style="font-size: 0.75rem; background: #d32f2f; color: #fff; padding: 0.1rem 0.4rem; border-radius: 3px; margin-left: 0.4rem;">${versionBadge}</span></h4>
                <span style="color: #aaa; font-size: 0.9rem;">Role: ${member.role}</span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-refresh edit-member-btn" type="button">Edit</button>
                <button class="btn btn-kick kick-member-btn" type="button">Kick Out</button>
            </div>
        `;
    item
      .querySelector('.edit-member-btn')
      .addEventListener('click', () => openEditModal(member.id));
    item
      .querySelector('.kick-member-btn')
      .addEventListener('click', () => openKickModal(member.id));
    container.appendChild(item);
  });
}

// Approval Modal Handlers
function openApprovalModal(id) {
  const req = pendingRequests.find((r) => String(r.id) === String(id));
  if (!req) return;

  pendingApprovalId = id;
  const nameElem = document.getElementById('approval-applicant-name');
  if (nameElem) nameElem.innerText = `${req.ign} (${req.role})`;

  const modal = document.getElementById('approvalModal');
  if (modal) modal.style.display = 'flex';
}

function closeApprovalModal() {
  pendingApprovalId = null;
  const modal = document.getElementById('approvalModal');
  if (modal) modal.style.display = 'none';
}

async function confirmApproval(versionChoice) {
  if (!pendingApprovalId) return;

  try {
    await apiRequest(`/api/admin/users/${pendingApprovalId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ version: versionChoice })
    });
    closeApprovalModal();
    await loadData();
  } catch (err) {
    console.error('Failed to approve user:', err);
    alert(`Error: ${err.message}`);
  }
}

// Member Edit Modal Handlers
function openEditModal(id) {
  const member = activeRoster.find((m) => String(m.id) === String(id));
  if (!member) return;

  const idInput = document.getElementById('edit-member-id');
  const ignInput = document.getElementById('edit-member-ign');
  const roleInput = document.getElementById('edit-member-role');
  const versionInput = document.getElementById('edit-member-version');
  const modal = document.getElementById('editModal');

  if (idInput && ignInput && roleInput && versionInput && modal) {
    idInput.value = member.id;
    ignInput.value = member.ign;
    roleInput.value = member.role;
    versionInput.value = member.version || 'v1';
    modal.style.display = 'flex';
  }
}

function closeEditModal() {
  const modal = document.getElementById('editModal');
  if (modal) modal.style.display = 'none';
}

// Kick Out Confirmation Modal Handlers
function openKickModal(id) {
  const member = activeRoster.find((m) => String(m.id) === String(id));
  if (!member) return;

  pendingKickId = id;
  const kickIgnElem = document.getElementById('kick-member-ign');
  const kickRoleElem = document.getElementById('kick-member-role');
  const kickVersionElem = document.getElementById('kick-member-version');

  if (kickIgnElem) kickIgnElem.innerText = member.ign;
  if (kickRoleElem) kickRoleElem.innerText = member.role;
  if (kickVersionElem)
    kickVersionElem.innerText = (member.version || 'v1').toUpperCase();

  const modal = document.getElementById('kickModal');
  if (modal) modal.style.display = 'flex';
}

function closeKickModal() {
  pendingKickId = null;
  const modal = document.getElementById('kickModal');
  if (modal) modal.style.display = 'none';
}

async function confirmKick() {
  if (!pendingKickId) return;

  try {
    await apiRequest(`/api/admin/users/${pendingKickId}/kick`, {
      method: 'PUT'
    });
    closeKickModal();
    await loadData();
  } catch (err) {
    console.error('Failed to kick member:', err);
    alert(`Error: ${err.message}`);
  }
}

// Rejection Handler
async function rejectMember(id) {
  if (!confirm('Are you sure you want to reject this registration request?')) return;

  try {
    await apiRequest(`/api/admin/users/${id}/reject`, {
      method: 'PUT'
    });

    await loadData();
  } catch (err) {
    console.error('Failed to reject user:', err);
    alert(`Error: ${err.message}`);
  }
}

const refreshBtn = document.getElementById('refresh-btn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', loadData);
}

document.addEventListener('DOMContentLoaded', initAdminPortal);