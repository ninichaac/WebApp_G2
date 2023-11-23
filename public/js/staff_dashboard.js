fetch('/user')
  .then(response => response.json())
  .then(data => {
    document.getElementById('username').innerText = data.username;
    document.getElementById('email').innerText = data.email;
  })
  .catch(error => console.error('Error:', error));



const roomcount = document.querySelector('#boxesroom')

async function getRoomcount() {
  const response = await fetch('/Staff/dashboard-list');
  try {
    if (response.ok) {
      const data = await response.json();
      let availableRoomCount = 0;
      let disabledRoomCount = 0;
      let reservedRoomCount = 0;
      data.forEach(function (room) {
        if (room.room_status == 'Available') {
          availableRoomCount++
        } else if (room.room_status == 'Disabled') {
          disabledRoomCount++
        } else if (room.room_status == 'Reserved') {
          reservedRoomCount++
        }
      });
      roomcount.innerHTML = `<div class="box box1">
      <i class="uil uil-check-circle"></i>
      <span class="text">Available Room</span>
      <span class="number">${availableRoomCount} (Rooms)</span></div>
      <div class="box box2">
      <i class="uil uil-presentation-check"></i>
      <span class="text">Reserved Room</span>
      <span class="number">${reservedRoomCount} (Rooms)</span></div>
      <div class="box box3">
      <i class="uil uil-ban"></i>
      <span class="text">Disabled Room</span>
      <span class="number">${disabledRoomCount} (Rooms)</span></div>`;

    } else {
      console.error('Response not OK');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

getRoomcount()

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