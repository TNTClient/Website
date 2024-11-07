export class CapeClass {
    /**
     * @param {string} base64Image
     * @param {boolean} isActive
     * */
    constructor(base64Image, isActive) {
        if (typeof base64Image !== "string") throw new Error("Invalid base64Image");
        if (typeof isActive !== "boolean") throw new Error("Invalid isActive");

        /**
         * @readonly
         * */
        this.base64Image = base64Image;

        /**
         * @readonly
         * */
        this.isActive = isActive;
    }

    /**
     * @param {string} obj.base64Image
     * @param {boolean} obj.isActive
     * @returns {CapeClass}
     * */
    static fromObject(obj) {
        if (obj.base64Image === undefined || obj.isActive === undefined) throw new Error("Invalid cape object");

        return new CapeClass(obj.base64Image, obj.isActive);
    }

    /**
     * @param {CapeClass} other
     * @returns {boolean}
     * */
    equals(other) {
        return this.base64Image === other.base64Image && this.isActive === other.isActive;
    }
}