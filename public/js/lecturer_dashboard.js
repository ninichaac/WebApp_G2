fetch('/user')
    .then(response => response.json())
    .then(data => {
        document.getElementById('username').innerText = data.username;
        document.getElementById('email').innerText = data.email;
    })
    .catch(error => console.error('Error:', error));



const roomcount = document.querySelector('#boxesroom')

async function getRoomcount() {
    const roomResponse = await fetch('/Lecturer/dashboard-list/room');
    const reservingResponse = await fetch('/Lecturer/dashboard-list/reserving');
  
    try {
      if (roomResponse.ok && reservingResponse.ok) {
        const roomData = await roomResponse.json();
        const reservingData = await reservingResponse.json();
  
        let availableRoomCount = 0;
        let disabledRoomCount = 0;
        let reservedRoomCount = 0;
  
        // Counting available and disabled rooms from the room table
        roomData.forEach(function (room) {
          if (room.room_status == 'Available') {
            availableRoomCount++;
          } else if (room.room_status == 'Disabled') {
            disabledRoomCount++;
          }
        });
  
        reservingData.forEach(function (reservation) {
          if (reservation.time_reserving) {
            reservedRoomCount++;
          }
        });
  
        // Updating the roomcount.innerHTML with the counts
        roomcount.innerHTML = `<button class="btn btn-success border-0 box box1" data-bs-toggle="modal" data-bs-target="#availableRoomModal">
          <i class="uil uil-check-circle"></i>
          <span class="text">Available Room</span>
          <span class="number">${availableRoomCount} (Rooms)</span></button>
          <button class="btn btn-success border-0 box box2" data-bs-toggle="modal" data-bs-toggle="modal" data-bs-target="#reservedRoomModal">
          <i class="uil uil-presentation-check"></i>
          <span class="text">Reserved Slots</span>
          <span class="number">${reservedRoomCount} (Slots)</span></button>
          <button class="btn btn-success border-0 box box3" data-bs-toggle="modal" data-bs-toggle="modal" data-bs-target="#disabledRoomModal">
          <i class="uil uil-ban"></i>
          <span class="text">Disabled Room</span>
          <span class="number">${disabledRoomCount} (Rooms)</span></button>`;
  
      } else {
        console.error('Response not OK');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  getRoomcount()
  
  
  // ====modal=====
  const availableRoomlist = document.querySelector('#availableRoomlist')
  async function getavailableRoomlist() {
    try {
      const response = await fetch('/Lecturer/dashboard-list/room');
      if (response.ok) {
        const data = await response.json();
        let rows = '';
        data.forEach(function (room) {
          if (room.room_status == 'Available') {
            rows += `<ul>${room.room_name}</ul>`;
          }
        });
        availableRoomlist.innerHTML = rows
  
      } else if (response.status == 500) {
        const data = await response.text();
        throw Error(data);
      }
    } catch (error) {
      console.error(err.message);
    }
  }
  getavailableRoomlist()
  
  
  const disabledRoomlist = document.querySelector('#disabledRoomlist')
  async function getdisabledRoomlist() {
    try {
      const response = await fetch('/Lecturer/dashboard-list/room');
      if (response.ok) {
        const data = await response.json();
        let rows = '';
        data.forEach(function (room) {
          if (room.room_status == 'Disabled') {
            rows += `<ul>${room.room_name}</ul>`;
          }
        });
        disabledRoomlist.innerHTML = rows
  
      } else if (response.status == 500) {
        const data = await response.text();
        throw Error(data);
      }
    } catch (error) {
      console.error(err.message);
    }
  }
  getdisabledRoomlist()
  
  
  const reservedRoomlist = document.querySelector('#reservedRoomlist')
  async function getreservedRoomlist() {
    try {
      const response = await fetch('/Lecturer/dashboard-list/reserving');
      if (response.ok) {
        const data = await response.json();
        let rows = '';
        data.forEach(function (room) {
          if (room.approved == 'Approve') {
            rows += `<ul><b>Room:</b> ${room.room_name} <b class="ms-3">Time:</b> ${room.time_reserving}</ul>`;
          }
        });
        reservedRoomlist.innerHTML = rows
  
      } else if (response.status == 500) {
        const data = await response.text();
        throw Error(data);
      }
    } catch (error) {
      console.error(err.message);
    }
  }
  getreservedRoomlist()




  
const body = document.querySelector("body"),
    sidebar = body.querySelector("nav");
sidebarToggle = body.querySelector(".sidebar-toggle");

let getStatus = localStorage.getItem("status");
if (getStatus && getStatus === "close") {
    sidebar.classList.toggle("close");
}

sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    if (sidebar.classList.contains("close")) {
        localStorage.setItem("status", "close");
    } else {
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
const itemsPerPage = 10; // จำนวนตารางที่แสดงในหนึ่งหน้า

// เรียกใช้ API
async function history() { 
    try {
        const response = await fetch('/Lecturer/activity'); 
        if (response.ok) {
            const json = await response.json();
            // data = json;
            data = json.sort((a, b) => new Date(b.date_reserving) - new Date(a.date_reserving));
            renderTable();
        } else {
            throw Error('Connection error');
        }
    } catch (err) {
        console.error(err);
    }
}

//loop สร้างตารางจากDB
function createTable(startIndex, endIndex) {
    let rows = '';
    // Filter and display only approved entries
    const approvedEntries = data.filter(entry => entry.approved);
    // Display the latest 10 approved entries
    const latestApprovedEntries = approvedEntries.slice(0, 10);
    latestApprovedEntries.forEach(h => {
        rows += `<tr><td>${h.username}</td>`;
        rows += `<td>${h.room_name}</td>`;
        rows += `<td>${h.date_reserving}</td>`;
        rows += `<td>${h.time_reserving}</td>`;
        rows += `<td>${h.approved}</td>`;
        rows += `<td>${h.approver}</td></tr>`;
    });
    tbHistory.innerHTML = rows;
}


function renderTable() { //เรียกใช้ฟังชั่นสร้างตารางและฟังชั่นปุ่มเปลี่ยนหน้า
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    createTable(startIndex, endIndex);
}