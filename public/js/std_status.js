fetch('/user')
    .then(response => response.json())
    .then(data => {
        document.getElementById('username').innerText = data.username;
        document.getElementById('email').innerText = data.email;
    })
    .catch(error => console.error('Error:', error));


const bookstatus = document.querySelector('#status');
async function Student_status() {
    try {
        const response = await fetch('/Student/status_booking');
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            let rows = '';
            if (data.length === 0) {
                // If user hasn't reserved any rooms
                bookstatus.innerHTML = `<div id="hhh"><h5>The status will be show up if you make a reservation.</h5>
                 <h5>You haven't booked any rooms yet.</h5></div>`;
            } else {
                data.forEach(function (status) {
                    rows += `<div class="card" style="width: 340px;">`;
                    rows += `<div class="row g-0" id="room-${status.room_id}">`;
                    rows += `<div class="col-md-4 mt-2">`;
                    rows += `<img src="${status.room_img}" class=" img-fluid rounded-start" id="img"></div>`;
                    rows += `<div class="col-md-8">`;
                    rows += `<div class="card-body ms-2">`;
                    rows += `<h6 class="card-title"><b>${status.room_name}</b></h6>`;
                    rows += `<i class="uil uil-map-marker"></i>`;
                    rows += `<span class="card-text"> ${status.room_place}</span> <br>`;
                    rows += `<i class="uil uil-user"></i>`;
                    rows += `<span class="card-text"> ${status.room_people}</span></div></div></div> `;
                    rows += `<div class="mx-2">`;
                    rows += '<table class="table table-bordered text-center">';
                    rows += `<tr><td>${status.time_reserving}</td></tr>`
                    rows += `<tr><td>${status.date_reserving}</td></tr>`

                    if (status.approved == 'Waiting') {
                        rows += `<tr><td><span class="dot bg-warning" style="height: 9px;width: 9px;border-radius: 50%;display: inline-block;"></span>
                    Wait for the teacher to accept your request.</td></tr>`
                    } else if (status.approved == 'Approve') {
                        rows += `<tr><td class="text-success"><span class="dot bg-success" style="height: 9px;width: 9px;border-radius: 50%;display: inline-block;"></span>
                    Your request has been accepted.</td></tr>`
                    } else {
                        rows += `<tr><td class="text-danger"><span class="dot bg-danger" style="height: 9px;width: 9px;border-radius: 50%;display: inline-block;">
                    </span>
                    Your request was rejected.</td></tr>`;
                        rows += `<tr><td class="bg-danger text-white">${status.message}</td></tr>`;
                    }
                    rows += '</table></div></div>';
                })
                bookstatus.innerHTML = rows;
            }
        } else if (response.status == 500) {
            const data = await response.text();
            throw Error(data);
        }
    } catch (error) {
        console.error(error.message);
    }
}

Student_status()


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
