import * as tntclientEndoint from "../general/tntclientWebEndpoints.mjs"
import * as userProfile from "../general/userProfile.mjs"
import * as tntclientEndpoint from "../general/tntclientWebEndpoints.mjs";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const user = urlParams.get("user")
const token = urlParams.get("token")

tntclientEndoint.authErrorListener.push(() => {
    if (currentDomain !== undefined && currentDomain.redirectOnFail) {
        window.location.replace(getCurrentDomainAddress('profile/login/fail.html'));
    }
});
tntclientEndpoint.networkErrorListener.push(() => {
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('networkError'))
    toastBootstrap.show();
});
tntclientEndpoint.errorWithMessageListener.push((message) => {
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('serverWarn'))
    toastBootstrap.show();

    $("#serverWarn-text").text(message);
});

if (user == null || token == null) {
    userProfile.auth()
        .then(() => {
            window.location.replace(getCurrentDomainAddress('profile/'));
        });
} else {
    userProfile.authByCredentials(user, token)
        .then(() => {
            window.location.replace(getCurrentDomainAddress('profile/'));
        });
}
