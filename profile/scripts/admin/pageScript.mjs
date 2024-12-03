import * as userProfile from "../general/userProfile.mjs";
import * as domainManager from "../../../scripts/domainManager.mjs";
import * as tntclientEndpoint from "../general/tntclientWebEndpoints.mjs";

userProfile.hasAdminPrivilege().then((hasPrivilege) => {
    if (!hasPrivilege) {
        window.location.replace(domainManager.getCurrentOrigin() + 'profile');
    }
});

$(document).ready(() => {
    const saveChangesBtn = document.getElementById('reloadAccessoryCache');

    saveChangesBtn.addEventListener('click', () => {
        tntclientEndpoint.adminResetAccessoryCache()
            .then(value => value.text())
            .then(value => {
                alert(value);
            })
            .catch(reason => {
                alert(reason);
            });
    });
});