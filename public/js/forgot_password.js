function sendEmail() {
    const data = {
        email: document.getElementById("email").value,
    };

    fetch('/forgot-password', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            if(data.success){
                console.log(data.message);
            }else{
                console.log(data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function verifyOTP() {
    const data = {
        email: document.getElementById("email").value,
        otp: document.getElementById("OTP").value,
        password: document.getElementById("password").value,
    };

    fetch('/send-otp', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            if(data.success){
                if(data.success){
                    window.location.href = "/login"
                }else{
                    console.log(data.message);
                }
            }else{
                console.log(data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}