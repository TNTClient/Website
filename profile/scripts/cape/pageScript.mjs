import * as capeLoader from "./capeLoaderApi.mjs";
import * as capeResizer from "./capeResizer.mjs";
import * as skin from "./skinController.mjs";
import * as tntclientEndpoint from "../general/tntclientWebEndpoints.mjs";
import * as userProfile from "../general/userProfile.mjs";
import {CapeClass} from "./capeClass.mjs";

let defaultCape = await capeLoader.getCurrentCape();
let needSendCape = defaultCape;
let uploadedCape = "";
let filteredCape = defaultCape.base64Image;

skin.setTNTClientCape(defaultCape);
skin.setEditorCape(defaultCape.base64Image);

/**
 * @returns {Promise<void>}
 * @private
 * */
function sendCape() {
    if (defaultCape.equals(needSendCape)) return Promise.resolve();

    const capeData = defaultCape.base64Image === needSendCape.base64Image ?
        undefined : needSendCape.base64Image;

    return tntclientEndpoint.updateCape(capeData, needSendCape.isActive)
        .then(() => {
            defaultCape = needSendCape;

            capeLoader.saveCachedCape(needSendCape);
        });
}

$(document).ready(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    const vanillaSelectBtn = $("#vanillaSelectBtn");
    const tntClientSelectBtn = $("#tntClientSelectBtn");
    const saveToast = $("#saveToast");
    const editSaveBtn = $("#editSave");

    let allowEdit = false;

    function updateButtonStatus() {
        if (!allowEdit) return;

        if (defaultCape.equals(needSendCape)) {
            saveToast.removeClass("show");
        } else {
            saveToast.addClass("show");
        }

        if (filteredCape === needSendCape.base64Image) {
            editSaveBtn.addClass("disabled");
        } else {
            editSaveBtn.removeClass("disabled");
        }

        if (needSendCape.isActive) {
            tntClientSelectBtn.addClass("btn-success");
            tntClientSelectBtn.removeClass("btn-primary");
            vanillaSelectBtn.removeClass("btn-success");
            vanillaSelectBtn.addClass("btn-primary");
        } else {
            tntClientSelectBtn.removeClass("btn-success");
            tntClientSelectBtn.addClass("btn-primary");
            vanillaSelectBtn.addClass("btn-success");
            vanillaSelectBtn.addClass("btn-primary");
        }
    }

    userProfile.hasCapePrivilege().then(hasPrivilege => {
        if (!hasPrivilege) return;

        allowEdit = true;
        tntClientSelectBtn.removeClass("disabled");
        $("#buyCape1").tooltip('dispose')
        $("#buyCape2").tooltip('dispose')

        updateButtonStatus();
    });

    $("#fromInternet").change(() => {
        updateBlurText();
        window.dispatchEvent(new Event('resize'));
        updateUploadedCape();
    });

    $(document).on('input', '#blur', () => {
        updateBlurText();
    });

    $(document).on('change', '#blur', () => {
        updateBlurText();
        updateUploadedCape();
    });

    updateBlurText();

    function updateBlurText() {
        if ($("#fromInternet").is(':checked')) {
            $("#blurBox").removeClass("visually-hidden");
        } else {
            $("#blurBox").addClass("visually-hidden");
        }

        const blurValue = Number($("#blur").val());
        $("#blurText").text("Image blur value ( " + Math.round(blurValue * 100) + "% ):");
    }

    const myCollapse = document.getElementById("capeSettings");
    const myCollapseSetup = new bootstrap.Collapse(myCollapse, {toggle: false});
    const capeSettingsBtn = $("#capeSettingsBtn");
    myCollapse.addEventListener("hide.bs.collapse", () => {
        capeSettingsBtn.removeClass("btn-success");
        capeSettingsBtn.addClass("btn-primary");
    });
    myCollapse.addEventListener("show.bs.collapse", () => {
        capeSettingsBtn.addClass("btn-success");
        capeSettingsBtn.removeClass("btn-primary");
    });

    myCollapse.addEventListener("shown.bs.collapse", () => {
        window.dispatchEvent(new Event('resize'));
    });

    editSaveBtn.click(() => {
        myCollapseSetup.hide();

        needSendCape = new CapeClass(filteredCape, needSendCape.isActive);
        skin.setTNTClientCape(needSendCape);

        updateButtonStatus();
    });

    $("#saveChanges").click(() => {
        $("#saveSpinner").removeClass("visually-hidden");

        sendCape().finally(() => {
            updateButtonStatus();

            $("#saveSpinner").addClass("visually-hidden");
        });
    });

    $("#discardChanges").click(() => {
        needSendCape = defaultCape;
        uploadedCape = "";
        filteredCape = defaultCape.base64Image;

        skin.setEditorCape(defaultCape.base64Image);
        skin.setTNTClientCape(needSendCape);

        updateButtonStatus();
    });

    vanillaSelectBtn.click(() => {
        needSendCape = new CapeClass(needSendCape.base64Image, false);

        updateButtonStatus();
    });

    tntClientSelectBtn.click(() => {
        needSendCape = new CapeClass(needSendCape.base64Image, true);

        updateButtonStatus();
    });

    const capeFileElement = document.getElementById("capeFile");
    capeFileElement.addEventListener("change", () => {
        const reader = new FileReader();
        reader.readAsDataURL(capeFileElement.files[0]);

        reader.onload = (e) => {
            uploadedCape = e.target.result;

            updateUploadedCape();
        };
    });

    /**
     * @param {string} cape
     * @returns {void}
     * */
    function setEditorCape(cape) {
        capeResizer.normalizeCapeSize(cape).then(image => {
            filteredCape = image;

            skin.setEditorCape(image);

            updateButtonStatus();
        });
    }

    function updateUploadedCape() {
        if (uploadedCape.length === 0) return;

        if (document.getElementById('fromInternet').checked) {
            const blurValue = Number($("#blur").val());

            capeResizer.repackCape(uploadedCape, blurValue).then(image => {
                setEditorCape(image);
            });
        } else {
            setEditorCape(uploadedCape);
        }
    }

    const capeType = document.getElementById("capeType");
    capeType.setAttribute("disabled", "");

    const capeTypeDownloadBtn = $("#capeTypeDownload");
    capeTypeDownloadBtn.addClass("disabled");

    // Cloning from other skins - choose event
    capeType.addEventListener("change", (event) => {
        if (event.target.value === "none") {
            setEditorCape(defaultCape.base64Image);

            capeTypeDownloadBtn.removeAttr("href");
        } else {
            setEditorCape(event.target.value);

            capeTypeDownloadBtn.attr("href", event.target.value);
        }
    });

    // Cloning from other skins - get button
    $("#requestPlayerInfo").click(() => {
        capeTypeDownloadBtn.removeAttr("href");
        capeTypeDownloadBtn.addClass("disabled");
        capeTypeDownloadBtn.removeClass("btn-success");
        capeTypeDownloadBtn.addClass("btn-primary");

        const optionNone = document.createElement("option");
        optionNone.value = "none"
        optionNone.innerHTML = "None";

        capeType.setAttribute("disabled", "");
        capeType.innerHTML = "";
        capeType.add(optionNone);

        const name = $("#playerNameField").val();

        capeLoader.readAllCapes(name).then(capes => {
            if (capes.length <= 0) return;

            capeType.removeAttribute("disabled");

            capeTypeDownloadBtn.removeClass("disabled");
            capeTypeDownloadBtn.addClass("btn-success");
            capeTypeDownloadBtn.removeClass("btn-primary");

            for (const k in capes) {
                const option = document.createElement("option");
                option.value = capes[k];
                option.innerHTML = k;

                capeType.add(option);
            }
        });
    });
});