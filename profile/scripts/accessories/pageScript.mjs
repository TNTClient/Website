import * as elementController from "./elementList.mjs";

/**
 * @type {bootstrap.Tooltip[]|null}
 * */
let lastTooltips = null;

/**
 * @param {string} accessoryKey
 * @returns void
 * */
window.addAccessory = (accessoryKey) => {
    elementController.selectedAccessoryKeys.add(accessoryKey);

    accessoriesUpdate();
}

/**
 * @param {string} accessoryKey
 * @returns void
 * */
window.removeAccessory = (accessoryKey) => {
    elementController.selectedAccessoryKeys.delete(accessoryKey);

    accessoriesUpdate();
}

/**
 * @param {string} accessoryKey
 * @returns void
 * */
window.downloadAccessory = (accessoryKey) => {
    elementController.downloadAccessory(accessoryKey)
}

function accessoriesUpdate() {
    const searchBar = document.getElementById('availableAccessoriesSearch');

    elementController.drawSelectedAccessories(document.getElementById('selectedAccessories'));
    elementController.drawAvailableAccessories(document.getElementById('availableAccessories'),
        searchBar.value, true);

    updateTooltips();
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

$(document).ready(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    const searchBar = document.getElementById('availableAccessoriesSearch');
    searchBar.addEventListener('input', () => {
        elementController.drawAvailableAccessories(document.getElementById('availableAccessories'), searchBar.value, false);
        updateTooltips();
    });

    accessoriesUpdate();
});
