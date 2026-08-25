document.getElementById('adminregform').addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = document.getElementById('adminregform');
    const formData = new FormData(form);
    const dataObject = Object.fromEntries(formData.entries());

    try {
        const res = await fetch('/api/auth/addAdmin', {
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
            alert("Server Error: Received unexpected response from server.");
            return;
        }

        if (res.ok) {
            alert('Registration complete!');
            form.reset();
        } else {
            alert(`Error: ${data.error || 'Unknown error occurred'}`);
        }
    } catch (error) {
        console.error('Network Error: ', error);
        alert('Unable to reach Server!');
    }
});