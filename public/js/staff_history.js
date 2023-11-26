fetch('/user')
  .then(response => response.json())
  .then(data => {
    document.getElementById('username').innerText = data.username;
    document.getElementById('email').innerText = data.email;
  })
  .catch(error => console.error('Error:', error));

const body = document.querySelector("body"),
      sidebar = body.querySelector("nav");
      sidebarToggle = body.querySelector(".sidebar-toggle");

let getStatus = localStorage.getItem("status");
if(getStatus && getStatus ==="close"){
    sidebar.classList.toggle("close");
}

sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    if(sidebar.classList.contains("close")){
        localStorage.setItem("status", "close");
    }else{
        localStorage.setItem("status", "open");
    }
})

// =======date======
const currentDateElement = document.getElementById('current-date');
const currentDate = new Date();

// กำหนดรูปแบบของวันที่
const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
};

// แปลงและแสดงวันที่ปัจจุบันใน element
currentDateElement.textContent = currentDate.toLocaleDateString('en-US', options);

const tbHistory = document.querySelector('#bodyHistorycontent');
history();

let data = []; // Your array of data
let currentPage = 1;
const itemsPerPage = 20; // Set the number of items per page
const paginationContainer = document.getElementById('pagination-container');

async function history() {
    try {
        const response = await fetch('/Staff/getHistory');
        if (response.ok) {
            const json = await response.json();
            data = json.sort((a, b) => new Date(b.date_reserving) - new Date(a.date_reserving));
            renderTable();
        } else {
            throw Error('Connection error');
        }
    } catch (err) {
        console.error(err);
        // alert(err.message);
    }
}

function createTable(startIndex, endIndex) {
    let rows = '';
    for (let i = startIndex; i < endIndex; i++) {
        if (!data[i]) break; // Stop if there are no more items
        const h = data[i];
        rows += `<tr><td>${h.username}</td>`;
        rows += `<td>${h.room_name}</td>`;
        rows += `<td>${h.date_reserving}</td>`;
        rows += `<td>${h.time_reserving}</td>`;
        rows += `<td>${h.approved}</td>`;
        rows += `<td>${h.approver}</td></tr>`;
    }
    tbHistory.innerHTML = rows;
}

function handlePagination() {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.setAttribute('class', 'btn btn-success m-2');
        button.addEventListener('click', function () {
            currentPage = parseInt(this.textContent);
            renderTable();
        });
        paginationContainer.appendChild(button);
    }
}

function renderTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    createTable(startIndex, endIndex);
    handlePagination();
}