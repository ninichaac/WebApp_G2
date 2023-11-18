fetch('/user')
  .then(response => response.json())
  .then(data => {
    document.getElementById('username').innerText = data.username;
    document.getElementById('email').innerText = data.email;
  })
  .catch(error => console.error('Error:', error));