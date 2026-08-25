  // Application form for new users
  document.getElementById('reg-form').addEventListener('submit', async (event) => {
  event.preventDefault();

    const form = document.getElementById('reg-form');
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/routes/auth/register', {
          method: 'POST',
          body: formData
        });

    const data = await response.json();

    if(response.ok) {
        alert('Registration complete!');
        document.getElementById('reg-form').reset();
    } else {
        alert(`Error: ${data.error}`);
    }
    } catch (error) {
        console.error('Network Error: ', error);
        alert('Unable to reach Server!');
    }
});



