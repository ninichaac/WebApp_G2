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


// const getnaem = document.querySelector('#getnaem');
// const getemail = document.querySelector('#getemail');
// let id = '';
// getUser();
// //get user info
// async function getUser() {
//   try {
//     const response = await fetch('/user');
//     if (response.ok) {
//       const data = await response.json();
//       // document.querySelector('#user').innerText = 'Welcome ' + data.username;
//       getnaem.innerHTML = data.username;
//       getemail.innerHTML = data.email;
//       console.log(data);
//       editprofilebyid();
//       id = data.user_id;


//     }
//     else {
//       throw Error('Connection error');
//     }
//   } catch (err) {
//     console.error(err);
//     alert(err.message);
//   }
// };

// function editprofilebyid() {
//   bntedititemByid = document.querySelector('#editprofilebyid');
//   bntedititemByid.onclick = async function () {
//     const formedit = document.querySelector('#formedit');
//     if (formedit['username'].value != '' || formedit['password'].value != '') {
//       const updatedItem = {
//         username: formedit['username'].value,
//         password: formedit['password'].value,

//       }

//       // console.log(`${formedit['username'].value} ${formedit['password'].value}`);
//       try {
//         const response = await fetch(`/Student/editprofile/${id}`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(updatedItem),
//         });

//         const data = await response.json();

//         if (data.status == 'success') {
//           alert('updated successfully');
//           window.location.reload();
//         } else {
//           alert(`Error: ${data.message}`);
//         }
//       } catch (error) {
//         console.error('Error updating product:', error);
//       }
//     } else {
//       alert('please fill username or password')
//     }
//   }
// }