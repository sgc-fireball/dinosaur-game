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
        this.barrier = {};

        var self = this;
        document.addEventListener('keydown', function (e) {
            if (self.state != 'running') {
                self.output = 0.5;
                return;
            }
            if (e.keyCode == 38) self.output = 0; // jump
            if (e.keyCode == 32) self.output = 0; // jump
            if (e.keyCode == 40) self.output = 1; // down
        });
        document.addEventListener('keyup', function (e) {
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
            trex: {
                x: parseInt(trex.x / this.image.width * 1000) / 1000,
                y: parseInt(trex.y / this.image.height * 1000) / 1000
            },
            barrier: this.getBarrier(trex)
        };
    };

    Scanner.prototype.recursiveValues = function (obj, result) {
        result = !!result ? result : [];
        for (var index in obj) {
            if (!obj.hasOwnProperty(index)) {
                continue;
            }
            if (typeof(obj[index]) == "object" && obj[index] !== null) {
                result = this.recursiveValues(obj[index], result);
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

    Scanner.prototype.getBarrier = function (trex) {
        var startX = Math.max(95, trex.x + 10);
        var stopX = this.image.width - 10;
        var startY = 25;
        var stopY = this.image.height - 30;
        var oldBarrier = this.barrier;
        this.barrier = {x: this.image.width, y: 0, speed: 0};

        if (this.state == 'running') {
            for (var y = startY; y < stopY; y += 5) {
                for (var x = startX; x < stopX; x += 1) {
                    if (this.barrier.x < x) {
                        break;
                    }

                    if (!this.image.getPixel(x, y).isColor(this.color)) {
                        continue;
                    }

                    this.barrier.x = x;
                    this.barrier.y = y;
                    break;
                }
            }
        }

        this.barrier.x = parseInt(this.barrier.x / this.image.width * 1000) / 1000;
        this.barrier.y = parseInt(this.barrier.y / this.image.height * 1000) / 1000;
        this.barrier.speed = parseInt((oldBarrier.x - this.barrier.x)*1000)/1000;
        return this.barrier;
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
