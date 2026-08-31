  // Application form for new users
  document.getElementById('reg-form').addEventListener('submit', async (event) => {
  event.preventDefault();

    const form = document.getElementById('reg-form');
    const formData = new FormData(form);

    TKLoader.show('/images/logo.png');

    try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          body: formData
        });

    const data = await response.json();

    if(response.ok) {
        alert('Registration complete!');
        TKLoader.hide();
        document.getElementById('reg-form').reset();
    } else {
        TKLoader.hide();
        alert(`Error: ${data.error}`);
    }
    } catch (error) {
        TKLoader.hide();
        console.error('Network Error: ', error);
        alert('Unable to reach Server!');
    }
});



