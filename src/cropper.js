import './cropper.css';
import EXIF from './exif';


(function(w){
  'use strict';

  var cropper;
  var doc = document;

  cropper = function (elem, options) {
    elem = cropper.element(elem);
    cropper.on(elem, 'change', function(event) {
      // console.log(elem.files[0]);
      let format = {
        'jpg': /image\/jp(e?)g/i,
        'png': /image\/png/i
      };
      options.format = options.format || ['jpg', 'png'];
      let isFormat = false;
      for (let n = 0; n < options.format.length; n++){
        if (format[options.format[n]].test(elem.files[0].type)){
          isFormat = true;
        }
      }
      if (!isFormat) {
        elem.value = null;
        alert('The format is incorrect');
        return;
      }
      let file = new FileReader();
      let img = new Image();
      let div = doc.createElement('div');
      let canvas = doc.createElement('canvas');
      let ctx = canvas.getContext('2d');
      let w = doc.documentElement.clientWidth;
      let h = doc.documentElement.clientHeight;
      let html = '';
      file.readAsDataURL(elem.files[0]);
      div.style.cssText = 'width:'+w+'px;height:'+h+'px;';
      div.className = 'cropper';
      w = w > 640 ? 640 : w;
      canvas.width = options.size || w;
      canvas.height = options.size || w;
      canvas.className = 'cropper-canvas';
      html += '<div class="cropper-view" style="width:'+w+'px;height:'+w+'px;margin:-'+w/2+'px 0 0 -'+w/2+'px;"></div>';
      html += '<div class="cropper-btn"><a class="cropper-btn-cancel" href="javascript:void(0);">取消</a>';
      html += '<a class="cropper-btn-ok" href="javascript:void(0);">截取</a></div></div>';
      cropper.on(div, 'touchstart touchmove touchend', event => {
        event.preventDefault();
      });
      file.onload = function () {
        img.src = file.result;
      };
      img.onload = function () {
        let { width, height } = img;
        let size = (width > height ? width/height : 1) * w;
        let top = (width > height ? (h - w) / 2 : 0);
        let left = (width > height ? ((-width*(w/height)/2)+w/2) : 0);
        html = '<div class="cropper-container cropper-anime-middle"><img class="cropper-img" src="' + file.result + '" width="' + size + '" style="top:' + top + 'px;left:' + left + 'px;" />' + html;
        div.innerHTML = html;
        cropper.element('body').appendChild(div);
        let cele = cropper.element('.cropper');
        let conta = cropper.element('.cropper-container');
        let view = cropper.element('.cropper-view');
        let cimg = cropper.element('.cropper-img');
        let cancel = cropper.element('.cropper-btn-cancel');
        let ok = cropper.element('.cropper-btn-ok');
        let startScale = 1, scale, endScale, isMove, x1, x2, y1, y2, ex = left, ey = top;
        setTimeout(function () {
          conta.className = 'cropper-container cropper-anime-middle translateY';
        }, 0);
        cropper.on(view, 'touchstart touchmove touchend', event => {
          let touch1 = event.targetTouches[0],
          touch2 = event.targetTouches[1],
          fingers = event.touches.length;
          if (event.type == 'touchstart'){
            if (fingers === 2){
              scale = Math.abs(touch1.pageX - touch2.pageX);
              isMove = false;
            }else if (fingers === 1) {
              x1 = touch1.pageX;
              y1 = touch1.pageY;
              isMove = true;
            }
          }
          if (event.type == 'touchmove'){
            if (fingers === 2){
              endScale = startScale + (Math.abs(touch1.pageX - touch2.pageX) - scale) / w;
              cimg.style.width = endScale * size + 'px';
              isMove = false;
            }else if (fingers === 1) {
              x2 = touch1.pageX - x1;
              y2 = touch1.pageY - y1;
              cimg.style.left = x2 + ex + 'px';
              cimg.style.top = y2 + ey + 'px';
              isMove = true;
            }
          }
          if (event.type == 'touchend'){
            cimg.className = 'cropper-img cropper-anime';
            if (isMove){
              ex = x2 + ex;
              ey = y2 + ey;
              let rx = -cimg.width + w;
              ex = ex > 0 ? 0 : (ex < rx ? rx : ex);
              let ty = (h - w) / 2;
              let by = h - (cimg.height + ty);
              ey = ey > ty ? ty : (ey < by ? by : ey);
              cimg.style.left = ex + 'px';
              cimg.style.top = ey + 'px';
            }else {
              startScale = endScale > 1 ? endScale : 1;
              cimg.style.width = startScale * size + 'px';
            }
            setTimeout(function () {
              cimg.className = 'cropper-img';
            }, 200);
          }
          event.preventDefault();
        })
        cropper.on(cancel, 'touchend', closeCropper)
        cropper.on(ok, 'touchend', () => {
          if (Uint8Array&&atob&&Blob){
            let mul = (options.size || w) / w;
            EXIF.getData(elem.files[0], function () {
              EXIF.getAllTags(this);
              let Orientation = EXIF.getTag(this, 'Orientation'), sx = ex, sy = ey - (h - w) / 2;
              if (Orientation != "" && Orientation != 1){
                switch (Orientation){
                  case 6:
                    // 顺时针旋转90度
                    ctx.rotate(90*Math.PI/180);
                    sy -= (options.size || w);
                    break;
                  case 8:
                    // 逆时针旋转90度
                    ctx.rotate(-90*Math.PI/180);
                    sx -= (options.size || w);
                    break;
                  case 3:
                    // 顺时针旋转180度
                    ctx.rotate(180*Math.PI/180);
                    sx -= (options.size || w);
                    sy -= (options.size || w);
                    break;
                }
              }
              ctx.drawImage(img, 0, 0, width, height, sx, sy, cimg.width * mul, cimg.height * mul);
              let src = canvas.toDataURL();
              // open(src);
              cele.appendChild(canvas);
              src = src.split(',')[1];
              src = window.atob(src);
              let ia = new Uint8Array(src.length);
              for (let i = 0; i < src.length; i++) {
                ia[i] = src.charCodeAt(i);
              };
              options.success(new Blob([ia], {type:"image/png"}));
              closeCropper()
            })
          }else {
            alert('Your browser doesn\'t support it')
          } 
        })

        function closeCropper () {
          conta.className = 'cropper-container cropper-anime-middle';
          elem.value = null;
          setTimeout(function () {
            cropper.element('body').removeChild(cele);
          }, 350);
        }
      }
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
    type = type.split(' ');
    for (let i = 0; i < type.length; i++){
      if (window.addEventListener){
        elem.addEventListener(type[i], func, capture || false);
      }else {
        elem.attachEvent('on' + type[i], func);
      }
    }
  };

  w.cropper = cropper;
})(window);

// example

// cropper('.file', {
//   size: 400,
//   success: function(img){
//     console.log(typeof img);
//   }
// });