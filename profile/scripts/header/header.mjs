import * as tntclientEndpoint from "../general/tntclientWebEndpoints.mjs";
import * as userProfile from "../general/userProfile.mjs";

tntclientEndpoint.authErrorListener.push(() => {
    userProfile.logout().then(() => {
        if (currentDomain !== undefined && currentDomain.redirectOnFail) {
            window.location.replace(getCurrentDomainAddress('profile/login/fail.html'));
        }
    });
});

tntclientEndpoint.networkErrorListener.push(() => {
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('networkError'));
    toastBootstrap.show();
});
tntclientEndpoint.errorWithMessageListener.push((message) => {
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('serverWarn'));

    $("#serverWarn-text").text(message);

    toastBootstrap.show();
});

userProfile.getPlayerName().then(name => {
    $(document).ready(() => {
        $("#avatarUsername").text(name);
    });
});

$(document).ready(() => {
    $("#avatarImage").attr("src", "https://mineskin.eu/helm/" + userProfile.getUserUUIDWithoutDashes() + "/32");

    $("#logoutBtn").click(() => {
        userProfile.logout().then(() => {
            window.location.replace(getCurrentDomainAddress("profile/login/logout.html"));
        });
    });
});