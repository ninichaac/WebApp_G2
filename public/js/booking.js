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


const book_room = document.querySelector('#book_room');

async function bookroom() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const roomId = urlParams.get('room_id');

    try {
        if (!roomId) {
            throw new Error('Room ID is missing');
        }
        const encodedRoomId = encodeURIComponent(roomId);
        const response = await fetch(`/Student/booking/${encodedRoomId}`);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            if (data && Object.keys(data).length > 0) {
                const room = data;
                let roomInfo = '';
                roomInfo += `<h4 class="topic fw-bold ms-4 mt-5 pt-3 fs-1"><b>${room.room_name}</b></h4>`;
                roomInfo += `<div class="container"><div class="col">`;
                roomInfo += `<div class="room col mt-3">`;
                roomInfo += `<i class="uil uil-map-marker fw-bold"></i><span class="fw-bold me-5"> ${room.room_place}</span>`;
                roomInfo += `<i class="uil uil-user fw-bold"></i><span class="fw-bold me-5"> ${room.room_people}</span>`;
                roomInfo += `<i class="uil uil-calendar-alt"></i><span class="fw-bold"> ${getCurrentDate()}</span></div></div>`;
                roomInfo += `<div class="room2 col mt-3">`;
                roomInfo += `<div><p class="text-start">Please select time for reserving room</p>`;
                roomInfo += `<select name="time" id="time${room.room_id}" class="form-select">`;
                roomInfo += `<option value="8-10">8-10 A.M.</option>`;
                roomInfo += `<option value="10-12">10-12 P.M.</option>`;
                roomInfo += `<option value="12-15">12-15 P.M.</option>`;
                roomInfo += `<option value="15-17">15-17 P.M.</option>`;
                roomInfo += `</select></div>`;
                roomInfo += `<div class="mt-3"><p class="text-start">Reason for requesting a meeting room?</p>`;
                roomInfo += `<select name="reason" id="" class="form-select">`;
                roomInfo += `<option value="1">Meeting</option>>`;
                roomInfo += `<option value="2">Researching / Doing Project</option>`;
                roomInfo += `<option value="3">Studying / Tutoring</option>`;
                roomInfo += `<option value="4">Watching Movies</option>`;
                roomInfo += `</select></div></div>`;
                roomInfo += `<div class="container buttbook text-center">
                <button class="btn btn-outline-info btn-lg fw-bold col-6" onclick="booking()">Reserving</button></div></div>`;

                book_room.innerHTML = roomInfo;
            } else {
                throw new Error('Room data not found');
            }
        } else if (response.status == 500) {
            const errorText = await response.text();
            throw Error(errorText);
        }
    } catch (error) {
        console.error(error.message);
    }
}

bookroom();







// =======date======
function getCurrentDate() {
    // const currentDateElement = document.querySelector('#current-date');
    const currentDate = new Date();

    // กำหนดรูปแบบของวันที่
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    // แปลงและแสดงวันที่ปัจจุบันใน element
    return currentDate.toLocaleDateString('en-US', options);
}

