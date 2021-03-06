// import _ from 'lodash';
import $ from 'jquery';
import newDiagram from '../resources/newDiagram.bpmn';
import PizzaDiagram from '../resources/DeliverPizza.bpmn';

import {
  debounce
} from 'min-dash';

import BpmnModeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
// import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn';
import propertiesProviderModule from '../properties-panel-extension/provider/chatbot';
import chatbotModdleDescriptor from '../properties-panel-extension/descriptors/chatbot';
import lintModule from 'bpmn-js-bpmnlint';
import bpmnlintConfig from '../.bpmnlintrc';

// import BpmnSearchProvider from 'bpmn-js/lib/features/search';
// import BpmnKeyboardBindings from 'bpmn-js/lib/features/keyboard';

import '../node_modules/bpmn-js/dist/assets/diagram-js.css';
import '../node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '../node_modules/bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css';
import './css/style.less';

import '../node_modules/@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all'

// erzeugt den Modeler => näheres in der Doku
var modeler = new BpmnModeler({
  container: '#js-canvas',
  keyboard: { bindTo: document },
  linting: {
    bpmnlint: bpmnlintConfig
  },
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    lintModule,
    propertiesPanelModule,
    propertiesProviderModule
  ],
  moddleExtensions: {
    magic: chatbotModdleDescriptor
  }
});

modeler.importXML(PizzaDiagram, function(err) {

  if (!err) {
    console.log('success import bpmn model!');
    modeler.get('canvas').zoom('fit-viewport');
    zoomlevel = 0.8;	
    modeler.get('canvas').zoom(zoomlevel);
    modeler.get('linting').activateLinting();
  } else {
    console.log('something went wrong:', err);
  }
});

// blendet properties panel ein 
$("#hidePanel").click(function() {
  $('#js-properties-panel').toggle();
  $('.io-editing-tools, .io-zoom-controls').css("right","15px");
  $('.io-zoom-controls').css("bottom","90px");
  $('.bpmn-js-bpmnlint-button').css("right","15px");
  $('.io-dialog .content').css("left","55%");
  $('.djs-search-container').css("left","0");
  $('.vertical').css("right","0px")
  $('.vertical').css("height","50px")

});

// blendet properties panel ein oder aus
$("#editPanel").click(function() {

  if($('#js-properties-panel:hidden').length != 0){
    $('#js-properties-panel').toggle();
    $('.io-editing-tools, .io-zoom-controls').css("right", "280px");
    $('.io-zoom-controls').css("bottom", "15px");
    $('.bpmn-js-bpmnlint-button').css("right", "280px");
    // $('.io-alerts').css("left","50%");
    $('.io-dialog .content').css("left", "48%");
    $('.djs-search-container').css("left", "-180px");
    $('.vertical').css("right", "259px")
    $('.vertical').css("height", "30px")
  }
  else {
    $('#js-properties-panel').toggle();
    $('.io-editing-tools, .io-zoom-controls').css("right","15px");
    $('.io-zoom-controls').css("bottom","90px");
    $('.bpmn-js-bpmnlint-button').css("right","15px");
    // $('.io-alerts').css("left","50%");
    $('.io-dialog .content').css("left","55%");
    $('.djs-search-container').css("left","0");
    $('.vertical').css("right","0px")
    $('.vertical').css("height","50px")
  }
});

// de- und aktiviert Fullscreen-Modus
$("#toggleFullscreen").click(function() {
  toggleFullscreen();
})

function toggleFullscreen(elem) {
  elem = document.documentElement;
  if (!document.fullscreenElement && !document.mozFullScreenElement &&
    !document.webkitFullscreenElement && !document.msFullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

var zoomlevel = 1;

// zoomt rein
$("#zoomIn").on("click", function () {
  if (zoomlevel <= 3.0) {
    var canvas = modeler.get('canvas');	
    zoomlevel = zoomlevel + 0.3;	
    canvas.zoom(zoomlevel);
  }

})

// zoomt raus
$("#zoomOut").on("click", function () {
  if (zoomlevel >= 0.3) {
    var canvas = modeler.get('canvas');	
    zoomlevel = zoomlevel - 0.3;			

    canvas.zoom(zoomlevel);
  }
})

// resetet den zoom
$("#zoomReset").on("click", function () {
  modeler.get('canvas').zoom('fit-viewport');
  var canvas = modeler.get('canvas');	
  zoomlevel = 0.8;
  canvas.zoom(0.8);
})

$(".close").on("click", function () {
  $(".io-alerts").hide();
})

$("#showKeyboard").on("click", function () {
  $(".io-dialog").toggle();
})

$("#createNew").on("click", function () {
  openDiagram(newDiagram);
})

$("#openLocal").on("click", function () {
  $('#fileDialog').trigger('click');
})

// speichert Diagramm als SVG
function saveSVG(done) {
  modeler.saveSVG(done);
}

// speichert Diagramm als BMPN
function saveDiagram(done) {
  modeler.saveXML({ format: true }, function(err, xml) {
    done(err, xml);
  });
}

var fileInput = document.getElementById('fileDialog');
fileInput.addEventListener('change', function (e) {
  var file = fileInput.files[0];
  var reader = new FileReader();
  reader.onload = function (e) { 
    openDiagram(reader.result)
  }
  reader.readAsText(file);
});

// lädt ein bestehendes Diagramm
function openDiagram(xml) {
  modeler.get('linting').deactivateLinting();
  modeler.importXML(xml, function(err) {
    if (err) {
      console.error(err);
    } else {
      modeler.get('linting').activateLinting();
    }
  });
}

$(function() {
  
  var downloadLink = $('#downloadDiagram');
  var downloadSvgLink = $('#downloadSVG');

  $('.io-export li a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(function() {

    $(".io-export li a").css("cssText", "color: #555555 !important;");
    $(".io-export").removeClass("noHover");

    // TODO: diagram in ProcessName umbenennen... Idee: Globale Variable ...
    saveSVG(function(err, svg) {
      setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });

    saveDiagram(function(err, xml) {
      setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    });

  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);
});
