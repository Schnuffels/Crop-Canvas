// Crop an empty area of the canvas
(function () {

    let scanSizeX = 1;
    let scanSizeY = 1;
    let edge = 1;
    let tR = 0;
    let tG = 0;
    let tB = 0;
    let tA = 0;

    function CropCanvas(canvasElement, obj){
        this.pendingCanvas = canvasElement;
        if(typeof(obj) !== 'undefined'){
            scanSizeX = obj.scanX == null ? 1 : obj.scanX;
            scanSizeY = obj.scanY == null ? 1 : obj.scanY;
            edge = obj.edge == null ? 1 : obj.edge;
            let rgba = [];
            rgba = obj.rgba == null ? [0, 0, 0, 0] : obj.rgba.replace(/\s*/g, '').split(',');
            if(rgba.length == 4){
                tR = parseInt(rgba[0]);
                tG = parseInt(rgba[1]);
                tB = parseInt(rgba[2]);
                tA = parseInt(rgba[3]);
            }
        }
    }

    CropCanvas.prototype.analysis = function(displayBoundary = false, animatePlayback = false){

        let ctx = this.pendingCanvas.getContext('2d');
        // 存储非透明元素的所有像素点
        let contentPosition = [];

        if(animatePlayback){
            this.analysisAnimation(ctx);
            return;
        }

        for (let i = 0; i < this.pendingCanvas.width; i += scanSizeX) {
            for (let j = 0; j < this.pendingCanvas.height; j += scanSizeY) {

                let positionColor = ctx.getImageData(i, j, scanSizeX, scanSizeY)
                let r = positionColor.data[0];
                let g = positionColor.data[1];
                let b = positionColor.data[2];
                let a = positionColor.data[3];

                // 如果是透明像素点
                if(!(r === tR && g === tG && b === tB && a === tA)){
                    contentPosition.push({x:i, y:j})
                    // console.log('R:' + r, ' G:' + g, ' B:' + b, ' A:' + a)
                }
                
            }
        }

        let lOffset = 0;    //最左偏移
        let rOffset = 0;    //最右偏移
        let tOffset = 0;    //最上偏移
        let bOffset = 0;    //最下偏移

        // 分析坐标
        lOffset = contentPosition.sort((a, b) => {
            return a.x - b.x
        })[0].x - edge;
        rOffset = contentPosition.sort((a, b) => {
            return b.x - a.x
        })[0].x + edge;
        tOffset = contentPosition.sort((a, b) => {
            return a.y - b.y
        })[0].y - edge;
        bOffset = contentPosition.sort((a, b) => {
            return b.y - a.y
        })[0].y + edge;

        // 继续分析出边界，或者在此停止
        if(displayBoundary){
            for (let i = 0; i < this.pendingCanvas.width; i++) {
                for (let j = 0; j < this.pendingCanvas.height; j++) {
                    if(i < lOffset || i > rOffset || j < tOffset || j > bOffset){
                        ctx.fillStyle = 'red';
                        ctx.fillRect(i, j, 1, 1)
                    }
                }
            }
        }

        this.pendingImgData = ctx.getImageData(lOffset, tOffset, rOffset - lOffset, bOffset - tOffset);

        return this;
    }

    CropCanvas.prototype.analysisAnimation = function(ctx){
        let contentPosition = [];
        let i = 0;
        iFor(this, ctx, i, contentPosition);
    }
 

    function iFor(tThis, ctx, i, contentPosition){
        if(i < tThis.pendingCanvas.width){
            jFor(tThis, ctx, i, contentPosition);
        }
    }

    function jFor(tThis, ctx, i, contentPosition){
        let j = 0;
        let jTimer = setInterval(() => {

            if(j < tThis.pendingCanvas.height){

                let positionColor = ctx.getImageData(i, j, scanSizeX, scanSizeY)
                let r = positionColor.data[0];
                let g = positionColor.data[1];
                let b = positionColor.data[2];
                let a = positionColor.data[3];

                // 如果是透明像素点
                if(!(r === tR && g === tG && b === tB && a === tA)){
                    ctx.fillStyle = 'white';
                    ctx.fillRect(i, j, 1, 1)
                    contentPosition.push({x:i, y:j})
                } else {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(i, j, 1, 1)
                }

                j += scanSizeY;
            } else {
                clearInterval(jTimer);
                iFor(tThis, ctx, i += scanSizeX, contentPosition);
            }

        }, 1)
    }

    CropCanvas.prototype.appendTo = function(id = null){
        if(typeof(this.pendingImgData) !== 'undefined'){
            this.putToFinalCanvas();
            if(id != null){
                document.querySelector(id).appendChild(this.finalCanvas)
            } else {
                document.body.appendChild(this.finalCanvas);
            }
        } else {
            console.log('裁切图片未能载入页面，请先调用 analysis()')
        }
        return this;
    }

    CropCanvas.prototype.putToFinalCanvas = function(){
        this.finalCanvas = document.createElement('canvas');
        let _ctx = this.finalCanvas.getContext('2d');
        this.finalCanvas.id = "final";
        this.finalCanvas.width = this.pendingImgData.width;
        this.finalCanvas.height = this.pendingImgData.height;
        _ctx.putImageData(this.pendingImgData, 0, 0);
        this.putToCanvasStatus = true;
    }

    CropCanvas.prototype.export = function(filename){
        if(typeof(this.pendingImgData) === 'undefined'){
            console.log('裁切图片未能导出，请先调用 analysis()')
            return;
        }
        if(filename == null){
            filename = 'test.png';
        }
        if(!this.putToCanvasStatus){
            this.putToFinalCanvas();
        }
        // 图片导出为 png 格式
        this.pendingImgData = this.finalCanvas.toDataURL("image/png");
        this.pendingImgData = this.pendingImgData.replace('image/png','image/octet-stream');

        this.saveFile(this.pendingImgData, filename);
    }

    CropCanvas.prototype.saveFile = function(data, filename){
        let save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        save_link.href = data;
        save_link.download = filename;
    
        let event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        save_link.dispatchEvent(event);
    }


    window.CropCanvas = CropCanvas;
})();