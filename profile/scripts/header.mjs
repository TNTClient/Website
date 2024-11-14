import * as tntclientEndpoint from "./general/tntclientWebEndpoints.mjs";
import * as domainManager from "../../scripts/domainManager.mjs";
import * as userProfile from "./general/userProfile.mjs";

if (userProfile.getUserUUID() === null) {
    userProfile.logout().finally(() => {
        window.location.replace(domainManager.getCurrentOrigin() + 'profile/login/fail.html');
    });
}

tntclientEndpoint.authErrorListener.push(() => {
    userProfile.logout().then(() => {
        window.location.replace(domainManager.getCurrentOrigin() + 'profile/login/fail.html');
    });
});

tntclientEndpoint.networkErrorListener.push(() => {
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('networkError'));
    toastBootstrap.show();
});
tntclientEndpoint.errorWithMessageListener.push((message) => {
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('serverWarn'));
    const toastBody = document.getElementById('serverWarn-text');

    toastBody.textContent = message;
    toastBootstrap.show();
});

userProfile.getPlayerName().then(name => {
    $(document).ready(() => {
        const avatarUsernameField = document.getElementById('avatarUsername');
        avatarUsernameField.textContent = name;
    });
});

$(document).ready(() => {
    const avatarImage = document.getElementById('avatarImage');
    avatarImage.setAttribute(
        'src', 'https://mineskin.eu/helm/' + userProfile.getUserUUIDWithoutDashes() + '/32');

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        userProfile.logout().then(() => {
            window.location.replace(domainManager.getCurrentOrigin() + "profile/login/logout.html");
        });
    });
});