requirejs.config({
    baseUrl: './javascript',
    paths: {
        'synaptic': '//cdnjs.cloudflare.com/ajax/libs/synaptic/1.0.4/synaptic'
    }
});
define('main',['inc/ai','inc/scanner'], function (AiService,Scanner) {

    var ai = new AiService();
    ai.setRunner( new Runner('.wrapper') );
    ai.setScanner( new Scanner(document.querySelector('canvas')) );
    ai.setRawInputContainer( document.querySelector('pre#input') );
    ai.setRawOutputContainer( document.querySelector('pre#output') );
    ai.setRawFitnessContainer( document.querySelector('pre#fitness') );
    ai.run();

    document.querySelector('input#train').addEventListener('change',function(){
        ai.setTrainingMode( this.checked );
    });

});
require(['main']);
