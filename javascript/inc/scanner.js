define(['inc/utils'], function () {

    function Scanner(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');

        this.image = [];
        this.color = new Color(83, 83, 83, 255);
        this.state = 'waiting';
        this.lastStart = 0;
        this.highScore = 0;
        this.output = 0.5;

        var self = this;
        document.addEventListener('keydown',function(e){
            if (self.state != 'running') {
                self.output = 0.5;
                return;
            }
            if (e.keyCode == 38) self.output = 0; // jump
            if (e.keyCode == 32) self.output = 0; // jump
            if (e.keyCode == 40) self.output = 1; // down
        });
        document.addEventListener('keyup',function(e){
            if (self.state != 'running') {
                self.output = 0.5;
                return;
            }
            if (e.keyCode == 38) self.output = 0.5; // jump
            if (e.keyCode == 32) self.output = 0.5; // jump
            if (e.keyCode == 40) self.output = 0.5; // down
        });
    }

    Scanner.prototype.getInputs = function () {
        this.image = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.detectGameState();

        var trex = this.getDinosaurPosition();
        return {
            state: this.state == 'running' ? 1 : 0,
            trexX: parseInt(trex.x / this.image.width * 1000) / 1000,
            trexY: parseInt(trex.y / this.image.height * 1000) / 1000,
            barriers: this.getBarriers(trex)
        };
    };

    Scanner.prototype.recursiveValues = function (obj,result) {
        result = !!result ? result : [];
        for (var index in obj) {
            if (!obj.hasOwnProperty(index)) {
                continue;
            }
            if (typeof(obj[index]) == "object" && obj[index] !== null) {
                result = this.recursiveValues(obj[index],result);
                continue;
            }
            result.push(obj[index]);
        }
        return result;
    };

    Scanner.prototype.getOutput = function () {
        return this.output;
    };

    Scanner.prototype.detectGameState = function () {
        var pixel = this.image.getPixel(1, 115);
        if (pixel.r == 247 && pixel.g == 247 && pixel.b == 247 && pixel.a == 255) {
            // waiting
            return this;
        }
        if (this.image.getSection(256, 45, 2, 2).findColorIn(this.color)) {
            if (this.state == 'running') {
                this.highScore = this.getFitness();
                this.lastStart = 0;
                this.state = 'gameover';
            }
            return this;
        }
        if (this.state != 'running') {
            this.lastStart = this.getNow();
            this.state = 'running';
        }
        return this;
    };

    Scanner.prototype.getDinosaurPosition = function () {
        var x, y, pos = {x: 0, y: 0};
        if (this.state != 'running') {
            return pos;
        }
        for (y = 0; y < 124; y++) {
            if (this.image.getPixel(51, y).isColor(this.color)) {
                pos.y = y;
                break;
            }
            if (this.image.getPixel(24, y).isColor(this.color)) {
                pos.y = y;
                break;
            }
        }
        pos.x = -1;
        for (x = 84; x >= 0; x--) {
            if (this.image.getPixel(x, pos.y).isColor(this.color)) {
                pos.x = x;
                break;
            }
        }
        return pos;
    };

    Scanner.prototype.getBarriers = function (trex) {
        var max = this.image.width;
        var i, offset, y, x, xStart = trex.x + 10,
            result = [
                max, 0, max, 0, max, 0, max, 0, max, 0, max, 0, max, 0, max, 0, max, 0, max, 0,
                max, 0, max, 0, max, 0, max, 0, max, 0, max, 0, max, 0, max, 0, max, 0, max, 0
            ];
        var xStop = this.canvas.width - 10;
        if (this.state != 'running') {
            for (i = 0; i < result.length; i++) {
                result[i] = parseInt(result[i] / this.image.width * 1000)/1000;
            }
            return result;
        }
        for (i = 0; i < result.length / 2; i++) {
            offset = i * 2;
            y = (i + 5) * 5;

            for (x = xStart; x < xStop; x++) {
                if (result[offset] == 600) {
                    if (!this.image.getPixel(x, y).isColor(this.color)) {
                        continue;
                    }
                    result[offset] = x;
                    continue;
                }

                if (result[offset] + 100 < x) {
                    break;
                }
                if (this.image.getPixel(x, y).isColor(this.color)) {
                    result[offset + 1] = x - result[offset];
                }
            }
        }
        for (i = 0; i < result.length; i++) {
            result[i] = parseInt(result[i] / this.image.width * 1000)/1000;
        }
        return result;
    };

    Scanner.prototype.getFitness = function () {
        if (!this.lastStart) {
            return 0;
        }
        return parseInt((this.getNow() - this.lastStart) * 10);
    };

    Scanner.prototype.getHighScore = function () {
        return this.highScore;
    };

    Scanner.prototype.getNow = function () {
        return (window.performance.timing.navigationStart + window.performance.now()) / 1000;
    };

    return Scanner;

});
