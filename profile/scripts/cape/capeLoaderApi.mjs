import {CapeClass} from "./capeClass.mjs";
import * as capeResizer from "./capeResizer.mjs";
import * as cacheStorage from "../general/tempCacheStorage.mjs";
import * as userProfile from "../general/userProfile.mjs";
import * as playerStorage from "../general/playerStorage.mjs";


/**
 * @param {string} uuidOrName
 * @returns {Promise<Record<string, string>>}
 * */
export function readAllCapes(uuidOrName) {
    const url = `https://api.capes.dev/load/${uuidOrName}`;

    return fetch(url)
        .then(response => response.json())
        .then(json =>
            Object.fromEntries(
                Object.entries(json)
                    .map(([key, {imageUrl}]) => [key, imageUrl])
                    .filter(([, value]) => value !== undefined && value !== null)
            )
        );
}

/**
 * @returns {Promise<CapeClass>}
 * */
export async function getCurrentCape() {
    const cached = cacheStorage.getCachedValue("cached-cape");
    if (cached !== null) return Promise.resolve(CapeClass.fromObject(cached));

    const capeUrl = getCapeApiAddress(`capes/${userProfile.getUserUUID()}.png`);

    const [userCape, userData] =
        await Promise.allSettled([
            capeResizer.normalizeCapeSize(capeUrl),
            playerStorage.getPlayerConfig(userProfile.getUserUUID())
        ]);

    if (userCape.status === "fulfilled" && userData.status === "fulfilled") {
        return Promise.resolve(new CapeClass(userCape.value, userData.value["capePriority"] === 2));
    } else if (userCape.status === "fulfilled") {
        return Promise.resolve(new CapeClass(userCape.value, false));
    } else if (userData.status === "fulfilled") {
        return Promise.resolve(new CapeClass("", userData.value["capePriority"] === 2));
    } else {
        return Promise.resolve(new CapeClass("", false));
    }
}

/**
 * @param {CapeClass} cape
 * @returns void
 * */
export function saveCachedCape(cape) {
    if (!(cape instanceof CapeClass)) throw new Error("Invalid cape");

    cacheStorage.setCachedValue("cached-cape", cape);
}
