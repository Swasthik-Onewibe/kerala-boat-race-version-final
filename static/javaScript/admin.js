let uploadedLogo = null;
let uploadedMusic = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logoInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file && file.size <= 5 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('logoImg').src = e.target.result;
                document.getElementById('logoPreview').style.display = 'block';
                uploadedLogo = file;
            };
            reader.readAsDataURL(file);
        } else {
            alert("Logo must be under 5MB.");
        }
    });

    // Add music upload handler
    document.getElementById('musicInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file && file.size <= 10 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('musicPlayer').src = e.target.result;
                document.getElementById('musicPreview').style.display = 'block';
                uploadedMusic = file;
            };
            reader.readAsDataURL(file);
        } else {
            alert("Music file must be under 10MB.");
        }
    });

    document.querySelector('.btn-primary').addEventListener('click', saveSettings);
    document.querySelector('.btn-secondary').addEventListener('click', resetAll);
});

function removeLogo() {
    document.getElementById('logoInput').value = '';
    document.getElementById('logoImg').src = '';
    document.getElementById('logoPreview').style.display = 'none';
    uploadedLogo = null;
}

function removeMusic() {
    document.getElementById('musicInput').value = '';
    document.getElementById('musicPlayer').src = '';
    document.getElementById('musicPreview').style.display = 'none';
    uploadedMusic = null;
}

function saveSettings() {
    if (!uploadedLogo && !uploadedMusic) {
        alert("Please upload at least a logo or music before saving.");
        return;
    }

    const formData = new FormData();
    if (uploadedLogo) {
        formData.append('logo', uploadedLogo);
    }
    if (uploadedMusic) {
        formData.append('music', uploadedMusic);
    }

    // Show progress bar
    document.getElementById('progressBar').style.display = 'block';
    document.getElementById('statusMessage').textContent = 'Saving settings...';

    fetch('/save-settings', {
    method: 'POST',
    body: formData,
    credentials: 'include'  // ✅ Important!
})
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById('statusMessage').textContent = 'Settings saved successfully!';
            document.getElementById('progressFill').style.width = '100%';
            
            // Redirect to home page instead of game page
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
        } else {
            document.getElementById('statusMessage').textContent = 'Failed to save settings.';
            alert(data.message || "Failed to save settings.");
;
        }
    })
    .catch(err => {
        console.error(err);
        document.getElementById('statusMessage').textContent = 'Upload failed.';
        alert("Upload failed.");
    })
    .finally(() => {
        document.getElementById('progressBar').style.display = 'none';
    });
}

function resetAll() {
    removeLogo();
    removeMusic();
    document.getElementById('statusMessage').textContent = '';
}