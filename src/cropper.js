import './cropper.css';

var cropper;
var doc = document;

cropper = function (elem, options) {
  elem = cropper.element(elem);
  cropper.on(elem, 'change', function(event) {
    console.log(elem.files[0]);
    // elem.value = null;
    let div = doc.createElement('div');
    let img = doc.createElement('div');
    let canvas = doc.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let w = doc.documentElement.clientWidth;
    let h = doc.documentElement.clientHeight;
    div.style.cssText = 'width:'+w+'px;height:'+h+'px;';
    div.className = 'cropper';
    w = w > 640 ? 640 : w;
    canvas.width = 640;
    canvas.height = 640;
    canvas.style.cssText = 'position:fixed;top:50%;left:50%;margin: -'+w/2+'px 0 0 -'+w/2+'px';
    div.appendChild(canvas);
    cropper.element('body').appendChild(div);
    console.log(w);
    // alert(cropper.element('body'));
  });
};

cropper.element = elem => {
  if (/^\./.test(elem)){
    elem = doc.getElementsByClassName(elem.substr(1));
    return elem.length == 1 ? elem[0] : elem;
  }else if (/^#/.test(elem)){
    return doc.getElementById(elem.substr(1));
  }else {
    elem = doc.getElementsByTagName(elem);
    return elem.length == 1 ? elem[0] : elem;
  }
};

cropper.on = (elem, type, func, capture) => {
  if (window.addEventListener){
    elem.addEventListener(type, func, capture || false);
  }else {
    elem.attachEvent('on' + type, func);
  }
}

// console.log(cropper.element('input'));
cropper('.file');