define([
    'inc/scanner', 'synaptic'
], function (Scanner, synaptic) {

    function AI() {
        this.init = false;
        this.trainingMode = true;
        this.learnRate = 0.3;

        this.runner = null;
        this.scanner = null;
        this.network = null;

        this.inputContainer = null;
        this.outputContainer = null;
        this.fitnessContainer = null;
    }

    /**
     * @param {boolean} trainingMode
     * @returns {AI}
     */
    AI.prototype.setTrainingMode = function (trainingMode) {
        this.trainingMode = !!trainingMode;
        return this;
    };

    /**
     * @param {Runner} runner
     * @returns {AI}
     */
    AI.prototype.setRunner = function (runner) {
        this.runner = runner;
        return this;
    };

    /**
     * @param {Scanner} scanner
     * @returns {AI}
     */
    AI.prototype.setScanner = function (scanner) {
        this.scanner = scanner;
        return this;
    };

    /**
     * @param {HTMLElement} inputContainer
     * @returns {AI}
     */
    AI.prototype.setRawInputContainer = function (inputContainer) {
        this.inputContainer = inputContainer;
        return this;
    };

    /**
     * @param {HTMLElement} outputContainer
     * @returns {AI}
     */
    AI.prototype.setRawOutputContainer = function (outputContainer) {
        this.outputContainer = outputContainer;
        return this;
    };

    /**
     * @param {HTMLElement} fitnessContainer
     * @returns {AI}
     */
    AI.prototype.setRawFitnessContainer = function (fitnessContainer) {
        this.fitnessContainer = fitnessContainer;
        return this;
    };

    /**
     * @returns {AI}
     */
    AI.prototype.run = function () {
        if (!this.init) {
            var inputLayer = new Layer(this.scanner.getInputs().length);
            var hiddenLayer = new Layer(parseInt(this.scanner.getInputs().length * 1.33));
            var outputLayer = new Layer(1);
            inputLayer.project(hiddenLayer);
            hiddenLayer.project(outputLayer);
            this.network = new Network({
                input: inputLayer,
                hidden: [hiddenLayer],
                output: outputLayer
            });
            this.init = true;
        }

        var self = this._run();
        requestAnimationFrame(function () {
            self.run();
        });
        return this;
    };

    /**
     * @returns {AI}
     * @private
     */
    AI.prototype._run = function () {
        var inputs = this.scanner.getInputs();
        var output = this.scanner.getOutput();
        var fitness = this.scanner.getFitness();
        var highScore = this.scanner.getHighScore();

        if (inputs[0] == 1) { // game is running
            if (this.trainingMode) {
                this.network.activate(inputs);
                this.network.propagate(this.learnRate, [output]);
            } else {
                output = this.network.activate(inputs);
                output = parseInt(output[0] * 100000) / 100000;
                if (output < 0.08) {
                    this._fakeKeyBoardEvent('keydown', 38); // jump
                    this._fakeKeyBoardEvent('keyup', 40); // down
                } else if (output < 0.92) {
                    this._fakeKeyBoardEvent('keyup', 38); // jump
                    this._fakeKeyBoardEvent('keyup', 40); // down
                } else {
                    this._fakeKeyBoardEvent('keyup', 38); // jump
                    this._fakeKeyBoardEvent('keydown', 40); // down
                }
            }
        } else if (!this.trainingMode && inputs[0]==0) {
            this._fakeKeyBoardEvent('keydown', 38); // jump
            this._fakeKeyBoardEvent('keyup', 38); // jump
        }

        if (!!this.inputContainer) {
            this.inputContainer.innerHTML = JSON.stringify(inputs);
        }
        if (!!this.outputContainer) {
            this.outputContainer.innerHTML = JSON.stringify(output);
        }
        if (!!this.fitnessContainer) {
            this.fitnessContainer.innerHTML = fitness + ' HI ' + highScore;
        }

        return this;
    };

    AI.prototype._fakeKeyBoardEvent = function (type, keyCode) {
        var eventObj = document.createEventObject ? document.createEventObject() : document.createEvent("Events");

        if(eventObj.initEvent){
            eventObj.initEvent(type, true, true);
        }

        eventObj.keyCode = keyCode;
        eventObj.which = keyCode;

        document.body.dispatchEvent ? document.body.dispatchEvent(eventObj) : document.body.fireEvent("on"+type, eventObj);
    };

    return AI;

});
