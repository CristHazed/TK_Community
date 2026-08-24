document.getElementById('reg-form').addEventListener('submit', async (event) => {
  event.preventDefault();


    const messageElement = document.getElementById('messageElement');
    const form = document.getElementById('reg-form');
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/register', {
    method: 'POST',
    body: formData
});

    const data = await response.json();

    if(response.ok) {
        messageElement.textContent = 'Success Register';
        messageElement.style.color = 'green';
        document.getElementById('reg-form').reset();
    } else {
        messageElement.textContent = `Error: ${data.error}`;
      messageElement.style.color = 'red';
    }
    } catch (error) {
        console.error('Network Error: ', error);
        messageElement.textContent = 'Could not reach server.';
        messageElement.style.color = 'red';
    }
});
