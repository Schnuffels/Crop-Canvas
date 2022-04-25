// Crop an empty area of the canvas
(function () {

    let pendingCanvas;
    let pendingImgData;
    let finalCanvas;

    function CropCanvas(canvasElement){
        this.pendingCanvas = canvasElement;
    }

    CropCanvas.prototype.analysis = function(displayBoundary = false){
        // 存储非透明元素的所有像素点
        let contentPosition = [];

        console.log(this.pendingCanvas.width)
        console.log(this.pendingCanvas.height)

        for (let i = 0; i < this.pendingCanvas.width; i += 100) {
            for (let j = 0; j < this.pendingCanvas.height; j += 100) {

                let positionColor = ctx.getImageData(i, j, 100, 100)
                let r = positionColor.data[0];
                let g = positionColor.data[1];
                let b = positionColor.data[2];
                let a = positionColor.data[3];

                // 如果是透明像素点
                if(!(r === 255 && g === 255 && b === 255 && a === 255)){
                    contentPosition.push({x:i, y:j})

                    // console.log('R:' + r, ' G:' + g, ' B:' + b, ' A:' + a)
                }
                
            }
        }

        let lOffset = 0;    //最左偏移
        let rOffset = 0;    //最右偏移
        let tOffset = 0;    //最上偏移
        let bOffset = 0;    //最下偏移
        let paddingOffset = 100;  //距离裁切边距

        // 分析坐标
        lOffset = contentPosition.sort((a, b) => {
            return a.x - b.x
        })[0].x - paddingOffset;
        rOffset = contentPosition.sort((a, b) => {
            return b.x - a.x
        })[0].x + paddingOffset;
        tOffset = contentPosition.sort((a, b) => {
            return a.y - b.y
        })[0].y - paddingOffset;
        bOffset = contentPosition.sort((a, b) => {
            return b.y - a.y
        })[0].y + paddingOffset;

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

    CropCanvas.prototype.appendToBody = function(){
        this.finalCanvas = document.createElement('canvas');
        let _ctx = this.finalCanvas.getContext('2d');
        this.finalCanvas.id = "final";
        this.finalCanvas.width = this.pendingImgData.width;
        this.finalCanvas.height = this.pendingImgData.height;
        _ctx.putImageData(this.pendingImgData, 0, 0);

        document.body.appendChild(this.finalCanvas);

        return this;
    }

    CropCanvas.prototype.export = function(filename){
        if(filename == null){
            filename = 'test.png';
        }
        // 图片导出为 png 格式
        this.pendingImgData = this.finalCanvas.toDataURL("image/png");
        this.pendingImgData = this.pendingImgData.replace(this._fixType("png"),'image/octet-stream');

        // download
        this._saveFile(this.pendingImgData, filename);
    }

    CropCanvas.prototype._fixType = function(type){
        type = type.toLowerCase().replace(/jpg/i, 'jpeg');
        let r = type.match(/png|jpeg|bmp|gif/)[0];
        return 'image/' + r;
    }

    CropCanvas.prototype._saveFile = function(data, filename){
        let save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        save_link.href = data;
        save_link.download = filename;
    
        let event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        save_link.dispatchEvent(event);
    }


    window.CropCanvas = CropCanvas;
})();