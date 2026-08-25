document.getElementById('adminregform').addEventListener('submit', async (event) => {
  event.preventDefault();

    const form = document.getElementById('adminregform');
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/auth/addAdmin', {
          method: 'POST',
          body: formData
        });

    const data = await response.json();

    if(response.ok) {
        alert('Registration complete!');
        document.getElementById('adminregform').reset();
    } else {
        alert(`Error: ${data.error}`);
    }
    } catch (error) {
        console.error('Network Error: ', error);
        alert('Unable to reach Server!');
    }
});


