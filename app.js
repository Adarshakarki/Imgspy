const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const searchActions = document.getElementById('searchActions');
const googleActionBtn = document.getElementById('googleActionBtn');
const yandexActionBtn = document.getElementById('yandexActionBtn');
const deleteActionBtn = document.getElementById('deleteActionBtn');
const sidebarImageContainer = document.querySelector('.preview-image-container');

let currentImageUrl = null;
let uploadedFileName = null;

themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('dark');
    themeIcon.src = isLight ? 'icons/sun.svg' : 'icons/moon.svg';
    themeIcon.alt = isLight ? 'Light mode' : 'Dark mode';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light');
    themeIcon.src = 'icons/sun.svg';
    themeIcon.alt = 'Light mode';
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
    setTimeout(() => error.classList.remove('active'), 5000);
}

async function uploadImage(file) {
    loading.classList.add('active');
    
    try {
        const formData = new FormData();
        formData.append('reqtype', 'fileupload');
        formData.append('time', '1h');
        formData.append('filenamelen', '16');
        formData.append('fileToUpload', file);

        const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const url = await response.text();
        if (!url.startsWith('https://')) {
            throw new Error('Invalid URL received');
        }
        currentImageUrl = url;
        uploadedFileName = file.name;
        showUploadedImage(file);
        uploadArea.style.display = 'none';
        searchActions.style.display = 'flex';
        
        googleActionBtn.href = `https://www.google.com/searchbyimage?image_url=${encodeURIComponent(url)}`;
        yandexActionBtn.href = `https://yandex.com/images/search?url=${encodeURIComponent(url)}&rpt=imageview`;

    } catch (err) {
        console.error('Upload error:', err);
        showError(`Failed to upload "${file.name}". Please try again.`);
    } finally {
        loading.classList.remove('active');
    }
}

function showUploadedImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        sidebarImageContainer.innerHTML = `<img src="${e.target.result}" alt="Uploaded image" class="sidebar-image" />`;
    };
    reader.readAsDataURL(file);
}

function resetToUploadState() {
    sidebarImageContainer.innerHTML = `<img src="placeholder.jpg" alt="ImgSpy Illustration" class="sidebar-image" />`;
    searchActions.style.display = 'none';
    uploadArea.style.display = 'block';
    currentImageUrl = null;
    uploadedFileName = null;
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