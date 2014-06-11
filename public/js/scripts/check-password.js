//From Daniel Studds
//This defines a simple event listener that enables and disabled to submit button and 
//changed the class and value of the strength indicator.

var password = document.getElementById("password"),
    strength = document.getElementById("strength"),
    submit = document.getElementById("submit");

password.addEventListener('keyup', function () {
    var score = zxcvbn(password.value).score;
    if (score < 2) {
        strength.value = strength.className = "weak";
        //submit.disabled = true;
    }
    if (score === 2) {
        strength.value = strength.className = "so-so";
        //submit.disabled = false;
    }
    if (score > 2) {
        strength.value = strength.className = "strong";
        //submit.disabled = false;
    }
});
