function booking() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You want to reserve this room?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Booked!',
                text: 'Wait for lecturer to approve your request.',
                icon: 'success',
                showConfirmButton: false,
                timer: 2000
            })
            setTimeout(() => {
                window.location.replace('/Student/status');
            }, 2000);
        } else {
            window.location.replace('/Student/rooms/:id');
        }
    });
}

// const book_room = document.querySelector('#book_room');
// async function bookroom() {
//     const queryString = window.location.search;
//     const urlParams = new URLSearchParams(queryString);
//     const roomId = urlParams.get('room_id');
//     try {
//         const response = await fetch(`/Student/booking/${roomId}`);
//         if (response.ok) {
//             const data = await response.json();
//             let rows = '';
//             data.forEach(function (room) {
//                 rows += `<h4 class="topic fw-bold ms-4 mt-5 pt-3 fs-1"><b>${room.room_name}</b></h4>`
//             })
//             book_room .innerHTML = rows;
//         } else if (response.status == 500) {
//             const data = await response.text();
//             throw Error(data);
//         }
//     } catch (error) {
//         console.error(err.message);
//     }
// }

// bookroom()














// =======date======
const currentDateElement = document.getElementById('current-date');
const currentDate = new Date();

// กำหนดรูปแบบของวันที่
const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
};

// แปลงและแสดงวันที่ปัจจุบันใน element
currentDateElement.textContent = currentDate.toLocaleDateString('en-US', options);

