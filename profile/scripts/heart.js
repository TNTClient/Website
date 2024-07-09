const randomText = "ÀÁÂÈÊËÍÓÔÕÚßãõğİıŒœŞşŴŵžȇ        !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αβΓπΣσμτΦΘΩδ∞∅∈∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";
const colorChars = "0123456789abcdef"

let savedConfig = {textAnimation: ["&a❤"], timeShift: 1000};

$(document).ready(function() {
    const textElement = document.getElementById("text");
    const speedDividerElement = document.getElementById("speedDivider");
    const speedDividerTextElement = document.getElementById("speedDividerText");
    const resultFieldElement = document.getElementById("resultField");
    const openSaveWindowElement = $("#openSaveWindow");
    const saveBtnElement = $("#saveButton");
    const pauseButtonElement = $("#pause");
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    speedDividerElement.addEventListener("input", speedDividerTextUpdate);
    speedDividerElement.addEventListener("change", speedDividerTextUpdate);
    speedDividerTextUpdate();

    let allowEdit = false;
    isTntHeart(function (state) {
        if (state) {
            allowEdit = true;
            $("#buyHeart1").tooltip('dispose')
            $("#buyHeart2").tooltip('dispose')
            saveBtnElement.removeClass("disabled");
        }
    });

    function speedDividerTextUpdate() {
        speedDividerTextElement.textContent = "Animation Delay (" + speedDividerElement.value + "ms):";
    }

    let pauseTime = 0;
    pauseButtonElement.click(function (e) {
        if (pauseTime === 0) {
            pauseTime = Date.now();

            pauseButtonElement.removeClass("btn-success");
            pauseButtonElement.addClass("btn-secondary");
            pauseButtonElement.text("Paused");
        } else {
            pauseTime = 0;

            pauseButtonElement.addClass("btn-success");
            pauseButtonElement.removeClass("btn-secondary");
            pauseButtonElement.text("Playing");
        }
    });

    $('.tools button').click(function (e) {
        const caretPos = textElement.selectionStart;
        const textAreaTxt = textElement.value;
        const txtToAdd = '&' + $(this).attr('data-color');
        textElement.value = textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos);
        textElement.selectionStart = caretPos + 2;
        textElement.selectionEnd = caretPos + 2;
        textElement.focus();
    });

    let isResetClick = false;
    openSaveWindowElement.click(function (e) {
        isResetClick = false;
    });
    $("#resetAndSave").click(function (e) {
        isResetClick = true;
    });

    saveBtnElement.click(function (e) {
        $('#saveSpinner').removeClass("visually-hidden");
        updateHeart(isResetClick ? ["&a❤"] : textElement.value.split(/\r?\n/),
            isResetClick ? 1000 : speedDividerElement.value, function (isSuccess) {
                $('#saveSpinner').addClass("visually-hidden");

                if (isSuccess) {
                    $('#saveAgree').modal('hide');
                    if (isResetClick) {
                        textElement.value = "&a❤";
                    }
                    savedConfig = {
                        textAnimation: textElement.value.split(/\r?\n/), timeShift: 1000,
                        timeout: Date.now() + 5 * 60 * 1000
                    };
                    try {
                        localStorage.setItem("config-heart", JSON.stringify(savedConfig));
                    } catch (e) {
                        console.error(e);
                    }
                    updateTextarea();
                }
            });
    });

    let userName = "Incognito";
    uuidToName(userUUID, function (name) {
        if (name !== undefined) userName = name;
    });

    setInterval(function () {
        const lines = textElement.value.split(/\r?\n/);

        updateBlock(lines)

        const time = pauseTime === 0 ? Date.now() : pauseTime;

        renderText(resultFieldElement, lines[Math.floor(time / speedDividerElement.value) % lines.length] +
            "&r" + userName);

    }, 100);

    function updateBlock(lines) {
        let case1 = false;
        let case2 = false;
        const case3 = lines.length > 16;
        for (const line of lines) {
            if (line.length > 64) case1 = true;
            if (line.replace(/[§&][0-9A-FK-ORa-fk-o]/gi, "").length > 8) case2 = true;

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

    updateTextarea();

    function updateTextarea() {
        const configParsed = JSON.parse(localStorage.getItem("config-heart"));
        if (configParsed != null && configParsed.timeout !== undefined && Date.now() < configParsed.timeout) {
            delete configParsed.timeout;

            savedConfig = Object.assign({}, configParsed);

            speedDividerElement.value = savedConfig.timeShift;

            let tempArr = []
            for (const anim of savedConfig.textAnimation) {
                let formatted = anim;
                while (formatted.endsWith('&r') || formatted.endsWith('&R') ||
                formatted.endsWith('\u00A7r') || formatted.endsWith('\u00A7R')) {
                    formatted = formatted.substring(0, formatted.length - 2)
                }
                tempArr.push(formatted)
            }
            textElement.value = tempArr.join('\n');
        } else {
            localStorage.removeItem("config-heart");

            readUserData(function (data) {
                if (data !== undefined && data['heartAnimation'] !== undefined) {
                    if (data['heartAnimation']['textAnimation'] !== undefined) {
                        savedConfig.textAnimation = data['heartAnimation']['textAnimation'];
                    }
                    if (data['heartAnimation']['timeShift'] !== undefined) {
                        savedConfig.timeShift = data['heartAnimation']['timeShift'];
                    }
                }

                speedDividerElement.value = savedConfig.timeShift;

                let tempArr = []
                for (const anim of savedConfig.textAnimation) {
                    let formatted = anim;
                    while (formatted.endsWith('&r') || formatted.endsWith('&R') ||
                    formatted.endsWith('\u00A7r') || formatted.endsWith('\u00A7R')) {
                        formatted = formatted.substring(0, formatted.length - 2)
                    }
                    tempArr.push(formatted)
                }
                textElement.value = tempArr.join('\n');
            });
        }
    }
})

function readUserData(callback) {
    $.getJSON(getCapeApiAddress('capeData/' + userUUID + '.json'),
        function (data) {
            callback(data);
        }).fail(function () {
        callback(undefined);
    });
}

function renderText(componentID, text) {
    let outText = "";

    let simpleText = false;

    let randomStyle = false;
    let boldStyle = false;
    let strikethroughStyle = false;
    let underlineStyle = false;
    let italicStyle = false;

    for (let i = 0; i < text.length; i++) {
        const firstChar = text.charAt(i);
        if (i < text.length - 1) {
            const firstCharLow = firstChar.toLowerCase();
            if (firstCharLow === '&' || firstCharLow === '\u00a7') {
                const secondChar = text.charAt(i + 1).toLowerCase();
                const isColour = colorChars.indexOf(secondChar) > -1;
                if (isColour || secondChar === 'r') {
                    if (simpleText) {
                        simpleText = false;

                        outText += "</span>";
                    }
                    if (boldStyle) {
                        boldStyle = false;

                        outText += "</strong>";
                    }
                    if (underlineStyle) {
                        underlineStyle = false;

                        outText += "</u>";
                    }
                    if (italicStyle) {
                        italicStyle = false;

                        outText += "</i>";
                    }
                    if (strikethroughStyle) {
                        strikethroughStyle = false;

                        outText += "</s>";
                    }
                    if (randomStyle) {
                        randomStyle = false;

                        outText += "</span>";
                    }

                    if (isColour) {
                        outText += "<span class='mine-" + secondChar + "'>";
                        simpleText = true;
                    }

                    i++;
                    continue;
                } else if (secondChar === 'l') {
                    if (boldStyle) {
                        i++;
                        continue;
                    }
                    boldStyle = true;

                    outText += "<strong>";

                    i++;
                    continue;
                } else if (secondChar === 'n') {
                    if (underlineStyle) {
                        i++;
                        continue;
                    }
                    underlineStyle = true;

                    outText += "<u>";

                    i++;
                    continue;
                } else if (secondChar === 'o') {
                    if (italicStyle) {
                        i++;
                        continue;
                    }
                    italicStyle = true;

                    outText += "<i>";

                    i++;
                    continue;
                } else if (secondChar === 'm') {
                    if (strikethroughStyle) {
                        i++;
                        continue;
                    }
                    strikethroughStyle = true;

                    outText += "<s>";

                    i++;
                    continue;
                } else if (secondChar === 'k') {
                    if (randomStyle) {
                        i++;
                        continue;
                    }
                    randomStyle = true;
                    i++;
                    continue;
                }
            }
        }
        if (randomStyle) {
            outText += randomText.charAt(Math.floor(Math.random() * randomText.length));
        } else {
            if (firstChar === ' ') {
                outText += '&nbsp;';
            } else {
                outText += firstChar;
            }
        }
    }

    componentID.innerHTML = outText;
}