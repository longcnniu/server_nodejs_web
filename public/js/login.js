function login() {

    const data = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    fetch('http://localhost:5000/login', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            if(data.success){
                document.cookie = `token=${data.accessToken}`;
                window.location.href = "/home";
            }else{
                console.log(data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}