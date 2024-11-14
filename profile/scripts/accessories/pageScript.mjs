import * as elementList from "./elementList.mjs";
import * as accessoriesApi from "./accessoriesApi.mjs";
import * as userProfile from "../general/userProfile.mjs";

/**
 * @type {Set<string>}
 * */
const defaultSelected = new Set();

/**
 * @type {bootstrap.Tooltip[]|null}
 * */
let lastTooltips = null;

let hasPrivileges = false;

/**
 * @param {string} accessoryKey
 * @returns void
 * */
window.addAccessory = (accessoryKey) => {
    elementList.selectedAccessoryKeys.add(accessoryKey);

    accessoriesUpdate();
}

/**
 * @param {string} accessoryKey
 * @returns void
 * */
window.removeAccessory = (accessoryKey) => {
    elementList.selectedAccessoryKeys.delete(accessoryKey);

    accessoriesUpdate();
}

/**
 * @param {string} accessoryKey
 * @returns void
 * */
window.downloadAccessory = (accessoryKey) => {
    elementList.downloadAccessory(accessoryKey)
}

function accessoriesUpdate() {
    const searchBar = document.getElementById('availableAccessoriesSearch');

    elementList.drawSelectedAccessories(document.getElementById('selectedAccessories'));
    elementList.drawAvailableAccessories(document.getElementById('availableAccessories'),
        searchBar.value, hasPrivileges);

    updateTooltips();

    const selectedAccessoriesContainer = document.getElementById('selectedAccessoriesContainer');
    if (elementList.selectedAccessoryKeys.size === 0) {
        selectedAccessoriesContainer.classList.add('d-none');
    } else {
        selectedAccessoriesContainer.classList.remove('d-none');
    }

    const saveToast = document.getElementById('saveToast');
    if (hasPrivileges && isChanged()) {
        saveToast.classList.add('show');
    } else {
        saveToast.classList.remove('show');
    }
}

function updateTooltips() {
    if (lastTooltips !== null) {
        for (const tooltip of lastTooltips) {
            tooltip.disable();
            tooltip.dispose();
        }
    }

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    lastTooltips = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

/**
 * @returns {boolean}
 * */
function isChanged() {
    return !(defaultSelected.size === elementList.selectedAccessoryKeys.size &&
        [...defaultSelected].every((x) => elementList.selectedAccessoryKeys.has(x)));
}

accessoriesApi.readAccessories().then(value => {
    defaultSelected.clear();
    elementList.selectedAccessoryKeys.clear();

    for (const key of value) {
        defaultSelected.add(key);
        elementList.selectedAccessoryKeys.add(key);
    }

    accessoriesUpdate();
})

userProfile.hasAccessoryPrivilege().then(value => {
    if (!value) return;

    hasPrivileges = true;
    accessoriesUpdate();
})

$(document).ready(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    const searchBar = document.getElementById('availableAccessoriesSearch');
    searchBar.addEventListener('input', () => {
        elementList.drawAvailableAccessories(document.getElementById('availableAccessories'),
            searchBar.value, hasPrivileges);
        updateTooltips();
    });

    accessoriesUpdate();


    const saveChangesBtn = document.getElementById('saveChanges');
    const saveSpinner = document.getElementById('saveSpinner');
    const discardChangesBtn = document.getElementById('discardChanges');

    saveChangesBtn.addEventListener('click', () => {
        saveSpinner.classList.remove('visually-hidden');
        saveChangesBtn.setAttribute('disabled', '');

        accessoriesApi.sendSelectedAccessories(Array.from(elementList.selectedAccessoryKeys)).then(() => {
            defaultSelected.clear();
            for (const key of elementList.selectedAccessoryKeys) {
                defaultSelected.add(key);
            }

            accessoriesUpdate();
        }).finally(() => {
            saveSpinner.classList.add('visually-hidden');
            saveChangesBtn.removeAttribute('disabled');
        });
    });

    discardChangesBtn.addEventListener('click', () => {
        elementList.selectedAccessoryKeys.clear();

        for (const key of defaultSelected) {
            elementList.selectedAccessoryKeys.add(key);
        }

        accessoriesUpdate();
    });
});
