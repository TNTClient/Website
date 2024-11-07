const domains = [{
    protocol: 'http://',
    redirectOnFail: true,
    hostname: 'localhost:8081',
    startPath: '/TNTClientWebsite/',
    downloadAPI: 'tntdownload.jeka8833.pp.ua',
    capeAPI: 'tntcape.jeka8833.pp.ua',
    tntServerAPI: 'localhost:8080'
}, {
    protocol: 'https://',
    redirectOnFail: true,
    hostname: 'tntclient.jeka8833.pp.ua',
    startPath: '/',
    downloadAPI: 'tntdownload.jeka8833.pp.ua',
    capeAPI: 'tntcape.jeka8833.pp.ua',
    tntServerAPI: 'tntapi.jeka8833.pp.ua'
}, {
    protocol: 'https://',
    redirectOnFail: true,
    hostname: 'tntclient.994799.xyz',
    startPath: '/',
    downloadAPI: 'tntdownload.994799.xyz',
    capeAPI: 'tntcape.994799.xyz',
    tntServerAPI: 'tntapi.994799.xyz'
}];

/**
 * @type {{protocol: string, hostname: string, startPath: string, tntServerAPI: string, redirectOnFail: boolean,
 * downloadAPI: string, capeAPI: string}|undefined}
 * */
const currentDomain = getCurrentDomain();

/**
 * @returns {{protocol: string, hostname: string, startPath: string, tntServerAPI: string, redirectOnFail: boolean,
 * downloadAPI: string, capeAPI: string}|undefined}
 * */
function getCurrentDomain() {
    return domains.find(d => d.hostname.split(':')[0] === window.location.hostname.toLowerCase());
}

/**
 * @param {string} path
 * @returns {string}
 * @throws {Error}
 * */
function getCapeApiAddress(path) {
    if (currentDomain === undefined) throw new Error('Domain is not allowed');

    return currentDomain.protocol + currentDomain.capeAPI + '/' + path;
}

/**
 * @param {string} path
 * @returns {string}
 * @throws {Error}
 * */
function getTntServerApiAddress(path) {
    if (currentDomain === undefined) throw new Error('Domain is not allowed');

    return currentDomain.protocol + currentDomain.tntServerAPI + '/' + path;
}

/**
 * @param {string} path
 * @returns {string}
 * @throws {Error}
 * */
function getCurrentDomainAddress(path) {
    if (currentDomain === undefined) throw new Error('Domain is not allowed');

    return currentDomain.protocol + currentDomain.hostname + currentDomain.startPath + path;
}


if (document.readyState !== 'loading') {
    domainReplacerInit();
} else {
    document.addEventListener('DOMContentLoaded', domainReplacerInit);
}

/**
 * @returns {void}
 * @throws {Error}
 * */
function domainReplacerInit() {
    if (currentDomain === undefined) throw new Error('Domain is not allowed');

    document.body.innerHTML = document.body.innerHTML
        .replaceAll('{{host}}/', currentDomain.hostname + currentDomain.startPath)
        .replaceAll('{{download}}/', currentDomain.downloadAPI + '/');
}