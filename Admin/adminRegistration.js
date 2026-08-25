document.getElementById('adminregform').addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = document.getElementById('adminregform');
    const formData = new FormData(form);
    
    // Convert form fields to an object
    const dataObject = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/auth/addAdmin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataObject)
        });

        // Read response text first to catch any unexpected text/HTML errors gracefully
        const responseText = await response.text();
        let data;
        
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Server did not return JSON. Raw response:", responseText);
            alert("Server Error: Received unexpected response from server.");
            return;
        }

        if (response.ok) {
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