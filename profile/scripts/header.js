addAuthenticationErrorListener(function () {
    if (currentDomain !== undefined && currentDomain.redirectOnFail)
        window.location.replace(getCurrentDomainAddress('profile/login/fail.html'));
})

addServerErrorListener(function () {
    $("#errorBox").removeClass("d-none");
})

const userUUID = getUser();

$(function () {
    uuidToName(userUUID, function (name) {
        $("#avatarUsername").text(name);
    })

    $("#avatarImage").attr("src", "https://mineskin.eu/helm/" + userUUID + "/32");

    $("#logoutBtn").click(function () {
        logout(function (redirect) {
            window.location.replace(getCurrentDomainAddress("profile/login/logout.html"));
        })
    });
});

function uuidToName(uuid, callback) {
    $.getJSON("https://api.minetools.eu/uuid/" + uuid, function (data) {
        if (data.name === undefined || data.name === null) {
            callback(undefined);
        } else {
            callback(data.name);
        }
    }).fail(function () {
        callback(undefined);
    });
}