import * as userProfile from "./userProfile.mjs";

clearOld();

function clearOld() {
    const now = Date.now();

    const items = {...localStorage};

    for (const key in items) {
        if (key.startsWith('tempCache-')) {
            const parsed = JSON.parse(items[key]);
            if (parsed === null || parsed.createTime === undefined || parsed.value === undefined ||
                now - parsed.createTime > 15 * 60 * 1000) {
                localStorage.removeItem(key);
            }
        }
    }
}

/**
 * @param {string} key
 * @param {object} object
 * @returns void
 * */
export function setCachedValue(key, object) {
    const cacheKey = `tempCache-${key}-${userProfile.getUserUUID()}`;

    localStorage.setItem(cacheKey, JSON.stringify({createTime: Date.now(), value: object}));
}

/**
 * @param {string} key
 * @returns {object|null}
 * @private
 * */
export function getCachedValue(key) {
    try {
        const cacheKey = `tempCache-${key}-${userProfile.getUserUUID()}`;

        const parsed = JSON.parse(localStorage.getItem(cacheKey));
        if (parsed === null || parsed.createTime === undefined || parsed.value === undefined ||
            Date.now() - parsed.createTime > 5 * 60 * 1000) {
            return null;
        }

        return parsed.value;
    } catch {
        return null;
    }
}