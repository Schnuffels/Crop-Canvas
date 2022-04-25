# CorpCanvas
画布裁切工具，去除周围透明像素点

## 使用方法

> 说明

* 本库用于去除 Canvas 图形外围透明像素点 （默认，可指定要去除的 rgba 颜色）

> 创建一个裁切对象

* canvasObj 为你的 canvas 画布对象
* 参数 2 可传入以下对象，如无需求可以不进行配置

```javascript
//创建 Canvas 裁切对象
let crop = new CropCanvas(canvasObj, {
    scanX: 1,           // 初始扫描 X 轴像素点（与 scanY 形成矩阵块，值越大扫描越快）
    scanY: 1,           // 初始扫描 Y 轴像素点（与 scanX 形成矩阵块，值越大扫描越快）
    rgba: '0,0,0,0',    // 初始需要被裁切的 rgba 值
    edge: 1             // 初始图形距离边界的留空距离
});
```


## 调用方法

这里说明调用方法的规范

>  analysis() 扫描分析

* analysis 方法是对 canvas 画布进行线性扫描的过程
* 参数1：true | false 可以红色像素填充准备去除的边界（支持链式调用）
* 参数2：true | false 开启扫描动画，用户可以观看扫描的效果（不支持链式调用、导出与裁切，仅播放动画，播放速度远慢于实际）

```javascript
crop.analysis(/*true*/ /*,true*/)
```

>  appendTo() 将裁切后的图片载入页面

* id 为 标签的 id 或者 class，如 #test 或 .test, 未设置默认载入 body

```javascript
// 请注意 appendTo() 方法不支持单独调用，必须先调用 analysis();
crop.analysis(/*true*/).appendTo(/*#test*/);
```
>  export() 导出裁切后的图片

* 参数1：文件名

```javascript
// 请注意 export() 方法不支持单独调用，必须先调用 analysis();
crop.analysis(/*true*/).export(/*filename*/);
```


## 总结

* 本插件支持对 canvas 图形外边距进行裁切处理，并导出或者展示图像
