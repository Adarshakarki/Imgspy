const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const searchActions = document.getElementById('searchActions');
const googleActionBtn = document.getElementById('googleActionBtn');
const yandexActionBtn = document.getElementById('yandexActionBtn');
const saucenaoActionBtn = document.getElementById('saucenaoActionBtn');
const deleteActionBtn = document.getElementById('deleteActionBtn');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');

let currentImageUrl = null;

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    themeIcon.src = isDark ? 'icons/moon.svg' : 'icons/sun.svg';
    themeIcon.alt = isDark ? 'Dark mode' : 'Light mode';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeIcon.src = 'icons/moon.svg';
    themeIcon.alt = 'Dark mode';
}

async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showError(`"${file.name}" is not a valid image file`);
        return;
    }
    await uploadImage(file);
}

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
        e.target.value = '';
    }
});

document.addEventListener('paste', (e) => {
    const items = Array.from(e.clipboardData.items).filter(item => 
        item.type.includes('image')
    );
    if (items.length > 0) {
        const file = items[0].getAsFile();
        if (file) handleFile(file);
    }
});

function showError(msg) {
    error.textContent = msg;
    error.classList.add('active');

    setTimeout(() => {
        error.style.animation = 'fadeOut 0.3s ease-out';
    }, 4700);
    
    setTimeout(() => {
        error.classList.remove('active');
        error.style.animation = '';
    }, 5000);
}

async function uploadImage(file) {
    loading.classList.add('active');
    
    try {
        const formData = new FormData();
        formData.append('reqtype', 'fileupload');
        formData.append('time', '1h');
        formData.append('filenamelen', '16');
        formData.append('fileToUpload', file);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const url = await response.text();
        if (!url.startsWith('https://')) {
            throw new Error('Invalid URL received');
        }
        currentImageUrl = url;
        showUploadedImagePreview(file);
        uploadArea.style.display = 'none';
        imagePreview.classList.add('active');
        searchActions.style.display = 'flex';
        googleActionBtn.href = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`;
        yandexActionBtn.href = `https://yandex.com/images/search?url=${encodeURIComponent(url)}&rpt=imageview`;
        saucenaoActionBtn.href = `https://saucenao.com/search.php?url=${encodeURIComponent(url)}`;

    } catch (err) {
        console.error('Upload error:', err);
        if (err.name === 'AbortError') {
            showError('Upload timed out. Litterbox might be down. Please try again.');
        } else {
            showError(`Failed to upload "${file.name}". Please try again.`);
        }
        resetToUploadState();
    } finally {
        loading.classList.remove('active');
    }
}

function showUploadedImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function resetToUploadState() {
    imagePreview.classList.remove('active');
    searchActions.style.display = 'none';
    uploadArea.style.display = 'block';
    previewImg.src = '';
    currentImageUrl = null;
}

deleteActionBtn.addEventListener('click', () => {
    resetToUploadState();
});

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
`;
document.head.appendChild(style);