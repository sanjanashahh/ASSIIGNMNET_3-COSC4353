let latestNotificationTime = Date.now(); // Initially set to the current time

// Function to format time as "Just now", "1 min ago", etc.
function formatTime(timestamp) {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInMinutes === 1) {
        return '1 min ago';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min ago`;
    } else if (diffInHours === 1) {
        return '1 hour ago';
    } else {
        return `${diffInHours} hours ago`;
    }
}

// Function to create a notification item for the list
function createNotificationItem(notification) {
    const listItem = document.createElement('li');
    listItem.className = 'notification-item';

    // Create header
    const header = document.createElement('div');
    header.className = 'notification-header';

    const typeDiv = document.createElement('div');
    typeDiv.className = `notification-${notification.type.toLowerCase()}`;
    typeDiv.textContent = notification.type;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'notification-time';
    timeSpan.textContent = formatTime(notification.time);  // Use formatted time

    // Add header elements
    header.appendChild(typeDiv);
    header.appendChild(timeSpan);

    // Create content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'notification-content';
    contentDiv.textContent = notification.content;

    // Append header and content to the list item
    listItem.appendChild(header);
    listItem.appendChild(contentDiv);

    return listItem;
}

// Function to show alert notification
function showAlert(notification) {
    const alertBox = document.createElement('div');
    alertBox.className = 'alert-box';
    alertBox.innerHTML = `
        <strong>${notification.type}:</strong> ${notification.content}
        <span class="close-alert">&times;</span>
    `;

    // Add the alert to the top of the body
    document.body.appendChild(alertBox);

    // Automatically remove the alert after 5 seconds
    setTimeout(() => {
        alertBox.remove();
    }, 5000);

    // Close alert manually when "x" is clicked
    alertBox.querySelector('.close-alert').addEventListener('click', () => {
        alertBox.remove();
    });
}

// Fetch notifications from the backend
async function fetchNotifications() {
    try {
        const response = await fetch('http://localhost:3000/notifications');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

// Render notifications using fetched data
async function renderNotifications() {
    const notificationList = document.getElementById('notification-list');
    const notifications = await fetchNotifications();

    notificationList.innerHTML = ''; // Clear any existing notifications

    notifications.forEach(notification => {
        const listItem = createNotificationItem(notification);
        notificationList.appendChild(listItem);
        
        // Check if the notification is new (timestamp greater than the latest tracked notification time)
        if (notification.time > latestNotificationTime) {
            showAlert(notification);  // Show alert for new notification
        }
    });

    // Update latestNotificationTime with the time of the most recent notification
    if (notifications.length > 0) {
        latestNotificationTime = Math.max(...notifications.map(n => n.time));
    }
}

// Set up an interval to check for new notifications every min
setInterval(renderNotifications, 1);

document.addEventListener('DOMContentLoaded', renderNotifications);