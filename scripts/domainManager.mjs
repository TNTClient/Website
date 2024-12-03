export function getCurrentOrigin() {
    if (window.location.hostname === 'localhost') return window.location.origin + '/TNTClientWebsite/';

    return window.location.origin + '/';
}

export function getDownloadOrigin() {
    if (window.location.hostname === 'tntclient.994799.xyz') return 'https://tntdownload.994799.xyz/';

    return 'https://tntdownload.jeka8833.pp.ua/';
}

export function getCapeOrigin() {
    if (window.location.hostname === 'tntclient.994799.xyz') return 'https://tntgit.994799.xyz/player/';

    return 'https://tntgit.jeka8833.pp.ua/player/';
}

export function getTntServerOrigin() {
    if (window.location.hostname === 'tntclient.994799.xyz') return 'https://tntapi.994799.xyz/';
    if (window.location.hostname === 'localhost') return 'http://localhost:8080/';
    //if (/.+\.tntclientwebsite.pages.dev$/.test(window.location.hostname)) return 'https://tntapi.jeka8833.pp.ua/';

    return 'https://tntapi.jeka8833.pp.ua/';
}