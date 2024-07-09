let playerSettingsOld = {useTntCape: false, cape: ""};
let playerSettingsNew = {useTntCape: false, cape: ""};
let uploadedCape = undefined;
readSettings();

function updateState(isLoading) {
    if (isLoading) {
        $("#saveSpinner").removeClass("visually-hidden");
    } else {
        $("#saveSpinner").addClass("visually-hidden");
    }
}

function updateSettings(callback) {
    updateState(true);
    updateCape(playerSettingsNew["useTntCape"], playerSettingsNew["cape"], function (isOk) {
        updateState(!isOk);
        if (isOk) {
            resizeCape(playerSettingsNew["cape"], function (image) {
                playerSettingsNew["cape"] = image;
                playerSettingsNew["timeout"] = Date.now();

                playerSettingsOld = Object.assign({}, playerSettingsNew);
                try {
                    localStorage.setItem("config-cape", JSON.stringify(playerSettingsNew));
                } catch (e) {
                    console.error(e);
                }
                callback(isOk)
            });
        } else {
            localStorage.removeItem("config-cape")
            callback(isOk)
        }
    });
}

function readSettings() {
    playerSettingsOld = {useTntCape: false};
    playerSettingsNew = {useTntCape: false};

    const configParsed = JSON.parse(localStorage.getItem("config-cape"));
    if (configParsed != null && configParsed.timeout !== undefined &&
        Date.now() - configParsed.timeout < 5 * 60 * 1000) {
        delete configParsed.timeout;

        playerSettingsOld = Object.assign({}, configParsed);
        playerSettingsNew = Object.assign({}, configParsed);

        changeSelectedTypeOfCape();
    } else {
        localStorage.removeItem("config-cape");

        readUserData(function (data) {
            if (data !== undefined && data["capePriority"] === 2) {
                playerSettingsOld["useTntCape"] = true;
                playerSettingsNew["useTntCape"] = true;
                changeSelectedTypeOfCape();
            }
        });
    }
}

function changeSelectedTypeOfCape() {
    $(function () {
        const vanillaSelectBtn = $("#vanillaSelectBtn");
        const tntClientSelectBtn = $("#tntClientSelectBtn");
        if (playerSettingsNew["useTntCape"]) {
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
    });
}

const startAnimationTime = Date.now();

function getElementAndRegisterListener(componentID) {
    const component = document.getElementById(componentID)

    component.addEventListener("skinRender", function (e) {
        const time = Date.now() - startAnimationTime;
        const movePos = Math.sin(time / 200) / 2

        e.detail.playerModel.children[2].rotation.x = movePos;
        e.detail.playerModel.children[3].rotation.x = -movePos;
        e.detail.playerModel.children[4].rotation.x = movePos;
        e.detail.playerModel.children[5].rotation.x = -movePos;

        if (e.detail.playerModel.children[6] !== undefined) {
            e.detail.playerModel.children[6].rotation.x = (1 + Math.sin(time / 1000)) / 5;
        }
    });
    return component;
}

function createSkin(component, cape, isOptifine) {
    if (isOptifine === undefined) isOptifine = false;

    const skin = new SkinRender({
        autoResize: true, canvas: {
            width: component.offsetWidth, height: component.offsetHeight
        }, controls: {
            pan: false
        }, camera: {
            x: 0, y: 16, z: -27, target: [0, 16, 0]
        },
    }, component);

    if (cape === undefined) {
        skin.render({uuid: userUUID});
    } else if (cape.startsWith("data:")) {
        skin.render({
            uuid: userUUID, capeData: cape, optifine: isOptifine
        });
    } else {
        skin.render({
            uuid: userUUID, capeUrl: cape, optifine: isOptifine
        });
    }
    return skin;
}

function uuidReadCapes(uuid, callback) {
    uuidToName(uuid, function (name) {
        if (name === undefined) {
            callback(undefined);
        } else {
            nameReadCapes(name, callback);
        }
    })
}

function nameReadCapes(name, callback) {
    $.getJSON("https://api.capes.dev/load/" + name, function (data) {
        let outList = {};

        jQuery.each(data, function (key, val) {
            const imageURL = val["imageUrl"];
            if (imageURL === undefined || imageURL === null) return;

            outList[key] = imageURL;
        });
        callback(outList);
    }).fail(function () {
        callback(undefined);
    });
}

function readUserData(callback) {
    $.getJSON(getCapeApiAddress('capeData/' + userUUID + '.json'),
        function (data) {
            callback(data);
        }).fail(function () {
        callback(undefined);
    });
}

function resizeCape(imageBase64, callback) {
    if (imageBase64 === undefined) {
        callback(undefined);
        return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = function () {
        let newWidth = 64;
        let newHeight = 32;
        while ((newWidth < image.width || newHeight < image.height) && newWidth < 1024) {
            newWidth *= 2;
            newHeight *= 2;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.drawImage(image, 0, 0, image.width, image.height);
        callback(canvas.toDataURL());
    };
    image.src = imageBase64;
}

function resizeCapeRaw(imageBase64, callback) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1024;
        canvas.height = 512;

        const blurValue = $("#blur").val()
        ctx.filter = "blur(" + blurValue + "px)";

        if (2 * image.height > 3 * image.width) {
            ctx.drawImage(image,
                0, (2 * image.width) / 27, image.width, (32 * image.width) / 27,
                0, 16, 192, 256);  // Left Front Right
            ctx.drawImage(image,
                image.width / 12, 0, (5 * image.width) / 6, (2 * image.width) / 27,
                16, 0, 160, 16);  // Top

            ctx.save();
            ctx.scale(1, -1);
            ctx.drawImage(image,
                image.width / 12, (34 * image.width) / 27, (5 * image.width) / 6, (2 * image.width) / 27,
                176, -0, 160, -16);  // Bottom
            ctx.restore();

            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(image,
                image.width / 12, (2 * image.width) / 27, (5 * image.width) / 6, (32 * image.width) / 27,
                -192, 16, -160, 256);  // Back
            ctx.restore();
        } else {
            ctx.drawImage(image,
                0, image.height / 18, (2 * image.height) / 3, (8 * image.height) / 9,
                0, 16, 192, 256);  // Left Front Right
            ctx.drawImage(image,
                image.height / 16, 0, (5 * image.height) / 9, image.height / 18,
                16, 0, 160, 16);  // Top

            ctx.save();
            ctx.scale(1, -1);
            ctx.drawImage(image,
                image.height / 16, (17 * image.height) / 18, (5 * image.height) / 9, image.height / 18,
                176, -0, 160, -16);  // Bottom
            ctx.restore();

            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(image,
                image.height / 16, image.height / 18, (5 * image.height) / 9, (8 * image.height) / 9,
                -192, 16, -160, 256);  // Back
            ctx.restore();
        }

        callback(canvas.toDataURL());
    };
    image.src = imageBase64;
}

$(function () {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    const vanillaSelectBtn = $("#vanillaSelectBtn");
    const tntClientSelectBtn = $("#tntClientSelectBtn");
    const saveToast = $("#saveToast");
    const editSaveBtn = $("#editSave");

    let allowEdit = false;
    isTntCape(function (state) {
        if (state) {
            allowEdit = true;
            tntClientSelectBtn.removeClass("disabled");
            $("#buyCape1").tooltip('dispose')
            $("#buyCape2").tooltip('dispose')
        }
        changeEditCape();
    });

    $("#fromInternet").change(function () {
        updateBlurText();
        window.dispatchEvent(new Event('resize'));
        updateUploadedSkin();
    });

    $(document).on('input', '#blur', function () {
        updateBlurText();
    });

    $(document).on('change', '#blur', function () {
        updateBlurText();
        updateUploadedSkin();
    });

    function updateBlurText() {
        if ($("#fromInternet").is(':checked')) {
            $("#blurBox").removeClass("visually-hidden");
        } else {
            $("#blurBox").addClass("visually-hidden");
        }

        const blurValue = $("#blur").val()
        $("#blurText").text("Image blur value ( " + Math.round(blurValue * 100) + "% ):");
    }

    updateBlurText();

    function checkChanges() {
        const hasChanges = !(playerSettingsNew["useTntCape"] === playerSettingsOld["useTntCape"] &&
            playerSettingsNew["cape"] === playerSettingsOld["cape"]);
        if (hasChanges) {
            saveToast.addClass("show");
        } else {
            saveToast.removeClass("show");
        }

        changeEditCape(uploadedCape);
    }

    const myCollapse = document.getElementById("capeSettings");
    const myCollapseSetup = new bootstrap.Collapse(myCollapse, {toggle: false});
    const capeSettingsBtn = $("#capeSettingsBtn");
    myCollapse.addEventListener("hide.bs.collapse", function () {
        capeSettingsBtn.removeClass("btn-success");
        capeSettingsBtn.addClass("btn-primary");
    });
    myCollapse.addEventListener("show.bs.collapse", function () {
        capeSettingsBtn.addClass("btn-success");
        capeSettingsBtn.removeClass("btn-primary");
    });
    myCollapse.addEventListener("shown.bs.collapse", function () {
        window.dispatchEvent(new Event('resize'));
    });

    function changeEditCape(cape) {
        uploadedCape = cape;

        if (!allowEdit || cape === playerSettingsNew["cape"]) {
            editSaveBtn.addClass("disabled");
        } else {
            editSaveBtn.removeClass("disabled");
        }
    }

    editSaveBtn.click(function () {
        playerSettingsNew["cape"] = uploadedCape;
        changeEditCape(uploadedCape);

        myCollapseSetup.hide();

        tntClientSkin.reset();
        tntClientSkin = createSkin(tntClientSkinElement, uploadedCape, false);

        checkChanges();
    });

    $("#saveChanges").click(function () {
        updateSettings(function () {
            updateDefaultUserSkin();
            checkChanges();
        });
    });
    $("#discardChanges").click(function () {
        readSettings();
        updateDefaultUserSkin();
        checkChanges();
    });

    vanillaSelectBtn.click(function () {
        updateSelectedTypeOfCape(false);
    });
    tntClientSelectBtn.click(function () {
        updateSelectedTypeOfCape(true);
    });

    function updateSelectedTypeOfCape(isTntClient) {
        playerSettingsNew["useTntCape"] = isTntClient;

        changeSelectedTypeOfCape();
        checkChanges();
    }

    let uploadedFile = undefined;
    const capeFileElement = document.getElementById("capeFile");
    capeFileElement.addEventListener("change", function () {
        const reader = new FileReader();
        reader.readAsDataURL(capeFileElement.files[0]);
        reader.onload = function (e) {
            uploadedFile = e.target.result;
            updateUploadedSkin();
        };
    });

    function updateUploadedSkin() {
        if (uploadedFile === undefined) return;

        if (document.getElementById('fromInternet').checked) {
            resizeCapeRaw(uploadedFile, function (image) {
                changeEditCape(image);
                tntClientSkinEdit.reset();
                tntClientSkinEdit = createSkin(tntClientSkinEditElement, image, false);
            });
        } else {
            resizeCape(uploadedFile, function (image) {
                changeEditCape(image);
                tntClientSkinEdit.reset();
                tntClientSkinEdit = createSkin(tntClientSkinEditElement, image, false);
            });
        }
    }

    const defaultSkinElement = getElementAndRegisterListener("skin_default");
    const tntClientSkinElement = getElementAndRegisterListener("skin_tntclient");
    const tntClientSkinEditElement = getElementAndRegisterListener("skin_tntclient_edit");

    let defaultSkin = createSkin(defaultSkinElement);
    let tntClientSkin = createSkin(tntClientSkinElement);
    let tntClientSkinEdit = createSkin(tntClientSkinEditElement);
    updateDefaultUserSkin();


    function updateDefaultUserSkin() {
        uuidReadCapes(userUUID, function (cape) {
            if (cape === undefined) return;

            if (cape["optifine"] !== undefined) {
                defaultSkin.reset();
                defaultSkin = createSkin(defaultSkinElement, cape["optifine"], true);
            } else if (cape["minecraft"] !== undefined) {
                defaultSkin.reset();
                defaultSkin = createSkin(defaultSkinElement, cape["minecraft"], false);
            }
        });

        if (playerSettingsOld["cape"] !== undefined) {
            const capeData = playerSettingsOld["cape"];

            tntClientSkin.reset();
            tntClientSkin = createSkin(tntClientSkinElement, capeData, false);

            tntClientSkinEdit.reset();
            tntClientSkinEdit = createSkin(tntClientSkinEditElement, capeData, false);
        } else {
            readUserData(function (data) {
                if (data === undefined) {
                    tntClientSkin.reset();
                    tntClientSkin = createSkin(tntClientSkinElement);

                    tntClientSkinEdit.reset();
                    tntClientSkinEdit = createSkin(tntClientSkinEditElement);
                } else {
                    const capeUrl = getCapeApiAddress('capes/' + userUUID + '.png');

                    resizeCape(capeUrl, function (image) {
                        tntClientSkin.reset();
                        tntClientSkin = createSkin(tntClientSkinElement, image, false);

                        tntClientSkinEdit.reset();
                        tntClientSkinEdit = createSkin(tntClientSkinEditElement, image, false);
                    });
                }
            });
        }
    }

    const capeType = document.getElementById("capeType");
    const capeTypeDownloadBtn = $("#capeTypeDownload");
    capeType.setAttribute("disabled", "");
    capeTypeDownloadBtn.addClass("disabled");

    capeType.addEventListener("change", (event) => {
        if (event.target.value === "none") {
            changeEditCape(undefined);

            readUserData(function (data) {
                if (data === undefined) {
                    tntClientSkinEdit.reset();
                    tntClientSkinEdit = createSkin(tntClientSkinEditElement);
                } else {
                    const capeUrl = getCapeApiAddress('capes/' + userUUID + '.png');

                    resizeCape(capeUrl, function (image) {
                        tntClientSkinEdit.reset();
                        tntClientSkinEdit = createSkin(tntClientSkinEditElement, image, false);
                    });
                }
            });

            capeTypeDownloadBtn.removeAttr("href");
        } else {
            resizeCape(event.target.value, function (image) {
                changeEditCape(image);
                tntClientSkinEdit.reset();
                tntClientSkinEdit = createSkin(tntClientSkinEditElement, image, false);
            });
            capeTypeDownloadBtn.attr("href", event.target.value);
        }
    });

    $("#requestPlayerInfo").click(function () {
        const name = $("#playerNameField").val();
        nameReadCapes(name, function (capes) {
            if (capes === undefined || capes.length <= 0) {
                capeType.setAttribute("disabled", "");
                capeTypeDownloadBtn.addClass("disabled");
            } else {
                capeTypeDownloadBtn.removeClass("disabled");
                capeTypeDownloadBtn.removeAttr("href");

                capeType.removeAttribute("disabled");
                capeType.innerHTML = "";

                const optionNone = document.createElement("option");
                optionNone.value = "none"
                optionNone.innerHTML = "None";
                capeType.add(optionNone);

                for (const k in capes) {
                    const option = document.createElement("option");
                    option.value = capes[k];
                    option.innerHTML = k;
                    capeType.add(option);
                }
            }
        })
    });
});