const requestsList = document.getElementById('requests-list');
const confirmationModal = document.getElementById('confirmation-modal');
const modalMessage = document.getElementById('modal-message');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

let activeTargetUserId = null;

async function loadRegistrations() {
    try {
        const token = localStorage.getItem('tk_admin_token');

        const response = await fetch('/api/admin/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP network error! Status: ${response.status}`);
        }

        const data = await response.json();
        requestsList.innerHTML = '';

        if (!data.users || data.users.length === 0) {
            requestsList.innerHTML = `<h3 class="no-data-message">No pending registrations.</h3>`;
            return;
        }

        data.users.forEach((req) => {
            // FIX: Unified ID reference to handle MongoDB _id or standard id formats safely
            const targetId = req._id || req.id; 

            const card = document.createElement('div');
            card.className = 'request-card applicant-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `View application from ${req.IGN || 'Unknown'}`);
            card.innerHTML = `
                        <div class="request-header">
                            <div>
                                <h3>${req.IGN || 'N/A'} <span style="font-size: 0.9rem; color: #888;">(${req.name || 'No Name'})</span></h3>
                                <p style="color: var(--tk-red-primary, #d32f2f); font-weight: bold; margin-top: 0.2rem;">Preferred Role: ${req.role || 'None'}</p>
                            </div>
                            <span class="applicant-view-label">View credentials &rsaquo;</span>
                        </div>
                            `;
            
            card.addEventListener('click', () => {
                if (typeof openApplicantModal === 'function') openApplicantModal(targetId);
            });
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (typeof openApplicantModal === 'function') openApplicantModal(targetId);
                }
            });

            const actionContainer = document.createElement('div');
            actionContainer.className = 'action-buttons';
            actionContainer.style.display = 'flex';
            actionContainer.style.gap = '10px';
            actionContainer.style.marginTop = '15px';

            const approveBtn = document.createElement('button');
            approveBtn.textContent = 'Approve';
            approveBtn.className = 'btn-approve';
            approveBtn.style.backgroundColor = '#28a745';
            approveBtn.style.color = '#fff';
            approveBtn.onclick = (e) => {
                e.stopPropagation(); // FIX: Stops parent card modal from showing up on approval click
                handleAction(targetId, 'approve');
            };

            const rejectBtn = document.createElement('button');
            rejectBtn.textContent = 'Reject';
            rejectBtn.className = 'btn-reject';
            rejectBtn.style.backgroundColor = '#dc3545';
            rejectBtn.style.color = '#fff';
            rejectBtn.onclick = (e) => {
                e.stopPropagation(); // FIX: Stops parent card modal from showing up on rejection click
                activeTargetUserId = targetId; // FIX: Replaced undefined variable "item" with targetId
                if (confirmationModal) confirmationModal.style.display = 'flex';
            };

            actionContainer.appendChild(approveBtn);
            actionContainer.appendChild(rejectBtn);

            // FIX: Removed broken "data.appendChild" blocks and "dbResponse" append.
            // Appending action buttons directly to the visual card structure.
            card.appendChild(actionContainer);
            requestsList.appendChild(card);
        });

    } catch (err) {
        console.error("Error fetching registrars", err);
        if (requestsList) {
            requestsList.style.display = 'flex';
            requestsList.style.justifyContent = 'center';
            requestsList.style.alignItems = 'center';
            requestsList.style.minHeight = '150px';
            requestsList.innerHTML = `<h1>Error Loading Data</h1>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // FIX: Change 'modalConfirmBtn' to 'applicant-reject-btn' to match your HTML
    const modalConfirmBtn = document.getElementById('applicant-reject-btn'); 

    if (modalConfirmBtn) {
        modalConfirmBtn.onclick = async () => {
            if (!activeTargetUserId) return;

            try {
                const token = localStorage.getItem('tk_admin_token');
                
                const response = await fetch(`/api/admin/users/${activeTargetUserId}/reject`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Server Response Status: ${response.status}`);
                }

                alert(`Application successfully rejected!`);
                
                // FIX: Update this to match your real modal overlay ID ('applicantModal')
                const confirmationModal = document.getElementById('applicantModal');
                if (confirmationModal) {
                    confirmationModal.style.display = 'none';
                }
                
                activeTargetUserId = null; 
                
                if (typeof loadRegistrations === 'function') loadRegistrations();
                if (typeof fetchUserCount === 'function') fetchUserCount();
                
            } catch (err) {
                console.error('Failed to update status:', err);
                alert('Could not update status. Please try again.');
            }
        };
    } else {
        console.error("Could not find applicant-reject-btn in the DOM.");
    }
});

modalCancelBtn.onclick = () => {
    confirmationModal.style.display = 'none';
    activeTargetUserId = null;
};


async function handleAction(userId, actionType) {
    if (actionType !== 'approve') return;

    if (!confirm("Are you sure you want to approve this registration?")) return;

    try {
        const token = localStorage.getItem('tk_admin_token');

        const response = await fetch(`/api/admin/users/${userId}/approve`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ version: 'v1' }) 
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Failed to approve user');
        }

        alert(data.message); 
        
        loadRegistrations();
        fetchUserCount(); // Added count sync after an approval loop completes

    } catch (err) {
        console.error("Approval error:", err);
        alert(`Error: ${err.message}`);
    }
};

async function fetchUserCount() {
    try {
        const token = localStorage.getItem('tk_admin_token');
        const pendingCountEl = document.getElementById('pending-count');
        if (!pendingCountEl) return;
        
        const response = await fetch('/api/admin/user-count', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        pendingCountEl.innerText = data.count;
    } catch (error) {
        console.error("Error loading account data count:", error);
        const pendingCountEl = document.getElementById('pending-count');
        if (pendingCountEl) pendingCountEl.innerText = 'Error';
    }
}

// Initial Executions
loadRegistrations();
fetchUserCount();