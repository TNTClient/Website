const DOWNLOAD_LIST = [
    {id: "#OfflineInstaller", launcher: [1]},
    {id: "#OnlineInstaller", launcher: [1]},
    {id: "#InstallerJava", launcher: [1], os: [1]},
    {id: "#MultiMCUniversal", launcher: [2]}
]

function showDownload() {
    const launcher = Number($("#type").val());
    const os = Number($("#system").val());
    const architecture = Number($("#architecture").val());

    const params = new URL(window.location.href);
    if (launcher !== 0)
        params.searchParams.set("launcher", launcher);
    else
        params.searchParams.delete("launcher");

    if (os !== 0)
        params.searchParams.set("os", os);
    else
        params.searchParams.delete("os");

    if (architecture !== 0)
        params.searchParams.set("architecture", architecture);
    else
        params.searchParams.delete("architecture");

    window.history.pushState("", "", params.toString());

    for (let download of DOWNLOAD_LIST) {
        if ((launcher === 0 || download.launcher === undefined || download.launcher.includes(launcher)) &&
            (os === 0 || download.os === undefined || download.os.includes(os)) &&
            (architecture === 0 || download.architecture === undefined || download.architecture.includes(architecture))
        ) {
            $(download.id).show();
        } else {
            $(download.id).hide();
        }
    }
}

function validateAndTrySetInt(id, value, min, max) {
    if (value === undefined || value === null || !isFinite(value)) return false;

    const num = Number(value);
    if (isNaN(num) || num < min || num > max) return false;

    $(id).val(num);

    return true;
}

$(document).ready(function () {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    new ClipboardJS('.copy');

    let valueSet = false;
    const params = new URL(window.location.href);
    if (validateAndTrySetInt("#type", params.searchParams.get("launcher"), 0, 2) === true) {
        valueSet = true;
    }
    if (validateAndTrySetInt("#system", params.searchParams.get("os"), 0, 2) === true) {
        valueSet = true;
    }
    if (validateAndTrySetInt("#architecture", params.searchParams.get("architecture"), 0, 2) === true) {
        valueSet = true;
    }

    if (valueSet && params.searchParams.has("help")) {
        $('html, body').animate({
            scrollTop: $("#download").offset().top
        }, 2000);
    }

    showDownload();
})