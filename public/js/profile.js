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


const getname = document.querySelector('#getname');
const getemail = document.querySelector('#getemail');
let id = '';

//get user info
async function getUser() {
  try {
    const response = await fetch('/user');
    if (response.ok) {
      const data = await response.json();
      getname.value = data.username;
      getemail.value = data.email;
      id = data.user_id;
    }
    else {
      throw Error('Connection error');
    }
  } catch (err) {
    console.error(err);
  }
};


// Edit profile by ID
async function editProfileById() {
  const btnEdit = document.querySelector('#btnedit');
  // let id = '';

  btnEdit.onclick = async () => {
    if (btnEdit.innerText == 'Edit Profile') {
      document.querySelector('#getname').disabled = false;
      btnEdit.innerText = 'Save';
    } else {
      const username = document.querySelector('#getname').value;
      if (username.trim() !== '') {
        try {
          const updatedItem = { username };

          const response = await fetch(`/Student/editprofile/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedItem),
          });

          const data = await response.json();

          if (data.status == 'success') {
            getUser();
            window.location.reload();

          } else {
            alert(`Error: ${data.message}`);
          }
        } catch (error) {
          console.error('Error updating username:');
        }
      } else {
        alert('Please fill in the username');
      }
      document.querySelector('#getname').disabled = true;
      btnEdit.innerText = 'Edit Profile';
    }
  };
}
getUser();
editProfileById()