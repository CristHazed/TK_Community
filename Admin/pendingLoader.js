const requestsList = document.getElementById('requests-list');
const confirmationModal = document.getElementById('confirmation-modal');
const modalMessage = document.getElementById('modal-message');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

let activeTargetUserId = null;

async function loadRegistrations() {
    try {
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
            throw new Error(`HTTP network error! Status: ${response.status}`);
        }

        const data = await response.json();
        requestsList.innerHTML = '';

        if (!data.users || data.users.length === 0) {
            requestsList.innerHTML = `<h3 class="no-data-message">No pending registrations.</h3>`;
            return;
        }

        data.users.forEach((item) => {
            if (!item.name) return; 

            const wrapper = document.createElement('div');
            wrapper.className = 'item-wrapper';

            const dbResponse = document.createElement('div');
            dbResponse.className = 'databaseResponse';

            const nameEl = document.createElement('h6');
            nameEl.textContent = `Name: ${item.name}`;

            const ignEl = document.createElement('h6');
            ignEl.textContent = `IGN: ${item.IGN}`;

            const uidEl = document.createElement('h6');
            uidEl.textContent = `UID: ${item.UID}`;

            const streamerEl = document.createElement('h6');
            streamerEl.textContent = `Streamer ID: ${item.streamerId || 'N/A'}`;

            const ingImg = document.createElement('img');
            ingImg.style.width = '5rem';
            ingImg.alt = 'In Game Profile Image';
            if (item.inGProfile?.url) {
                ingImg.src = item.inGProfile.url;
            } else {
                ingImg.style.display = 'none';
            }

            const fbImg = document.createElement('img');
            fbImg.style.width = '5rem';
            fbImg.alt = 'Facebook Profile Image';
            if (item.fbProfile?.url) {
                fbImg.src = item.fbProfile.url;
            } else {
                fbImg.style.display = 'none';
            }

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


            approveBtn.onclick = () => handleAction(item._id || item.id, 'approve');

            const rejectBtn = document.createElement('button');
            rejectBtn.textContent = 'Reject';
            rejectBtn.className = 'btn-reject';
            rejectBtn.style.backgroundColor = '#dc3545';
            rejectBtn.style.color = '#fff';
            
            rejectBtn.onclick = () => {
                activeTargetUserId = item._id || item.id; 
                confirmationModal.style.display = 'flex';
            };

            actionContainer.appendChild(approveBtn);
            actionContainer.appendChild(rejectBtn);

            dbResponse.appendChild(nameEl);
            dbResponse.appendChild(ignEl);
            dbResponse.appendChild(uidEl);
            dbResponse.appendChild(streamerEl);
            dbResponse.appendChild(ingImg);
            dbResponse.appendChild(fbImg);
            dbResponse.appendChild(actionContainer);

            wrapper.appendChild(dbResponse);
            requestsList.appendChild(wrapper);
        });

    } catch (err) {
        console.error("Error fetching registrars", err);
        requestsList.style.display = 'flex';
        requestsList.style.justifyContent = 'center';
        requestsList.style.alignItems = 'center';
        requestsList.style.minHeight = '150px';
        requestsList.innerHTML = `<h1>Error Loading Data</h1>`;
    }
}

modalConfirmBtn.onclick = async () => {
    if (!activeTargetUserId) return;

    try {
        const response = await fetch(`api/admin/users/${activeTargetUserId}/reject`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Server Response Status: ${response.status}`);
        }

        alert(`Application successfully rejected!`);
        confirmationModal.style.display = 'none';
        
        loadRegistrations();
        fetchUserCount();
    } catch (err) {
        console.error('Failed to update status:', err);
        alert('Could not update status. Please try again.');
    }
};

modalCancelBtn.onclick = () => {
    confirmationModal.style.display = 'none';
    activeTargetUserId = null;
};


async function handleAction(userId, actionType) {
    try {
        const response = await fetch(`/api/auth/users/${userId}/${actionType}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to update user status to ${actionType}`);
        }

        alert(`Application successfully ${actionType}d!`);
        loadRegistrations();
        fetchUserCount();

    } catch (error) {
        console.error(`Error processing ${actionType}:`, error);
        alert(`Error executing operational update: ${error.message}`);
    }
}

async function fetchUserCount() {
    try {
        const response = await fetch('/api/admin/user-count');
        const data = await response.json();
        document.getElementById('pending-count').innerText = data.count;
    } catch (error) {
        console.error("Error loading account data count:", error);
        document.getElementById('pending-count').innerText = 'Error';
    }
}

loadRegistrations();
fetchUserCount();