document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = 'http://localhost:3000/api/volunteer-history'; // Backend API URL

    // Initial fetch to populate the table
    fetchVolunteerHistory();

    // Set interval to fetch and update volunteer history every 10 seconds
    setInterval(fetchVolunteerHistory, 1); // Fetches new data every 10 seconds

    // Button or method to trigger the POST request (if needed)
    const triggerPostButton = document.querySelector('#trigger-post'); // Ensure you have a button with id "trigger-post"
    
    if (triggerPostButton) {
        triggerPostButton.addEventListener('click', function() {
            triggerPostMethod();
        });
    }
});

// Function to fetch and populate the volunteer history table
function fetchVolunteerHistory() {
    const apiUrl = 'http://localhost:3000/api/volunteer-history';
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            populateVolunteerHistory(data);
        })
        .catch(error => {
            console.error('Error fetching volunteer history:', error);
        });
}

// Function to populate the volunteer history table
function populateVolunteerHistory(volunteerData) {
    const tableBody = document.querySelector('#history-table tbody');
    
    // Clear the existing table rows
    tableBody.innerHTML = '';

    // Populate table with volunteer data
    volunteerData.forEach(volunteer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${volunteer.eventName}</td>
            <td>${volunteer.eventDate}</td>
            <td>${volunteer.location}</td>
            <td>${volunteer.department}</td>
            <td>${volunteer.skill}</td>
            <td>${volunteer.status}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to handle the POST method for adding new volunteer history
function triggerPostMethod() {
    const postUrl = 'http://localhost:3000/api/triggerVolunteerHistory';

    fetch(postUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log('New volunteer history added:', data);
        // Immediately fetch and update the table with the new data
        fetchVolunteerHistory();
    })
    .catch(error => {
        console.error('Error triggering volunteer history post:', error);
    });
}