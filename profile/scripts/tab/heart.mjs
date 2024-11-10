import * as tntclientEndpoint from "../general/tntclientWebEndpoints.mjs";
import * as userProfile from "../general/userProfile.mjs";
import * as cacheStorage from "../general/tempCacheStorage.mjs";
import * as playerStorage from "../general/playerStorage.mjs";
import * as colorConvertor from "./colorConvertor.mjs";

let userName = "Incognito";
userProfile.getPlayerName().then(name => {
    userName = name;
});

$(() => {
    const textElement = document.getElementById("text");
    const speedDividerElement = document.getElementById("speedDivider");
    const speedDividerTextElement = document.getElementById("speedDividerText");
    const resultFieldElement = document.getElementById("resultField");
    const openSaveWindowElement = $("#openSaveWindow");
    const saveBtnElement = $("#saveButton");
    const pauseButtonElement = $("#pause");
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    speedDividerElement.addEventListener("input", speedDividerTextUpdate);
    speedDividerElement.addEventListener("change", speedDividerTextUpdate);
    speedDividerTextUpdate();

    let allowEdit = false;
    userProfile.hasTabPrivilege().then(hasPrivilege => {
        if (!hasPrivilege) return;

        allowEdit = true;
        $("#buyHeart1").tooltip('dispose')
        $("#buyHeart2").tooltip('dispose')
        saveBtnElement.removeClass("disabled");
    })

    function speedDividerTextUpdate() {
        speedDividerTextElement.textContent = "Animation Delay (" + speedDividerElement.value + "ms):";
    }

    let isPaused = false;
    pauseButtonElement.click(() => {
        isPaused = !isPaused;

        if (isPaused) {
            pauseButtonElement.removeClass("btn-success");
            pauseButtonElement.addClass("btn-secondary");
            pauseButtonElement.text("Paused");
        } else {
            pauseButtonElement.addClass("btn-success");
            pauseButtonElement.removeClass("btn-secondary");
            pauseButtonElement.text("Playing");
        }
    });

    $('.tools button').click(function () {
        const caretPos = textElement.selectionStart;
        const textAreaTxt = textElement.value;
        const txtToAdd = '§' + $(this).attr('data-color');
        textElement.value = textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos);
        textElement.selectionStart = caretPos + 2;
        textElement.selectionEnd = caretPos + 2;
        textElement.focus();
    });

    saveBtnElement.click(() => {
        $('#saveSpinner').removeClass("visually-hidden");

        const animationText = textElement.value.split(/\r?\n/);
        const animationTime = speedDividerElement.value;

        tntclientEndpoint.updateTab(animationText, animationTime)
            .then(() => {
                $('#saveAgree').modal('hide');

                cacheStorage.setCachedValue("heart", {
                    textAnimation: animationText, timeShift: animationTime,
                });
            })
            .finally(() => {
                $('#saveSpinner').addClass("visually-hidden");
            });
    });

    setInterval(() => {
        if (isPaused) return;

        const lines = textElement.value.split(/\r?\n/);

        checkLimit(lines)

        const animationText = lines[Math.floor(Date.now() / speedDividerElement.value) % lines.length] +
            "&r" + userName;

        resultFieldElement.innerHTML = colorConvertor.toHTMLColor(animationText);
    }, 100);

    function checkLimit(lines) {
        let case1 = false;
        let case2 = false;
        const case3 = lines.length > 16;
        for (const line of lines) {
            if (line.length > 64) case1 = true;
            if (colorConvertor.stripColor(line).length > 8) case2 = true;

            if (case1 && case2) break;
        }

        if (case1) {
            $("#maxCharactersWarning").removeClass("visually-hidden");
        } else {
            $("#maxCharactersWarning").addClass("visually-hidden");
        }
        if (case2) {
            $("#maxCharacters2Warning").removeClass("visually-hidden");
        } else {
            $("#maxCharacters2Warning").addClass("visually-hidden");
        }
        if (case3) {
            $("#maxAnimationWarning").removeClass("visually-hidden");
        } else {
            $("#maxAnimationWarning").addClass("visually-hidden");
        }

        const warning = case1 || case2 || case3 || !allowEdit;
        if (warning) {
            openSaveWindowElement.addClass("disabled");
        } else {
            openSaveWindowElement.removeClass("disabled");
        }
    }

    setCurrentProfileData();

    function setCurrentProfileData() {
        const cached = cacheStorage.getCachedValue("heart");
        if (cached !== null) {
            const delayMs = cached.timeShift;
            if (typeof delayMs === "number") {
                speedDividerElement.value = delayMs;
            }

            const animation = cached.textAnimation;
            if (Array.isArray(animation)) {
                textElement.value = animation.join('\n');
            }
        } else {
            playerStorage.getPlayerConfig()
                .then(data => {
                    if (data['heartAnimation'] === undefined) return;

                    const delayMs = data['heartAnimation']['timeShift'];
                    if (typeof delayMs === "number") {
                        speedDividerElement.value = delayMs;
                    }

                    const animation = data['heartAnimation']['textAnimation'];
                    if (Array.isArray(animation)) {
                        const tempArr = [];
                        for (let anim of animation) {
                            while (anim.endsWith('&r') || anim.endsWith('&R') ||
                            anim.endsWith('\u00A7r') || anim.endsWith('\u00A7R')) {
                                anim = anim.substring(0, anim.length - 2);
                            }
                            tempArr.push(anim);
                        }

                        textElement.value = tempArr.join('\n');
                    }
                });
        }
    }
})