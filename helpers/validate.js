function validateForm() {
    var name = document.forms["registrationForm"]["name"].value;
    var email = document.forms["registrationForm"]["email"].value;
    var mobile = document.forms["registrationForm"]["mobile"].value;
    var password = document.forms["registrationForm"]["password"].value;
    var nameRegex = /^[a-zA-Z\s]+$/;
    var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var mobileRegex = /^\d{10}$/;
    var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    if (!nameRegex.test(name)) {
        document.getElementById("nameError").innerHTML = "Invalid name";
        return false;
    }

    if (!emailRegex.test(email)) {
        document.getElementById("emailError").innerHTML = "Invalid email";
        return false;
    }

    if (!mobileRegex.test(mobile)) {
        document.getElementById("mobileError").innerHTML = "Invalid mobile number";
        return false;
    }

    if (!passwordRegex.test(password)) {
        document.getElementById("passwordError").innerHTML = "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, and one number";
        return false;
    }

    return true;
}