import {readAllCapes} from "./capeLoaderApi.mjs"
import * as userProfile from "../general/userProfile.mjs"

const startAnimationTime = Date.now();

/**
 * @param {string} componentID
 * @returns {HTMLElement}
 * @private
 * */
function getElementAndRegisterListener(componentID) {
    const component = document.getElementById(componentID)

    component.addEventListener("skinRender", e => {
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

/**
 * @param {HTMLElement} component
 * @param {string} cape
 * @param {boolean} isOptifine
 * @returns {SkinRender}
 * @private
 * */
function createSkin(component, cape, isOptifine) {
    const skin = new SkinRender({
        autoResize: true,
        canvas: {
            width: component.offsetWidth,
            height: component.offsetHeight
        },
        controls: {
            pan: false
        },
        camera: {
            x: 0,
            y: 16,
            z: -27,
            target: [0, 16, 0]
        },
    }, component);

    const uuid = userProfile.getUserUUIDWithoutDashes();

    if (cape.startsWith("data:")) {
        skin.render({uuid: uuid, capeData: cape, optifine: isOptifine});
    } else if (cape.startsWith("https://") || cape.startsWith("http://")) {
        skin.render({uuid: uuid, capeUrl: cape, optifine: isOptifine});
    } else {
        skin.render({uuid: uuid});
    }

    return skin;
}

/**
 * @type {HTMLElement}
 * @private
 * */
let optifineCapeElement;
/**
 * @type {HTMLElement}
 * @private
 * */
let tntClientSkinElement;
/**
 * @type {HTMLElement}
 * @private
 * */
let tntClientSkinEditElement;

/**
 * @type {SkinRender}
 * @private
 * */
let optifineCape;
/**
 * @type {SkinRender}
 * @private
 * */
let tntClientSkin;
/**
 * @type {SkinRender}
 * @private
 * */
let tntClientSkinEdit;

$(document).ready(() => {
    optifineCapeElement = getElementAndRegisterListener("skin_default");
    tntClientSkinElement = getElementAndRegisterListener("skin_tntclient");
    tntClientSkinEditElement = getElementAndRegisterListener("skin_tntclient_edit");

    optifineCape = createSkin(optifineCapeElement, "", false);
    tntClientSkin = createSkin(tntClientSkinElement, "", false);
    tntClientSkinEdit = createSkin(tntClientSkinEditElement, "", false);
});

/**
 * @param {CapeClass} cape
 * */
export function setTNTClientCape(cape) {
    $(() => {
        tntClientSkin.dispose();
        tntClientSkin = createSkin(tntClientSkinElement, cape.base64Image, false);
    });
}

/**
 * @param {string} cape
 * */
export function setEditorCape(cape) {
    $(() => {
        tntClientSkinEdit.dispose();
        tntClientSkinEdit = createSkin(tntClientSkinEditElement, cape, false);
    });
}

readAllCapes(userProfile.getUserUUID()).then(value => {
    if (value["optifine"] !== undefined) {
        $(() => {
            optifineCape.dispose();
            optifineCape = createSkin(optifineCapeElement, value["optifine"], true);
        });
    } else if (value["minecraft"] !== undefined) {
        $(() => {
            optifineCape.dispose();
            optifineCape = createSkin(optifineCapeElement, value["minecraft"], false);
        });
    }
});