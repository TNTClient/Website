import * as tntclientEndpoint from "./tntclientWebEndpoints.mjs"
import * as cacheStorage from "./tempCacheStorage.mjs"

const userCacheKey = "user";
const privilegeCacheKey = "privilege";

/**
 * @returns {string|null}
 * */
export function getUserUUID() {
    return localStorage.getItem(userCacheKey);
}

export function getUserUUIDWithoutDashes() {
    return getUserUUID().replaceAll("-", "");
}

/**
 * @param {string} user
 * @param {string} password
 * @returns {Promise<string[]>}
 * */
export function authByCredentials(user, password) {
    const privilegesPromise = tntclientEndpoint.getPrivilegesByCredentials(user, password);

    privilegesPromise.then((privileges) => {
        localStorage.setItem(userCacheKey, user);

        cacheStorage.setCachedValue(privilegeCacheKey, privileges);
    });

    return privilegesPromise;
}

/**
 * @returns {Promise<string[]>}
 * */
export function auth() {
    const privilegesPromise = tntclientEndpoint.getPrivileges();

    privilegesPromise.then((privileges) => {
        cacheStorage.setCachedValue(privilegeCacheKey, privileges);
    });

    return privilegesPromise;
}

/**
 * @returns {Promise<Response>}
 * */
export function logout() {
    const response = tntclientEndpoint.logout();

    response.then(() => {
        localStorage.clear();
    });

    return response;
}

/**
 * @returns {Promise<string[]>}
 * */
function getPrivileges() {
    const cached = cacheStorage.getCachedValue(privilegeCacheKey);
    if (cached !== null) return Promise.resolve(cached);

    const privilegesPromise = tntclientEndpoint.getPrivileges();

    privilegesPromise.then((privileges) => {
        cacheStorage.setCachedValue(privilegeCacheKey, privileges);
    });

    return privilegesPromise;
}

/**
 * @returns {Promise<boolean>}
 * */
export function hasCapePrivilege() {
    return getPrivileges()
        .then(privileges => privileges.includes("CAPE"));
}

/**
 * @returns {Promise<boolean>}
 * */
export function hasTabPrivilege() {
    return getPrivileges()
        .then(privileges => privileges.includes("HEART"));
}

/**
 * @returns {Promise<boolean>}
 * */
export function hasAccessoryPrivilege() {
    return getPrivileges()
        .then(privileges => privileges.includes("ACCESSORIES"));
}

/**
 * @returns {Promise<string>}
 * */
export function getPlayerName() {
    const cached = cacheStorage.getCachedValue("playerName");
    if (cached !== null) return Promise.resolve(cached);

    const url = "https://api.minetools.eu/uuid/" + getUserUUID();
    return fetch(url)
        .then(response => response.json())
        .then(json => {
            if (typeof json.name !== "string") {
                return Promise.reject("Failed to fetch player name");
            }

            cacheStorage.setCachedValue("playerName", json.name);

            return json.name;
        });
}