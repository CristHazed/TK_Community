async function loadAdminCredentials() {
  try {
    const response = await fetch('./.private/credentials.json');
    if (!response.ok) {
      throw new Error('Failed to load credentials');
    }
    return await response.json();
  } catch (error) {
    console.error('Credentials load failed:', error);
    return {};
  }
}

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
