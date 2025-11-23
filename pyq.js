// IndexedDB Wrapper for Robust Storage
class DB {
    constructor() {
        this.dbName = 'VITPYQ_DB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("Database error: " + event.target.errorCode);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("Database connected successfully");
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create Users Store
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'email' });
                    userStore.createIndex('email', 'email', { unique: true });
                }

                // Create Papers Store
                if (!db.objectStoreNames.contains('papers')) {
                    const paperStore = db.createObjectStore('papers', { keyPath: 'id' });
                    paperStore.createIndex('subject', 'subject', { unique: false });
                    paperStore.createIndex('courseCode', 'courseCode', { unique: false });
                }
            };
        });
    }

    async addUser(user) {
        return this.performTransaction('users', 'readwrite', (store) => store.put(user));
    }

    async getUser(email) {
        return this.performTransaction('users', 'readonly', (store) => store.get(email));
    }

    async addPaper(paper) {
        return this.performTransaction('papers', 'readwrite', (store) => store.add(paper));
    }

    async getAllPapers() {
        return this.performTransaction('papers', 'readonly', (store) => store.getAll());
    }

    async updatePaper(paper) {
        return this.performTransaction('papers', 'readwrite', (store) => store.put(paper));
    }

    performTransaction(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            const request = operation(store);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Initialize DB
const db = new DB();
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let papers = [];

// Sounds
const sounds = {
    click: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'),
    success: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'),
    alert: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
};

function playSound(type) {
    console.log(`Playing sound: ${type}`);
}

// DOM Elements
const navLinks = document.getElementById('navLinks');
const authSection = document.getElementById('authSection');
const homeSection = document.getElementById('homeSection');
const uploadSection = document.getElementById('uploadSection');
const profileSection = document.getElementById('profileSection');
const papersGrid = document.getElementById('papersGrid');

// Init
document.addEventListener('DOMContentLoaded', async () => {
    await db.init();
    await loadPapers();
    updateNav();
    showPage('home');
    initBubbleAnimation();
});

async function loadPapers() {
    papers = await db.getAllPapers();
    // Sort by newest first
    papers.sort((a, b) => b.id - a.id);
    renderPapers(papers);
}

// Navigation Logic
function updateNav() {
    if (currentUser) {
        navLinks.innerHTML = `
            <a class="nav-link" onclick="showPage('home'); closeMobileMenu()">Home</a>
            <a class="nav-link" onclick="showPage('upload'); closeMobileMenu()">Upload</a>
            <a class="nav-link" onclick="showPage('profile'); closeMobileMenu()">Profile</a>
            <button class="btn btn-outline" onclick="logout(); closeMobileMenu()">Logout</button>
        `;
    } else {
        navLinks.innerHTML = `
            <a class="nav-link" onclick="showPage('home'); closeMobileMenu()">Home</a>
            <a class="nav-link" onclick="checkLoginForUpload(); closeMobileMenu()">Upload</a>
            <button class="btn btn-primary" onclick="showPage('auth'); closeMobileMenu()">Login</button>
        `;
    }
}

function toggleMobileMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

function closeMobileMenu() {
    document.getElementById('navLinks').classList.remove('active');
}

function showPage(pageId) {
    playSound('click');
    [authSection, homeSection, uploadSection, profileSection].forEach(el => el.classList.add('hidden'));

    if (pageId === 'auth') authSection.classList.remove('hidden');
    else if (pageId === 'home') homeSection.classList.remove('hidden');
    else if (pageId === 'upload') {
        if (!currentUser) {
            playSound('alert');
            alert('You must be logged in to upload papers and earn points!');
            return showPage('auth');
        }
        uploadSection.classList.remove('hidden');
    }
    else if (pageId === 'profile') {
        if (!currentUser) return showPage('auth');
        updateProfileUI();
        profileSection.classList.remove('hidden');
    }
}

function checkLoginForUpload() {
    if (!currentUser) {
        playSound('alert');
        alert('You must be logged in to upload papers and earn points!');
        showPage('auth');
    } else {
        showPage('upload');
    }
}

// Auth Logic
let isLoginMode = true;
function toggleAuthMode() {
    playSound('click');
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').innerText = isLoginMode ? 'Welcome Back' : 'Create Account';
    document.getElementById('authBtnText').innerText = isLoginMode ? 'Login' : 'Sign Up';
    document.getElementById('authSwitchText').innerText = isLoginMode ? "Don't have an account?" : "Already have an account?";
    document.getElementById('authSwitchLink').innerText = isLoginMode ? 'Sign Up' : 'Login';
    document.getElementById('signupFields').classList.toggle('hidden');
}

function continueAsGuest() {
    playSound('click');
    currentUser = null;
    updateNav();
    showPage('home');
}

document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    playSound('click');
    const email = document.getElementById('email').value;

    if (isLoginMode) {
        const user = await db.getUser(email);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateNav();
            showPage('home');
            playSound('success');
        } else {
            playSound('alert');
            alert('User not found. Please sign up.');
        }
    } else {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const newUser = {
            firstName, lastName, email,
            points: 0,
            level: 'Silver',
            profilePic: '',
            likedPapers: [],
            uploads: 0,
            downloads: 0
        };
        await db.addUser(newUser);
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        updateNav();
        showPage('home');
        playSound('success');
    }
});

function logout() {
    playSound('click');
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateNav();
    showPage('auth');
}

// Papers Logic
function renderPapers(papersToRender) {
    if (papersToRender.length === 0) {
        papersGrid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No papers found. Be the first to upload!</p>';
        return;
    }

    papersGrid.innerHTML = papersToRender.map(paper => {
        const isLiked = currentUser && currentUser.likedPapers && currentUser.likedPapers.includes(paper.id);
        return `
        <div class="card paper-card">
            <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${paper.id}, event)">
                ${isLiked ? '❤️' : '🤍'}
            </button>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; margin-top:2.5rem;">
                <span class="badge">${paper.category}</span>
                <span class="text-muted" style="font-size:0.85rem;">${paper.examYear}</span>
            </div>
            <h3>${paper.subject}</h3>
            <p class="text-muted">${paper.courseCode} • Slot: ${paper.slot}</p>
            <div style="margin-top:1rem; display:flex; align-items:center; gap:0.5rem;">
                <div style="width:24px; height:24px; background:#334155; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; overflow:hidden;">
                    ${paper.uploaderPic ? `<img src="${paper.uploaderPic}" style="width:100%;height:100%;object-fit:cover;">` : paper.uploader[0]}
                </div>
                <span class="text-muted" style="font-size:0.9rem;">${paper.uploader}</span>
            </div>
            <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                <button class="btn btn-outline" style="flex:1;" onclick="viewPaper(${paper.id})">View Paper</button>
                <button class="btn btn-primary" style="flex:1;" onclick="downloadPaper(${paper.id})">⬇️ Download</button>
            </div>
        </div>
    `}).join('');
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = papers.filter(p =>
        p.subject.toLowerCase().includes(query) ||
        p.courseCode.toLowerCase().includes(query) ||
        p.slot.toLowerCase().includes(query)
    );
    renderPapers(filtered);
}

// Like Logic
async function toggleLike(paperId, event) {
    if (event) event.stopPropagation();
    if (!currentUser) {
        playSound('alert');
        alert('Login to like papers!');
        return;
    }

    playSound('click');
    if (!currentUser.likedPapers) currentUser.likedPapers = [];

    const index = currentUser.likedPapers.indexOf(paperId);
    if (index === -1) {
        currentUser.likedPapers.push(paperId);
    } else {
        currentUser.likedPapers.splice(index, 1);
    }

    await db.addUser(currentUser); // Update user in DB
    localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Update local session
    renderPapers(papers);
    updateProfileUI();
}

// View & Download Logic
let currentViewingPaperId = null;

async function viewPaper(id) {
    playSound('click');
    const paper = papers.find(p => p.id === id);
    if (!paper) return;

    currentViewingPaperId = id;

    if (paper.fileType === 'image') {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        const likeBtn = document.getElementById('modalLikeBtn');

        modalImg.src = paper.src || 'https://via.placeholder.com/600x800.png?text=Paper+Preview';

        const isLiked = currentUser && currentUser.likedPapers && currentUser.likedPapers.includes(id);
        likeBtn.innerHTML = isLiked ? '❤️ Liked' : '🤍 Like';

        modal.classList.remove('hidden');
    } else if (paper.fileType === 'pdf') {
        if (paper.src && paper.src !== '#') {
            try {
                // Convert Base64 Data URL to Blob for reliable viewing
                const response = await fetch(paper.src);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                // Open Blob URL in new tab
                window.open(blobUrl, '_blank');

                // Clean up blob URL after a delay to allow loading
                setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
            } catch (e) {
                console.error("Error opening PDF:", e);
                alert('Error opening PDF. Please try downloading it instead.');
            }
        } else {
            alert('PDF file not available.');
        }
    } else {
        alert('File preview not available.');
    }
}

function closeModal(e) {
    if (e.target.id === 'imageModal' || e.target.classList.contains('close-modal')) {
        document.getElementById('imageModal').classList.add('hidden');
        currentViewingPaperId = null;
    }
}

function toggleLikeFromModal() {
    if (currentViewingPaperId) {
        toggleLike(currentViewingPaperId);
        const isLiked = currentUser && currentUser.likedPapers && currentUser.likedPapers.includes(currentViewingPaperId);
        document.getElementById('modalLikeBtn').innerHTML = isLiked ? '❤️ Liked' : '🤍 Like';
    }
}

async function downloadPaper(id) {
    playSound('success');
    if (currentUser) {
        if (!currentUser.downloads) currentUser.downloads = 0;
        currentUser.downloads++;
        await db.addUser(currentUser);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    const paper = papers.find(p => p.id === id);
    if (paper && paper.src && paper.src !== '#') {
        const link = document.createElement('a');
        link.href = paper.src;
        link.download = `${paper.subject}_${paper.courseCode}_${paper.category}.${paper.fileType === 'image' ? 'png' : 'pdf'}`;
        link.click();
        alert('Download started!');
    } else {
        alert('File not available for download.');
    }
}

function downloadFromModal() {
    if (currentViewingPaperId) downloadPaper(currentViewingPaperId);
}

// Upload Logic
let selectedFile = null;
let selectedFileBase64 = null;

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;

        const reader = new FileReader();
        reader.onload = function (e) {
            selectedFileBase64 = e.target.result;

            if (file.type.startsWith('image/')) {
                document.getElementById('imagePreview').src = e.target.result;
                document.getElementById('imagePreviewContainer').classList.remove('hidden');
            } else {
                document.getElementById('imagePreviewContainer').classList.add('hidden');
            }
        };
        reader.readAsDataURL(file);
    }
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        playSound('alert');
        alert('You must be logged in to upload!');
        showPage('auth');
        return;
    }

    if (!selectedFileBase64) {
        alert('Please select a file first!');
        return;
    }

    playSound('success');
    const newPaper = {
        id: Date.now(),
        subject: document.getElementById('upSubject').value,
        courseCode: document.getElementById('upCourse').value,
        examYear: document.getElementById('upYear').value,
        slot: document.getElementById('upSlot').value,
        category: document.getElementById('upCategory').value,
        uploader: currentUser.firstName + ' ' + currentUser.lastName,
        uploaderPic: currentUser.profilePic,
        fileType: selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'pdf') : 'unknown',
        src: selectedFileBase64
    };

    try {
        await db.addPaper(newPaper);
        papers.unshift(newPaper); // Update local array

        // Add Points
        currentUser.points += 50;
        if (!currentUser.uploads) currentUser.uploads = 0;
        currentUser.uploads++;
        updateLevel();

        await db.addUser(currentUser);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        alert('Paper Uploaded! You earned 50 points.');

        // Reset Form
        document.getElementById('uploadForm').reset();
        document.getElementById('imagePreviewContainer').classList.add('hidden');
        selectedFile = null;
        selectedFileBase64 = null;

        showPage('home');
        renderPapers(papers);
    } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to save paper. File might be too large.");
    }
});

// Profile Logic
function updateProfileUI() {
    if (!currentUser) return;

    document.getElementById('profileName').innerText = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('profileEmail').innerText = currentUser.email;
    document.getElementById('profilePoints').innerText = currentUser.points;

    const levelIcons = { 'Silver': '🥈', 'Gold': '🥇', 'Diamond': '💎', 'Legendary': '🦅' };
    document.getElementById('profileLevel').innerHTML = `${levelIcons[currentUser.level] || ''} ${currentUser.level}`;

    document.getElementById('profileUploads').innerText = currentUser.uploads || 0;
    document.getElementById('profileDownloads').innerText = currentUser.downloads || 0;

    const avatarEl = document.getElementById('profileAvatar');
    if (currentUser.profilePic) {
        avatarEl.innerHTML = `<img src="${currentUser.profilePic}" alt="Profile">`;
    } else {
        avatarEl.innerText = currentUser.firstName ? currentUser.firstName[0] : 'U';
    }

    const levelEl = document.getElementById('profileLevel');
    if (currentUser.level === 'Legendary') levelEl.style.color = '#a855f7';
    else if (currentUser.level === 'Diamond') levelEl.style.color = '#0ea5e9';
    else if (currentUser.level === 'Gold') levelEl.style.color = '#eab308';
    else levelEl.style.color = '#94a3b8';

    const likedGrid = document.getElementById('likedPapersGrid');
    if (currentUser.likedPapers && currentUser.likedPapers.length > 0) {
        const likedPapersList = papers.filter(p => currentUser.likedPapers.includes(p.id));
        if (likedPapersList.length > 0) {
            likedGrid.innerHTML = likedPapersList.map(paper => `
                <div class="card" style="padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>${paper.subject}</h4>
                        <p class="text-muted" style="font-size: 0.8rem;">${paper.courseCode}</p>
                    </div>
                    <button class="btn btn-sm btn-outline" onclick="viewPaper(${paper.id})">View</button>
                </div>
            `).join('');
        } else {
            likedGrid.innerHTML = '<p class="text-muted text-center">No liked papers found.</p>';
        }
    } else {
        likedGrid.innerHTML = '<p class="text-muted text-center">No liked papers yet.</p>';
    }
}

function handleProfilePicUpdate(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function (e) {
            currentUser.profilePic = e.target.result;
            await db.addUser(currentUser);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateProfileUI();
            playSound('success');
        };
        reader.readAsDataURL(file);
    }
}

function enableNameEdit() {
    document.getElementById('profileName').classList.add('hidden');
    document.querySelector('.profile-info-edit .btn-icon').classList.add('hidden');
    document.getElementById('nameEditForm').classList.remove('hidden');
    document.getElementById('editFirstName').value = currentUser.firstName;
    document.getElementById('editLastName').value = currentUser.lastName;
}

function cancelNameEdit() {
    document.getElementById('profileName').classList.remove('hidden');
    document.querySelector('.profile-info-edit .btn-icon').classList.remove('hidden');
    document.getElementById('nameEditForm').classList.add('hidden');
}

async function saveNameEdit() {
    const newFirst = document.getElementById('editFirstName').value;
    const newLast = document.getElementById('editLastName').value;
    if (newFirst && newLast) {
        currentUser.firstName = newFirst;
        currentUser.lastName = newLast;
        await db.addUser(currentUser);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileUI();
        cancelNameEdit();
        playSound('success');
    }
}

function updateLevel() {
    if (currentUser.points >= 4000) currentUser.level = 'Legendary';
    else if (currentUser.points >= 3000) currentUser.level = 'Diamond';
    else if (currentUser.points >= 2000) currentUser.level = 'Gold';
    else if (currentUser.points >= 1000) currentUser.level = 'Silver';
}

// Interactive Bubble Animation
function initBubbleAnimation() {
    const canvas = document.getElementById('bubbleCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let bubbles = [];
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    class Bubble {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 60 + 20;
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
            this.opacity = Math.random() * 0.3 + 0.1;
            this.color = `rgba(${99 + Math.random() * 50}, ${102 + Math.random() * 50}, ${241}, ${this.opacity})`;
        }

        update() {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 200) {
                this.x += dx * 0.02;
                this.y += dy * 0.02;
            }

            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

            this.opacity -= 0.001;
            if (this.opacity <= 0) {
                this.opacity = Math.random() * 0.3 + 0.1;
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
            }
        }

        draw() {
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, `rgba(99, 102, 241, ${this.opacity})`);
            gradient.addColorStop(0.5, `rgba(236, 72, 153, ${this.opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 15; i++) {
        bubbles.push(new Bubble(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        if (Math.random() < 0.05 && bubbles.length < 25) {
            bubbles.push(new Bubble(e.clientX, e.clientY));
        }
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bubbles.forEach(bubble => {
            bubble.update();
            bubble.draw();
        });
        if (bubbles.length > 25) {
            bubbles = bubbles.slice(0, 25);
        }
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
