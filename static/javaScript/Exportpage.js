// Global variable to track file existence
let fileExists = false;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    checkFileExists();
});

/**
 * Check if CSV file exists on the server
 */


async function checkFileExists() {
    try {
        const response = await fetch('/download-data', { method: 'GET' });

        const downloadBtn = document.getElementById('downloadBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        const contentType = response.headers.get('Content-Type');

        if (contentType && contentType.includes('application/json')) {
            // File does not exist; backend responded with JSON
            const data = await response.json();
            console.warn('File not available:', data.message);
            fileExists = false;
            disableButtons(downloadBtn, deleteBtn);
        } else {
            // File exists (CSV)
            fileExists = true;
            enableButtons(downloadBtn, deleteBtn);
        }
    } catch (error) {
        console.error('Error checking file existence:', error);
        fileExists = false;
        const downloadBtn = document.getElementById('downloadBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        disableButtons(downloadBtn, deleteBtn);
    }
}


/**
 * Enable buttons when file exists
 */
function enableButtons(downloadBtn, deleteBtn) {
    downloadBtn.disabled = false;
    deleteBtn.disabled = false;
    downloadBtn.textContent = 'Download CSV';
    deleteBtn.textContent = 'Delete CSV';
}

/**
 * Disable buttons when file doesn't exist
 */
function disableButtons(downloadBtn, deleteBtn) {
    downloadBtn.disabled = true;
    deleteBtn.disabled = true;
    downloadBtn.textContent = 'No CSV Available';
    deleteBtn.textContent = 'No CSV to Delete';
}

/**
 * Handle download button click
 */
function handleDownload() {
    if (!fileExists) {
        showPopup();
        return;
    }
    
    // If file exists, proceed with download
    window.location.href = '/download-data';
}

/**
 * Handle delete button click
 */
function handleDelete() {
    if (!fileExists) {
        showPopup();
        return;
    }
    
    // If file exists, show confirmation and proceed with delete
    if (confirm('Are you sure you want to delete the CSV file? This action cannot be undone.')) {
        deleteFile();
    }
}

/**
 * Delete the CSV file
 */
function deleteFile() {
    // Redirect to delete route (which renders a template)
    window.location.href = '/delete-file';
}

/**
 * Show the popup modal
 */
function showPopup() {
    const popupOverlay = document.getElementById('popupOverlay');
    popupOverlay.style.display = 'flex';
}

/**
 * Close popup and redirect to home page
 */
function closePopupAndRedirect() {
    const popupOverlay = document.getElementById('popupOverlay');
    popupOverlay.style.display = 'none';
    
    // Redirect to home page after a short delay
    setTimeout(() => {
        window.location.href = '/';
    }, 100);
}

/**
 * Navigate to home page
 */
function goHome() {
    window.location.href = '/';
}

/**
 * Close popup when clicking outside the modal content
 */
document.addEventListener('click', function(event) {
    const popupOverlay = document.getElementById('popupOverlay');
    if (event.target === popupOverlay) {
        closePopupAndRedirect();
    }
});

/**
 * Handle escape key to close popup
 */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const popupOverlay = document.getElementById('popupOverlay');
        if (popupOverlay.style.display === 'flex') {
            closePopupAndRedirect();
        }
    }
});

const downloadBtn=document.getElementById('downloadBtn')
downloadBtn.onclick=handleDownload
const deleteBtn=document.getElementById('deleteBtn')
deleteBtn.onclick=handleDelete

/**
 * Refresh file status periodically (optional)
 */
// function startPeriodicCheck() {
//     setInterval(checkFileExists, 30000); // Check every 30 seconds
// }

// Uncomment the line below if you want periodic checks
// startPeriodicCheck();