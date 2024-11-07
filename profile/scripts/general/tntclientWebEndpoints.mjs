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
 * @param {Promise<Response>} response
 * @returns {Promise<Response>}
 * */
function processError(response) {
    response.catch(() => {
        networkErrorListener.forEach(listener => listener());
    });

    return response.then(value => {
        if (!value.ok) {
            if (value.status === 401 || value.status === 403) {
                authErrorListener.forEach(listener => listener());

                return Promise.reject(new Error("Unauthorized"));
            }

            return new Promise(async (resolve, reject) => {
                value.json().then(json => {
                    errorWithMessageListener.forEach(listener => listener(json.message ??
                        "Unknown Error. Try logging in again."));

                    reject(new Error("Invalid status code: " + value.status));
                }).catch(() => {
                    errorWithMessageListener.forEach(listener => listener("Unknown Error. Try logging in again."));

                    reject(new Error("Invalid status code: " + value.status));
                });
            });
        }

        return value;
    });
}

/**
 * @returns {Promise<Response>}
 * */
export function logout() {
    const url = getTntServerApiAddress('api/logout');

    return processError(fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-Requested-From': 'TNTClient Web Profile'
        }
    }));
}

/**
 * @param {string} user User UUID
 * @param {string} password User Random UUID Token
 * @returns {Promise<string[]>}
 * */
export function getPrivilegesByCredentials(user, password) {
    const url = getTntServerApiAddress('api/v1/user/roles?remember=true');

    return processError(fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Authorization': 'Basic ' + btoa(user + ':' + password),
            'X-Requested-From': 'TNTClient Web Profile'
        }
    }))
        .then(response => response.json())
        .then(json => {
            if (Array.isArray(json)) return json;

            return [];
        });
}

/**
 * @returns {Promise<string[]>}
 * */
export function getPrivileges() {
    const url = getTntServerApiAddress('api/v1/user/roles');

    return processError(fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'X-Requested-From': 'TNTClient Web Profile'
        }
    }))
        .then(response => response.json())
        .then(json => {
            if (Array.isArray(json)) return json;

            return [];
        });
    ;
}

/**
 * @param {string} capeData
 * @param {boolean} isEnabled
 * @returns {Promise<Response>}
 * */
export function updateCape(capeData, isEnabled) {
    const url = getTntServerApiAddress('api/v1/player/profile/cape');

    return processError(fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-From': 'TNTClient Web Profile'
        },
        body: JSON.stringify({
            data: capeData,
            enabled: isEnabled
        })
    }));
}

/**
 * @returns {Promise<Response>}
 * */
export function removeCape() {
    const url = getTntServerApiAddress('api/v1/player/profile/cape');

    return processError(fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'X-Requested-From': 'TNTClient Web Profile'
        }
    }));
}

/**
 * @param {string[]} tabAnimation
 * @param {number} delayMs
 * @returns {Promise<Response>}
 * */
export function updateTab(tabAnimation, delayMs) {
    const url = getTntServerApiAddress('api/v1/player/profile/tab');

    return processError(fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-From': 'TNTClient Web Profile'
        },
        body: JSON.stringify({
            tabAnimation: tabAnimation,
            delayMs: delayMs
        })
    }));
}

/**
 * @returns {Promise<Response>}
 * */
export function removeTab() {
    const url = getTntServerApiAddress('api/v1/player/profile/tab');

    return processError(fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'X-Requested-From': 'TNTClient Web Profile'
        }
    }));
}

/**
 * @param {string[]} accessories
 * @returns {Promise<Response>}
 * */
export function updateAccessories(accessories) {
    const url = getTntServerApiAddress('api/v1/player/profile/accessories');

    return processError(fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-From': 'TNTClient Web Profile'
        },
        body: JSON.stringify({
            accessories: accessories,
        })
    }));
}

/**
 * @returns {Promise<Response>}
 * */
export function removeAccessories() {
    const url = getTntServerApiAddress('api/v1/player/profile/accessories');

    return processError(fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'X-Requested-From': 'TNTClient Web Profile'
        }
    }));
}

/**
 * @returns {Promise<Response>}
 * */
export function removeProfile() {
    const url = getTntServerApiAddress('api/v1/player/profile');

    return processError(fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'X-Requested-From': 'TNTClient Web Profile'
        }
    }));
}