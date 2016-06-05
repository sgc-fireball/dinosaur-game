define(function () {

    /**
     * @param {int} r
     * @param {int} g
     * @param {int} b
     * @param {int} a
     * @constructor
     */
    function Color(r, g, b, a) {
        this.r = r || 0;
        this.g = g || 0;
        this.b = b || 0;
        this.a = a || 0;
    }

    /**
     * @param {Color} color
     * @returns {boolean}
     */
    Color.prototype.isColor = function (color) {
        return this.r == color.r && this.g == color.g && this.b == color.b && this.a == color.a;
    };

    window.Color = Color;

    /**
     * @param {int} x
     * @param {int} y
     * @param {Color}color
     * @constructor
     */
    function Pixel(x, y, color) {
        this.x = !!x ? parseInt(x) : 0;
        this.y = !!y ? parseInt(y) : 0;
        this.color = color || new Color();
    }

    /**
     * @param {Color} color
     * @returns {boolean}
     */
    Pixel.prototype.isColor = function (color) {
        return this.color.isColor(color);
    };

    window.Pixel = Pixel;

    /**
     * @param {int} x
     * @param {int} y
     * @returns {Color}
     */
    ImageData.prototype.getPixel = function (x, y) {
        if (x < 0 || y < 0) return false;
        if (this.width < x || this.height < y) return false;
        var offset = (x + this.width * y) * 4;
        if (typeof(this.data[offset]) == "undefined") return false;
        if (typeof(this.data[offset + 3]) == "undefined") return false;
        return new Color(
            this.data[offset],
            this.data[offset + 1],
            this.data[offset + 2],
            this.data[offset + 3]
        );
    };

    /**
     * @param {int} x
     * @param {int} y
     * @param {int} width
     * @param {int} height
     * @returns {ImageData}
     */
    ImageData.prototype.getSection = function (x, y, width, height) {
        if (x < 0 || y < 0) return false;
        var xw = x + width;
        var yh = y + height;
        if (this.width < xw || this.height < yh) return false;
        var offset, data = [];
        for (var ix = x; ix < xw; ix++) {
            for (var iy = y; iy < yh; iy++) {
                offset = (ix + this.width * iy) * 4;
                data.push(this.data[offset]);
                data.push(this.data[offset + 1]);
                data.push(this.data[offset + 2]);
                data.push(this.data[offset + 3]);
            }
        }
        return new ImageData(
            new Uint8ClampedArray(data),
            width,
            height
        );
    };

    /**
     * @param {Color} color
     * @returns {boolean}
     */
    ImageData.prototype.findColorIn = function (color) {
        var x, y, offset;
        for (x = 0; x < this.width; x++) {
            for (y = 0; y < this.height; y++) {
                offset = (x + this.width * y) * 4;
                if (this.data[offset] == color.r && this.data[offset + 1] == color.g && this.data[offset + 2] == color.b && this.data[offset + 3] == color.a) {
                    return true;
                }
            }
        }
        return false;
    };

});
