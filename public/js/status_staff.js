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

const re_status = document.querySelector('#re_status');
async function restatus() {
    try {
        const response = await fetch('/Staff/Status');
        if (response.ok) {
            const data = await response.json();
            console.log(data)
            let rows = '';
            for (const status of data) {
                rows += `<tr>`;
                rows += `<td>${status.username}</td>`
                rows += `<td>${status.room_name}</td>`
                rows += `<td>${status.time_reserving}</td>`
                rows += `<td>${status.date_reserving}</td>`
                // rows += `<td>${status.comment_user}</td>`
                rows += `<td>${status.approver}</td>`
                if (status.approved == 'Approve') {
                    rows += `<td class="text-success">Approve</td>`
                    rows += `</tr>`;
                } else if (status.approved == 'Disapprove') {
                    rows += `<td class="text-danger">Disapprove</td>`
                    rows += `</tr>`;
                }
            }
            re_status.innerHTML = rows;
        } else if (response.status == 500) {
            const data = await response.text();
            throw Error(data);
        }
    } catch (error) {
        console.error(error.message);
    }
}
restatus()