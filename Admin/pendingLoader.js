async function loadRegistrations() {
    try {
        const response = await fetch('/api/auth/users');
        const data = await response.json();

        const requestsList = document.getElementById('requests-list');

        requestsList.innerHTML = '';

        data.users.forEach((item, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'item-wrapper';

            wrapper.innerHTML = `
            <div class="databaseResponse">
                <h6>${item.name}</h6>
                <br>
                <h6>${item.IGN}</h6>
                <br>
                <h6>${item.UID}</h6>
                <br>
                <h6>${item.streamerId}</h6>
            </div>`;

            requestsList.appendChild(wrapper);
        });
    } catch (err) {
        console.error("Error fetching registrars", err);

    }
}

loadRegistrations();