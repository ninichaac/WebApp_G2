const book_room = document.querySelector('#book_room');
let urlParams;
const timeSet = ['8-10 A.M.', '10-12 P.M.', '12-15 P.M.', '15-17 P.M.'];

async function bookroom() {
    const queryString = window.location.search;
    urlParams = new URLSearchParams(queryString);
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
                roomInfo += `<select name="time" id="time" class="form-select">`;
                timeSet.forEach(function (time) {
                    roomInfo += `<option value="${time}">${time}</option>`;
                });
                // roomInfo += `<option value="8-10 A.M.">8-10 A.M.</option>`;
                // roomInfo += `<option value="10-12 P.M.">10-12 P.M.</option>`;
                // roomInfo += `<option value="12-15 P.M.">12-15 P.M.</option>`;
                // roomInfo += `<option value="15-17 P.M.">15-17 P.M.</option>`;
                roomInfo += `</select></div>`;
                roomInfo += `<div class="mt-3"><p class="text-start">Reason for requesting a meeting room?</p>`;
                roomInfo += `<select name="reason" id="reason" class="form-select">`;
                roomInfo += `<option value="Meeting">Meeting</option>>`;
                roomInfo += `<option value="Researching / Doing Project">Researching / Doing Project</option>`;
                roomInfo += `<option value="Studying / Tutoring">Studying / Tutoring</option>`;
                roomInfo += `<option value="Watching Movies">Watching Movies</option>`;
                roomInfo += `</select></div></div>`;
                roomInfo += `<div class="container buttbook text-center">
                <button class="btn btn-outline-info btn-lg fw-bold col-6" onclick="bookRoom()">Reserving</button></div></div>`;


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


async function fetchBookedTimes(roomId, date) {
    try {
        const response = await fetch(`/Student/get-booked-times?room_id=${roomId}&date=${date}`);
        if (response.ok) {
            const bookedTimes = await response.json();
            return bookedTimes;
        }
        throw new Error('ไม่สามารถดึงข้อมูลเวลาที่ถูกจองไปแล้วได้');
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function bookRoom() {
    const CurrentDate = getCurrentDate();
    const selectedTime = document.getElementById('time').value;
    const reason = document.getElementById('reason').value;
    const roomId = new URLSearchParams(window.location.search).get('room_id');
    console.log(selectedTime, reason, roomId, CurrentDate)

    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to book this room?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, book it!'
        });

        if (result.isConfirmed) {
            const options = {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "room_id": roomId,
                    "date_reserving": CurrentDate,
                    "time_reserving": selectedTime,
                    "comment_user": reason
                }),
            };
            const response = await fetch('/Student/booking-room', options);

            const bookedTimes = await fetchBookedTimes(roomId, CurrentDate);
            const timeOptions = document.getElementById('time');
            Array.from(timeOptions.options).forEach(option => {
                if (bookedTimes.includes(option.value)) {
                    option.disabled = true;
                }
            });
            if (response.ok) {
                const data = await response.text();
                window.location.replace(data);
            }
            else if (response.status == 401) {
                const data = await response.text();
                throw Error(data);
            } else if (response.status == 400 || response.status == 500) {
                const data = await response.text();
                throw Error(data);
            }
            else {
                Swal.fire('Cancelled', 'Your booking request was not processed.', 'info');
            }
        }
    } catch (err) {
        console.error(err.message);
        alert(err.message);
    }
}

