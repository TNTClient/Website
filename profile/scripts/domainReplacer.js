const domains = [{
    protocol: 'http://',
    redirectOnFail: true,
    hostname: 'localhost:63342',
    startPath: '/TNTClientWeb/',
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

const currentDomain = getCurrentDomain();

function getCurrentDomain() {
    return domains.find(d => d.hostname.split(':')[0] === window.location.hostname.toLowerCase());
}

function getCapeApiAddress(path) {
    if (currentDomain === undefined) throw new Error('Domain is not allowed');

    return currentDomain.protocol + currentDomain.capeAPI + '/' + path;
}

function getTntServerApiAddress(path) {
    if (currentDomain === undefined) throw new Error('Domain is not allowed');

    return currentDomain.protocol + currentDomain.tntServerAPI + '/' + path;
}

function getCurrentDomainAddress(path) {
    if (currentDomain === undefined) throw new Error('Domain is not allowed');

    return currentDomain.protocol + currentDomain.hostname + currentDomain.startPath + path;
}


if (document.readyState !== 'loading') {
    domainReplacerInit();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        domainReplacerInit();
    });
}

function domainReplacerInit() {
    if (currentDomain === undefined) throw new Error('Domain is not allowed');

    document.body.innerHTML = document.body.innerHTML
        .replaceAll('{{host}}/', currentDomain.hostname + currentDomain.startPath)
        .replaceAll('{{download}}/', currentDomain.downloadAPI + '/')
}