// app.js

// ---------- Modal helpers ----------
function showModal(message) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    modalContent.textContent = message;
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// ---------- Dark mode toggle ----------
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// ---------- Upload file ----------
function handleUpload(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            showModal('Upload successful!');
            setTimeout(() => {
                window.location.href = '/documents.html';
            }, 2000);
        } else {
            throw new Error('Upload failed.');
        }
    })
    .catch(error => {
        showModal('Upload failed. Please try again.');
        console.error('Error:', error);
    });
}

// ---------- Register user ----------
function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    fetch('/register', {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(response => {
        if (response.ok) {
            showModal('Registration successful!');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            return response.text().then(text => { throw new Error(text) });
        }
    })
    .catch(error => {
        showModal('Registration failed: ' + error.message);
    });
}

// ---------- Login user ----------
function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    fetch('/login', {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(response => {
        if (response.ok) {
            showModal('Login successful!');
            setTimeout(() => {
                window.location.href = '/documents.html';
            }, 2000);
        } else {
            return response.text().then(text => { throw new Error(text) });
        }
    })
    .catch(error => {
        showModal('Login failed: ' + error.message);
    });
}

// ---------- Chat (socket.io) ----------
const socket = io();

      const form = document.getElementById('form');
      const input = document.getElementById('input');
      const messages = document.getElementById('messages');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value) {
          socket.emit('chat message', input.value);
          input.value = '';
        }
      });

      socket.on('chat message', (msg) => {
        const item = document.createElement('li');
        item.innerText = msg;
        messages.appendChild(item);
        //added to show LLM response
        window.scrollTo(0, document.body.scrollHeight);
      });

async function loadFileList() {
    try {
    const fileList = await fetch('/api/files');

    if (!fileList.ok) {
      throw new Error(`HTTP error! status: ${fileList.status}`);
    }

    const files = await fileList.json();
    console.log(files);

    files.forEach(file => {
      const li = document.createElement('li');
      li.textContent = file.filename;
      document.getElementById('listFiles').appendChild(li);
      console.log(file.filename);
    });
  } catch (error) {
    console.error('error loading file ', error)
  }
}
loadFileList();
