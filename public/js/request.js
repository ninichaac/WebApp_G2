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
const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short'
};
currentDateElement.textContent = currentDate.toLocaleDateString('en-US', options);


// ====getallrequest
const listrequest = document.querySelector('#request');
async function requestlist() {
  try {
    const response = await fetch('/Lecturer/allrequest');
    if (response.ok) {
      const data = await response.json();
      console.log(data)
      let rows = '';
      for (const request of data) {
        rows += `<tr>`;
        rows += `<td>${request.username}</td>`
        rows += `<td>${request.room_name}</td>`
        rows += `<td>${request.time_reserving}</td>`
        rows += `<td>${request.date_reserving}</td>`
        rows += `<td>${request.comment_user}</td>`
        rows += `<td> <button id="Approve${request.reserving_id}" class="btn btn-success me-3" onclick="Approve(${request.reserving_id})">
        Approve</button>`;
        rows += `<button id="showPopupButton${request.reserving_id}" class="btn btn-danger" onclick="openPopup(${request.reserving_id})">
        Disapprove</button></td>`;
        rows += `</tr>`;
      }
      listrequest.innerHTML = rows;
    } else if (response.status == 500) {
      const data = await response.text();
      throw Error(data);
    }
  } catch (error) {
    console.error(error.message);
  }
}
requestlist()

// approve
async function Approve(reservingId) {
  try {
    const options = {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        "reserving_id": reservingId, 
        "message": "", 
        "approved": 'Approve' 
      }),
    };
    const response = await fetch(`/Lecturer/updateStatus/${reservingId}`, options);
    if (response.ok) {
      const data = await response.text();
      location.reload();
    }
    else if (response.status == 401) {
      const data = await response.text();
      throw Error(data);
    }
    else {
      throw Error('Connection error');
    }
  } catch (error) {
    console.error(error.message);
  }
}


// disapprove
function openPopup(reservingId) {
  const popupContent = `
  <div class="popup-content rounded">
      <span class="close" onclick="closePopup()">&times;</span>
      <h3>Give reasons for disapprove</h3>
      <div class="form-floating">
          <textarea class="form-control" id="textInput" style="height: 150px;width: 500px;"
              placeholder="Leave a comment here"></textarea>
      </div>
      <div>
          <button onclick="submitText(${reservingId})" class="btn btn-primary mt-3">Submit</button>
      </div>
  </div>
`;

document.getElementById('myPopup').innerHTML = popupContent;
document.getElementById('myPopup').style.display = 'block';

}

function closePopup() {
  document.getElementById('myPopup').style.display = 'none';
}

async function submitText(reservingId) {
  const userInput = document.getElementById('textInput').value;
  try {
    const options = {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        "reserving_id": reservingId, 
        "message": userInput, 
        "approved": 'Disapprove' 
      }),
    };
    const response = await fetch(`/Lecturer/updateStatus/${reservingId}`, options);
    if (response.ok) {
      const data = await response.text();
      console.log(data);
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
  }
  console.log(userInput);
  closePopup();
}