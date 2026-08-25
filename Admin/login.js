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
            window.location.href = '/Admin/admin.html';
        } else {
            errorBox.textContent = data.error || 'Invalid username or password.';
        }
    } catch (error) {
        console.error('Network Error: ', error);
        errorBox.textContent = 'Unable to reach server.';
    }
});
/*
const allowedAdminUsernames = new Set(['raya', 'nala', 'yaj', 'luwi', 'wushi']);

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('admin-login-form');
  const usernameInput = document.getElementById('admin-username');
  const passwordInput = document.getElementById('admin-password');
  const errorBox = document.getElementById('login-error');
  const backHomeBtn = document.getElementById('back-home');
  const adminCredentials = await loadAdminCredentials();

  const storedRole = localStorage.getItem('tk_admin_role');
  if (
    localStorage.getItem('tk_admin_logged_in') === 'true' &&
    allowedAdminUsernames.has(storedRole)
  ) {
    window.location.href = './admin.html';
    return;
  }

  localStorage.removeItem('tk_admin_logged_in');
  localStorage.removeItem('tk_admin_role');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    const expectedPassword = adminCredentials[username];

    if (
      allowedAdminUsernames.has(username) &&
      expectedPassword &&
      password === expectedPassword
    ) {
      localStorage.setItem('tk_admin_logged_in', 'true');
      localStorage.setItem('tk_admin_role', username);
      window.location.href = './admin.html';
      return;
    }

    errorBox.textContent = 'Invalid username or password.';
    passwordInput.value = '';
    usernameInput.focus();
  });

  backHomeBtn.addEventListener('click', () => {
    window.location.href = '/index.html';
  });
});
*/