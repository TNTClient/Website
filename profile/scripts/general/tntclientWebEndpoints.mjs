import * as domainManager from "../../../scripts/domainManager.mjs";

/**
 * @type {function(string)[]}
 * */
export const errorWithMessageListener = [];
/**
 * @type {function[]}
 */
export const authErrorListener = [];
/**
 * @type {function[]}
 * */
export const networkErrorListener = [];

/**
 * @returns {Promise<Response>}
 * */
export function logout() {
    try {
        const url = domainManager.getTntServerOrigin() + 'api/logout';

        return processError(
            fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-Requested-From': 'TNTClient Web Profile'
                }
            })
        );
    } catch {
        errorWithMessageListener.forEach(value => value("Error in request. Refresh the page and try again."));

        return Promise.reject();
    }
}

/**
 * @param {string} user User UUID
 * @param {string} password User Random UUID Token
 * @returns {Promise<string[]>}
 * */
export function getPrivilegesByCredentials(user, password) {
    try {
        if (typeof user !== 'string' || typeof password !== 'string') {
            errorWithMessageListener.forEach(value =>
                value("Incorrect state for request. Refresh the page and try again."));

            return Promise.reject();
        }

        const url = domainManager.getTntServerOrigin() + 'api/v1/user/roles?remember=true';

        return processError(
            fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': 'Basic ' + btoa(user + ':' + password),
                    'X-Requested-From': 'TNTClient Web Profile'
                }
            })
        )
            .then(response => response.json())
            .then(json => {
                if (Array.isArray(json)) return json;

                return [];
            });
    } catch {
        errorWithMessageListener.forEach(value => value("Error in request. Refresh the page and try again."));

        return Promise.reject();
    }
}

/**
 * @returns {Promise<string[]>}
 * */
export function getPrivileges() {
    try {
        const url = domainManager.getTntServerOrigin() + 'api/v1/user/roles';

        return processError(
            fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'X-Requested-From': 'TNTClient Web Profile'
                }
            })
        )
            .then(response => response.json())
            .then(json => {
                if (Array.isArray(json)) return json;

                return [];
            });
    } catch {
        errorWithMessageListener.forEach(value => value("Error in request. Refresh the page and try again."));

        return Promise.reject();
    }
}

/**
 * @param {string} capeData
 * @param {boolean} isEnabled
 * @returns {Promise<Response>}
 * */
export function updateCape(capeData, isEnabled) {
    return fetchPut('api/v1/player/profile/cape', {
        data: capeData,
        enabled: isEnabled
    });
}

/**
 * @returns {Promise<Response>}
 * */
export function removeCape() {
    return fetchDelete('api/v1/player/profile/cape');
}

/**
 * @param {string[]} tabAnimation
 * @param {number} delayMs
 * @returns {Promise<Response>}
 * */
export function updateTab(tabAnimation, delayMs) {
    return fetchPut('api/v1/player/profile/tab', {
        tabAnimation: tabAnimation,
        delayMs: delayMs
    });
}

/**
 * @returns {Promise<Response>}
 * */
export function removeTab() {
    return fetchDelete('api/v1/player/profile/tab');
}

/**
 * @param {string[]} accessories
 * @returns {Promise<Response>}
 * */
export function updateAccessories(accessories) {
    return fetchPut('api/v1/player/profile/accessories', {
        accessories: accessories
    });
}

/**
 * @returns {Promise<Response>}
 * */
export function removeAccessories() {
    return fetchDelete('api/v1/player/profile/accessories');
}

/**
 * @returns {Promise<Response>}
 * */
export function removeProfile() {
    return fetchDelete('api/v1/player/profile');
}

/**
 * @param {Promise<Response>} response
 * @returns {Promise<Response>}
 * @private
 * */
function processError(response) {
    response.catch(() => {
        networkErrorListener.forEach(listener => listener());
    });

    return response.then(value => {
        if (!value.ok) {
            const statusCode = value.status;

            if (statusCode === 401 || statusCode === 403) {
                authErrorListener.forEach(listener => listener());

                return Promise.reject(new Error("Unauthorized"));
            }

            return new Promise(async (resolve, reject) => {
                value.json().then(json => {
                    errorWithMessageListener.forEach(listener => listener(json.message ??
                        "Unknown Error. Status code: " + statusCode + ". Try logging in again."));

                    reject(new Error("Invalid status code: " + statusCode));
                }).catch(() => {
                    errorWithMessageListener.forEach(listener =>
                        listener("Unknown Error. Status code: " + statusCode + ". Try logging in again."));

                    reject(new Error("Invalid status code: " + statusCode));
                });
            });
        }

        return value;
    });
}

/**
 * @param {string} urlPart
 * @param {object} object
 * @returns {Promise<Response>}
 * @private
 * */
function fetchPut(urlPart, object) {
    try {
        const url = domainManager.getTntServerOrigin() + urlPart;

        return processError(
            fetch(url, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-From': 'TNTClient Web Profile'
                },
                body: JSON.stringify(object)
            })
        );
    } catch {
        errorWithMessageListener.forEach(value => value("Error in request. Refresh the page and try again."));

        return Promise.reject();
    }
}

/**
 * @param {string} urlPart
 * @returns {Promise<Response>}
 * @private
 * */
function fetchDelete(urlPart) {
    try {
        const url = domainManager.getTntServerOrigin() + urlPart;

        return processError(
            fetch(url, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'X-Requested-From': 'TNTClient Web Profile'
                }
            })
        );
    } catch {
        errorWithMessageListener.forEach(value => value("Error in request. Refresh the page and try again."));

        return Promise.reject();
    }
}