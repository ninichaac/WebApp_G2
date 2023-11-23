fetch('/user')
  .then(response => response.json())
  .then(data => {
    document.getElementById('username').innerText = data.username;
    document.getElementById('email').innerText = data.email;
  })
  .catch(error => console.error('Error:', error));

const roomForm = document.querySelector('#roomForm');
roomForm.onsubmit = async function (e) {
  e.preventDefault();
  const data = {
    "roomImg": roomForm['roomImg'].value,
    "roomNum": roomForm['roomNum'].value,
    "roomLoca": roomForm['roomLoca'].value,
    "people": roomForm['people'].value,
  }
  try {
    const options = {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    const response = await fetch('/Staff/update-room', options);
    if (response.ok) {
      const data = await response.text();
      roomForm.reset();
      Swal.fire({
        icon: "success",
        title: "Add Room successful",
      }).then(() => {
        window.location.replace(data);
      });
    }
    else if (response.status == 401) {
      const data = await response.text();
      throw Error(data);
    }
    else {
      throw Error('Connection error');
    }
  } catch (err) {
    console.error(err.message);
    console.error(err.message);
  }
}

const body = document.querySelector("body"),
  sidebar = body.querySelector("nav"),
  sidebarToggle = body.querySelector(".sidebar-toggle"); // เพิ่ม const นี้


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
});

const availableRooms = document.querySelector('#availableRooms');
const disabledRooms = document.querySelector('#disabledRooms');

function createDonutChart(availableRoomCount, disabledRoomCount) {
  var donutChartCanvas = document.getElementById('donutChart').getContext('2d');

  var donutChart = new Chart(donutChartCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Available Rooms', 'Disabled Rooms'],
      datasets: [{
        data: [availableRoomCount, disabledRoomCount],
        backgroundColor: ['#8FD88F', '#8e2424'],
      }],
    },
  });
}

async function getroom() {
  try {
    const response = await fetch('/Staff/roomslist');
    if (response.ok) {
      const data = await response.json();
      let rows = '';
      let rows1 = '';
      let availableRoomCount = 0;
      let disabledRoomCount = 0;
      data.forEach(function (room) {
        if (room.room_status == 'Available') {
          rows += `<div id="availableRooms" style="padding-left: 35px;" class="data-container">`;
          rows += `<input type="checkbox" name="available" id="available" value="${room.room_id}"> ${room.room_name}</div>`;
          availableRoomCount++;
        } else if (room.room_status == 'Disabled') {
          rows1 += `<div id="disabledRooms" style="padding-left: 35px;" class="data-container">`;
          rows1 += `<input type="checkbox" name="disable" id="disable" value="${room.room_id}"> ${room.room_name}</div>`;
          disabledRoomCount++;
        }
      });
      availableRooms.innerHTML = rows
      disabledRooms.innerHTML = rows1
      createDonutChart(availableRoomCount, disabledRoomCount);

    } else if (response.status == 500) {
      const data = await response.text();
      throw Error(data);
    }
  } catch (error) {
    console.error(err.message);
  }
}

getroom()


document.getElementById('Disable').addEventListener('click', async () => {
  const checkedRooms = document.querySelectorAll('input[name="available"]:checked');
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to Disabled this room?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Disabled"
  }).then(async (result) => {
    if (result.isConfirmed) {
      await updateRoomStatus(checkedRooms, 'Disabled');
      Swal.fire({
        title: "Disabled!",
        text: "Your room has been disabled.",
        icon: "success"
      });
    }
  });
});

document.getElementById('Available').addEventListener('click', async () => {
  const checkedRooms = document.querySelectorAll('input[name="disable"]:checked');
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to Available this room?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Aailable"
  }).then(async (result) => {
    if (result.isConfirmed) {
      await updateRoomStatus(checkedRooms, 'Available');
      Swal.fire({
        title: "Available!",
        text: "Your room has been available.",
        icon: "success"
      });
    }
  });
});


async function updateRoomStatus(checkedRooms, status) {
  const rooms = Array.from(checkedRooms).map(room => room.value);

  try {
    const response = await fetch('/Staff/update-room/update-room-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rooms, status })
    });

    if (response.ok) {
      console.log(`Rooms updated to ${status} successfully`);
      getroom()
      location.reload();
    } else {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error updating room status:', error.message);
  }
}



// ADD new room
const showAddRoomButton = document.getElementById('showAddRoom');
const addRoomBox = document.getElementById('addRoomBox');

showAddRoomButton.addEventListener('click', () => {
  addRoomBox.style.display = 'block';
});

const addRoomButton = document.getElementById('addRoomButton');
const cancelButton = document.getElementById('cancelButton');

addRoomButton.addEventListener('click', () => {
  // Get the values from the form and perform your room addition logic here
  const roomImg = document.getElementById('roomImg').value;
  const roomNum = document.getElementById('roomNum').value;
  const roomLoca = document.getElementById('roomLoca').value;
  const people = document.getElementById('people').value;
  // const roomStatus = document.getElementById('roomStatus').value;

  // Add your code to add the room using the collected data

  // After adding the room, hide the box
  addRoomBox.style.display = 'none';
});

cancelButton.addEventListener('click', () => {
  // If the user clicks "Cancel," simply hide the box
  addRoomBox.style.display = 'none';
});
// ADD new room

function createDetails(data, container) {
  var details = document.createElement("div");
  details.classList.add("data-details");

  // Create and append detailsContent with additional data
  var detailsContent = document.createTextNode("Capacity: " + data.capacity + ", Status: " + data.status);

  details.appendChild(detailsContent);
  container.appendChild(details);
}

// function createCheckboxes(data, containerId) {
//   var container = document.getElementById(containerId);
//   data.forEach(function (item) {
//     var label = document.createElement("label");
//     var checkbox = document.createElement("input");
//     checkbox.type = "checkbox";
//     checkbox.classList.add("checkbox"); // You can add additional styling here
//     var text = document.createTextNode(item.name);

//     checkbox.style.marginRight = "20px";

//     label.appendChild(checkbox);
//     label.appendChild(text);
//     container.appendChild(label);
//     container.appendChild(document.createElement("br"));
//   });
// }
// createCheckboxes(data.filter(room => room.room_status === 'Available'), "availableRooms");
//       createCheckboxes(data.filter(room => room.room_status === 'Disabled'), "disabledRooms");


//MouseOver
var labels = document.querySelectorAll(".my-custom-data-list");

labels.forEach(function (label, index) {
  label.addEventListener("mouseover", function () {
    var details = this.nextElementSibling;
    details.style.display = "block";
  });

  label.addEventListener("mouseout", function () {
    var details = this.nextElementSibling;
    details.style.display = "none";
  });
});

function openNav() {
  document.getElementById("sidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("sidenav").style.width = "0";
}

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
