import * as domainManager from "../../../scripts/domainManager.mjs";
import * as userProfile from "./userProfile.mjs";

/**
 * @returns {Promise<any>}
 * @private
 * */
export function getPlayerConfig() {
    const url = domainManager.getCapeOrigin() + 'capeData/' + userProfile.getUserUUID() + '.json';

    return fetch(url)
        .then(response => response.json());
}
