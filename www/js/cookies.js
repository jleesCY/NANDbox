function setCookie(name,value) {
    document.cookie = name + "=" + (value || "") + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for(var cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.substring(0,nameEQ.length) == nameEQ) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

function cookieExists(name) {
    return getCookie(name) != null
}