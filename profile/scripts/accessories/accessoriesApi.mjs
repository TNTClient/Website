import * as tntclientEndpoint from "../general/tntclientWebEndpoints.mjs";
import * as cacheStorage from "../general/tempCacheStorage.mjs"
import * as playerStorage from "../general/playerStorage.mjs";
import seasonalAccessories from '../../../accessory/seasonal.json' with {type: 'json'};

const cacheKey = "cached-accessories"

/**
 * @param {string[]} accessoriesList
 * @returns {Promise<Response>}
 * */
export function sendSelectedAccessories(accessoriesList) {
    const response = tntclientEndpoint.updateAccessories(accessoriesList);

    response.then(accessoriesList => {
        cacheStorage.setCachedValue(cacheKey, accessoriesList);
    });

    return response;
}

/**
 * @returns {Promise<string[]>}
 * */
export function readAccessories() {
    try {
        const cached = cacheStorage.getCachedValue(cacheKey);
        if (cached !== null) return Promise.resolve(Array.from(cached));

        return playerStorage.getPlayerConfig().then(value => {
            const accessories = value["accessories"];
            if (accessories === undefined || accessories === null) return [];

            return Object.keys(accessories);
        });
    } catch {
        return Promise.resolve([]);
    }
}

/**
 * @returns {string[]}
 * */
export function getAllSeasonalAccessories() {
    const currentDate = new Date();
    let out = [];

    for (const seasonalBlock of seasonalAccessories) {
        if (new Date(seasonalBlock.start) <= currentDate && new Date(seasonalBlock.end) >= currentDate) {
            if (!Array.isArray(seasonalBlock.accessories)) continue;

            out.push(...seasonalBlock.accessories);
        }
    }

    return out;
}