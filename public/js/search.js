fetch('/user')
    .then(response => response.json())
    .then(data => {
        document.getElementById('username').innerText = data.username;
        document.getElementById('email').innerText = data.email;
    })
    .catch(error => console.error('Error:', error));


const timeSet = new Set(["8-10 A.M.", "10-12 P.M.", "12-15 P.M.", "15-17 P.M."]);
const roomlist = document.querySelector('#roomlist');
async function getroomlist() {
    try {
        const response = await fetch('/Student/rooms-list');
        if (response.ok) {
            const data = await response.json();
            let rows = '';

            for (const room of data) {
                if (room.room_status !== 'Disabled') {
                    rows += `<div class="card" style="width: 340px;">`;
                    rows += `<div class="row g-0" id="room-${room.room_id}">`;
                    rows += `<div class="col-md-4 mt-2">`;
                    rows += `<img src="${room.room_img}" class=" img-fluid rounded-start" id="img"></div>`;
                    rows += `<div class="col-md-8">`;
                    rows += `<div class="card-body ms-2">`;
                    rows += `<h6 class="card-title"><b>${room.room_name}</b></h6>`;
                    rows += `<i class="uil uil-map-marker"></i>`;
                    rows += `<span class="card-text"> ${room.room_place}</span> <br>`;
                    rows += `<i class="uil uil-user"></i>`;
                    rows += `<span class="card-text"> ${room.room_people}</span></div></div></div> `;

                    rows += `<div class="mx-2">`;
                    rows += ' <table class="table table-bordered text-center">';

                    for (const time of timeSet) {
                        const status = await Status(room.room_id, time);
                        let statusClass = '';
                        let statusText = '';

                        if (status === 'Waiting') {
                            statusText = ` <span class="dot bg-info"
                            style="height: 11px;width: 11px;border-radius: 50%;display: inline-block;"></span>
                          Waiting`;
                        } else if (status === 'Reserved') {
                            statusText = `<span class="dot bg-warning"
                            style="height: 11px;width: 11px;border-radius: 50%;display: inline-block;"></span>
                          Reserved`;
                        } else {
                            statusText = ` <span class="dot bg-success"
                            style="height: 11px;width: 11px;border-radius: 50%;display: inline-block;"></span>
                          Available`;
                        }

                        rows += '<tr>';
                        rows += `<td>${time}</td>`;
                        rows += `<td id="status-${room.room_id}-${time}" class="${statusClass}">${statusText}</td>`;
                        rows += '</tr>';
                    }

                    rows += '</table> </div>';
                    rows += `<button onclick="Booking('${room.room_id}')" class="btn btn-dark mt-3 mb-3 mx-5">Reserving</button></div>`;
                }
            }

            roomlist.innerHTML = rows;

        } else if (response.status == 500) {
            const data = await response.text();
            throw Error(data);
        }
    } catch (error) {
        console.error(error.message);
    }
}

getroomlist();


async function Status(roomId, time) {
    try {
        const response = await fetch(`/Student/rooms-status?roomId=${roomId}&time=${time}`);
        if (response.ok) {
            const data = await response.json();
            // console.log(data, roomId,time)
            if (data.status == 'Waiting') {
                return 'Waiting';
            } else if (data.status == 'Approve') {
                return 'Reserved';
            }
            else {
                return 'Avaliable';
            }
        } else {
            throw Error('Failed to fetch status');
        }
    } catch (error) {
        console.error(error.message);
        return 'Error';
    }
}


function Booking(roomId) {
    window.location.href = `/Student/booking?room_id=${roomId}`;
}

// Function to update status to 'Available' at midnight
function updateStatusAtMidnight() {
    const now = new Date();
    const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // This sets the update time to midnight
        0, // Hours
        0, // Minutes
        0 // Seconds
    );
    const timeUntilMidnight = midnight - now;

    setTimeout(async () => {
        try {
            // Iterate through each room to update the status at midnight
            const roomElements = document.querySelectorAll('.card');
            for (const roomElement of roomElements) {
                const roomId = roomElement.id.split('-')[1]; // Extract room ID from element ID

                for (const time of timeSet) {
                    // Update status cell for each time slot
                    const statusCell = document.getElementById(`status-${roomId}-${time}`);
                    if (statusCell) {
                        statusCell.innerHTML = '<span class="dot bg-success" style="height: 11px;width: 11px;border-radius: 50%;display: inline-block;"></span> Avaliable';
                    }
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    }, timeUntilMidnight);
}

// Call the function to start the countdown to midnight update
updateStatusAtMidnight();





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