// Loader Function
const TKLoader = {
    show: function(logoUrl = 'logo.png') {
        // Prevent multiple modals from spawning
        if (document.getElementById('tk-loading-modal')) return;

        // 1. Inject Styles dynamically (only once)
        if (!document.getElementById('tk-loading-styles')) {
            const style = document.createElement('style');
            style.id = 'tk-loading-styles';
            style.textContent = `
                .tk-modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background-color: rgba(18, 18, 20, 0.95);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 9999; font-family: 'Courier New', Courier, monospace;
                    backdrop-filter: blur(8px);
                    transition: opacity 0.5s ease, visibility 0.5s ease;
                }
                .tk-modal-content {
                    display: flex; flex-direction: column; align-items: center; gap: 24px;
                }
                .tk-loading-logo {
                    width: 80px; height: auto;
                    animation: tk-pulse 1.5s infinite ease-in-out;
                    filter: drop-shadow(0 0 15px rgba(255, 77, 77, 0.6));
                }
                .tk-loading-text {
                    color: #ff4d4d; font-size: 14px; letter-spacing: 4px; 
                    font-weight: bold; text-transform: uppercase; 
                    text-shadow: 0 0 8px rgba(255, 77, 77, 0.4);
                }
                .tk-progress-bar {
                    width: 250px; height: 2px; background-color: #333; 
                    position: relative; overflow: hidden;
                }
                .tk-progress-fill {
                    width: 50%; height: 100%; background-color: #ff4d4d;
                    box-shadow: 0 0 10px #ff4d4d; position: absolute;
                    animation: tk-scan 1.5s infinite linear;
                }
                @keyframes tk-pulse {
                    0%, 100% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
                @keyframes tk-scan {
                    0% { left: -50%; }
                    100% { left: 100%; }
                }
            `;
            document.head.appendChild(style);
        }

        // 2. Create Elements
        const overlay = document.createElement('div');
        overlay.id = 'tk-loading-modal';
        overlay.className = 'tk-modal-overlay';

        const content = document.createElement('div');
        content.className = 'tk-modal-content';

        const logo = document.createElement('img');
        logo.src = logoUrl; 
        logo.alt = 'Top Kings Logo';
        logo.className = 'tk-loading-logo';

        const text = document.createElement('div');
        text.className = 'tk-loading-text';
        text.textContent = 'SYSTEM LOADING...';

        const progressBar = document.createElement('div');
        progressBar.className = 'tk-progress-bar';

        const progressFill = document.createElement('div');
        progressFill.className = 'tk-progress-fill';

        // 3. Assemble the DOM structure
        progressBar.appendChild(progressFill);
        content.appendChild(logo);
        content.appendChild(text);
        content.appendChild(progressBar);
        overlay.appendChild(content);

        // 4. Append to document body
        document.body.appendChild(overlay);
    },

    hide: function() {
        const overlay = document.getElementById('tk-loading-modal');
        if (overlay) {
            // Trigger the fade out transition
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            
            // Remove from DOM after the transition completes (0.5s)
            setTimeout(() => {
                overlay.remove();
            }, 500); 
        }
    }
};


document.getElementById('admin-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
 
    const errorBox = document.getElementById('login-error');
    const form = document.getElementById('admin-login-form');
    const formData = new FormData(form);
    const dataObject = Object.fromEntries(formData.entries());
    
    TKLoader.show('/images/logo.png');

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObject)
        });
 
        const text = await res.text();
        let data;
        
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Server did not return JSON. Raw response:", text);
            errorBox.textContent = "Server error: unexpected response.";
            return;
        }
 
        if (res.ok) {
            // Store token
            localStorage.setItem('tk_admin_token', data.token);
            localStorage.setItem('tk_admin_username', data.username);
            window.location.href = '/Admin/admin.html';
        } else {
            errorBox.textContent = data.error || 'Invalid username or password.';
        }
    } catch (error) {
        console.error('Network Error: ', error);
        errorBox.textContent = 'Unable to reach server.';
    } finally {
        TKLoader.hide(); 
    }
});

document.getElementById('back-home')?.addEventListener('click', () => {
  window.location.href = '/index.html';
});


