/**
 * @param {string} uuid
 * @returns {Promise<any>}
 * @private
 * */
export function getPlayerConfig(uuid) {
    const url = getCapeApiAddress(`capeData/${uuid}.json`);

    return fetch(url)
        .then(response => response.json());
}
