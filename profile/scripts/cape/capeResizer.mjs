/**
 * @param {string} base64OrUrlImage
 * @returns {Promise<string>}
 * @throws {Error}
 * */
export function normalizeCapeSize(base64OrUrlImage) {
    if (typeof base64OrUrlImage !== "string") throw new Error("Invalid base64OrUrlImage");

    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            const {width, height} = getSize(image.width, image.height);

            if (width === image.width && height === image.height) {
                resolve(base64OrUrlImage);

                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (width < image.width && height < image.height) {
                ctx.drawImage(image, 0, 0, width, height);
            } else {
                ctx.drawImage(image, 0, 0);
            }

            resolve(canvas.toDataURL());
        };
        image.onerror = () => {
            reject();
        };
        image.src = base64OrUrlImage;
    });
}

/**
 * @param {string} imageBase64
 * @param {number} blur
 * @returns {Promise<string>}
 * @throws {Error}
 * */
export function repackCape(imageBase64, blur) {
    if (typeof imageBase64 !== "string") return Promise.reject(new Error("Invalid imageBase64"));
    if (typeof blur !== "number") return Promise.reject(new Error("Invalid blur"));

    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            // width = 2 * height / 3
            // height = 3 * width / 2

            // if 2 * image.height > 3 * image.width
            // x = (needX * image.width) / 12
            // y = (3 * image.width / 2) * (needY / 18) -> (needY * image.width) / 12
            // else
            // x = (2 * image.height / 3) * (needX / 12) -> (needX * image.height) / 18
            // y = (needY * image.height) / 18

            const scale = 2 * image.height > 3 * image.width ? image.width / 12 : image.height / 18;
            blurImage(image, blur).then(bluredImage => {
                const canvas = drawCapeToCanvas(bluredImage, scale);

                resolve(canvas.toDataURL());
            }).catch(reason => {
                reject(reason);
            });
        };
        image.onerror = () => {
            reject();
        };
        image.src = imageBase64;
    });
}

/**
 * @param {HTMLImageElement} image
 * @param {number} blur
 * @returns {Promise<HTMLImageElement>}
 * @private
 * */
async function blurImage(image, blur) {
    if (!(image instanceof HTMLImageElement)) return Promise.reject(new Error("Invalid image"));
    if (typeof blur !== "number") return Promise.reject(new Error("Invalid blur"));

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    ctx.filter = `blur(${blur}px)`;
    ctx.drawImage(image, 0, 0);

    const newImage = new Image();
    newImage.src = canvas.toDataURL();

    return new Promise((resolve, reject) => {
        newImage.onload = () => {
            resolve(newImage);
        };
        newImage.onerror = () => {
            reject();
        };
    });
}

/**
 * @param {HTMLImageElement} image
 * @param {number} imageScale
 * @returns {HTMLCanvasElement}
 * @throws {Error}
 * @private
 * */
function drawCapeToCanvas(image, imageScale) {
    if (!(image instanceof HTMLImageElement)) throw new Error("Invalid image");
    if (typeof imageScale !== "number") throw new Error("Invalid imageScale");

    const {width, height} = getSize(imageScale * 64, imageScale * 32);

    const capeScale = width / 64;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    ctx.drawImage(image,
        0, 0, 12 * imageScale, 17 * imageScale,
        0, 0, 12 * capeScale, 17 * capeScale);  // Left Right Front Top

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(image,
        imageScale, imageScale, 10 * imageScale, 16 * imageScale,
        -12 * capeScale, capeScale, -10 * capeScale, 16 * capeScale);  // Back
    ctx.restore();

    ctx.clearRect(11 * capeScale, 0, capeScale, capeScale);

    ctx.scale(1, -1);
    ctx.drawImage(image,
        imageScale, 17 * imageScale, 10 * imageScale, imageScale,
        11 * capeScale, 0, 10 * capeScale, -capeScale);  // Bottom

    return canvas;
}

/**
 * @param {number} width
 * @param {number} height
 * @returns {{width: number, height: number}}
 * @private
 * */
function getSize(width, height) {
    if (typeof width !== "number") throw new Error("Invalid width");
    if (typeof height !== "number") throw new Error("Invalid height");

    let newWidth = 64;
    let newHeight = 32;
    while ((newWidth < width || newHeight < height) && newWidth < 2048) {
        newWidth *= 2;
        newHeight *= 2;
    }

    return {width: newWidth, height: newHeight};
}