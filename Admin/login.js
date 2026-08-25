document.getElementById('admin-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
 
    const errorBox = document.getElementById('login-error');
    const form = document.getElementById('admin-login-form');
    const formData = new FormData(form);
    const dataObject = Object.fromEntries(formData.entries());
 
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
          //storing token
            localStorage.setItem('tk_admin_token', data.token);
            localStorage.setItem('tk_admin_username', data.username);
            window.location.href = '/Admin/admin.html';
        } else {
            errorBox.textContent = data.error || 'Invalid username or password.';
        }
    } catch (error) {
        console.error('Network Error: ', error);
        errorBox.textContent = 'Unable to reach server.';
    }
});

document.getElementById('back-home')?.addEventListener('click', () => {
  window.location.href = '/index.html';
});