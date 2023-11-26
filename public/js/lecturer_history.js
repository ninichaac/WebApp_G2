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


const tbHistory = document.querySelector('#bodyHistorycontent'); //สร้าง tbHistory เก็บไว้เพื่อส่งคืนข้อมูลตารางใหม่
history();

let data = []; // Your array of data
let currentPage = 1; 
const itemsPerPage = 20; // จำนวนตารางที่แสดงในหนึ่งหน้า
const paginationContainer = document.getElementById('pagination-container'); //สร้าง paginationContainer เก็บไว้เพื่อส่งคืนข้อมูลปุ่มเปลี่ยนหน้า

// เรียกใช้ API
async function history() { 
    try {
        const response = await fetch('/Lecturer/getHistory'); 
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

//loop สร้างตารางจากDB
function createTable(startIndex, endIndex) {
    let rows = '';
    for (let i = startIndex; i < endIndex; i++) { 
        if (!data[i]) break; // Stop if there are no more items
        const h = data[i];
       if(h.approved == 'Approve'){ //loop เพื่อไล่เช็คแต่ละตารางว่าได้ Approve หรือไม่ถ้าใช่ก็จะสร้างตารางไว้ใน tbHistory
        rows += `<tr><td>${h.username}</td>`;
        rows += `<td>${h.room_name}</td>`;
        rows += `<td>${h.date_reserving}</td>`;
        rows += `<td>${h.time_reserving}</td>`;
        rows += `<td>${h.approved}</td>`;
        rows += `<td>${h.approver}</td></tr>`;
       }
    }
    tbHistory.innerHTML = rows;
}

function handlePagination() { //สร้างปุ่มเปลี่ยนน้าเมื่อมีตาราง เกิน 20 
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

function renderTable() { //เรียกใช้ฟังชั่นสร้างตารางและฟังชั่นปุ่มเปลี่ยนหน้า
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    createTable(startIndex, endIndex);
    handlePagination();
}