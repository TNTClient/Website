const randomText = "ÀÁÂÈÊËÍÓÔÕÚßãõğİıŒœŞşŴŵžȇ        !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αβΓπΣσμτΦΘΩδ∞∅∈∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";
const colorChars = "0123456789abcdef"

/**
 * @param {string} text
 * @returns {string}
 * */
export function stripColor(text) {
    return text.replace(/[§&][0-9A-FK-ORa-fk-o]/gi, "");
}

/**
 * @param {string} text
 * @returns {string}
 * */
export function toHTMLColor(text) {
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

    return outText;
}