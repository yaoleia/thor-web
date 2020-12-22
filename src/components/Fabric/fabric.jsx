import React, { createRef } from 'react';
import { fabric } from 'fabric';
class Fabric extends React.PureComponent {
  containerRef = createRef();
  canvasRef = createRef();
  componentDidMount() {
    this.init();
    window.addEventListener('resize', this.resize, {
      passive: true,
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  componentDidUpdate({ product: preProduct }) {
    const { product } = this.props;
    if (preProduct === product) return;
    if (!product.uid && this.canvas) {
      this.clearImgElement();
      this.canvas.clear();
      return;
    }
    this.canvasDraw(product);
  }

  getInner = () => {
    const containerRef = this.containerRef.current;
    if (!containerRef) return;
    const { clientHeight, clientWidth } = containerRef;
    if (clientHeight && clientWidth) {
      this.inner = {
        width: clientWidth,
        height: clientHeight,
      };
    }
    return this.inner;
  };

  clearImgElement = (loaded) => {
    if (!this.image) return;
    this.image.onload = null;
    this.image.onerror = null;
    if (!loaded && this.reject) {
      this.reject();
    }
    this.reject = null;
    this.image = null;
  };

  canvasDraw = async (product) => {
    const { thumbnail_url } = product;
    const { canvas } = this;
    if (!thumbnail_url || !canvas) return;
    this.clearImgElement();
    await new Promise((resolve, reject) => {
      this.reject = reject;
      const image = new Image();
      this.image = image;
      image.onload = () => {
        const imageOnloadFbric = new fabric.Image(image, {
          width: image.width,
          height: image.height,
          selectable: false,
        });
        canvas.clear();
        canvas.add(imageOnloadFbric);
        this.setZoom({
          width: image.width,
          height: image.height,
        });
        this.addPolygon(product);
        this.canvas.requestRenderAll();
        this.clearImgElement(true);
        resolve();
      };
      image.onerror = () => this.clearImgElement();
      image.src = thumbnail_url;
    });
  };

  resize = () => {
    if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.resizeTimer = null;
      this.setZoom();
    }, 100);
  };

  setZoom = (params = this.canvas.item(0)) => {
    const { canvas } = this;
    let zoom = 1;
    const inner = this.getInner();
    if (!params) params = inner;
    if (!inner) return;
    const { height: eleHeight, width: eleWidth } = inner;
    const rate = eleWidth / eleHeight;
    const imgRate = params.width / params.height;
    const ratio = null ? imgRate < rate : imgRate > rate;
    if (ratio) {
      zoom = eleWidth / params.width;
    } else {
      zoom = eleHeight / params.height;
    }
    canvas.setZoom(zoom);
    canvas.setWidth(eleWidth);
    canvas.setHeight(eleHeight);
    canvas.absolutePan({
      x:
        (params.width * zoom - eleWidth) * 0.5 +
        (Number.isNaN(params.left * zoom) ? 0 : params.left * zoom),
      y:
        (params.height * zoom - eleHeight) * 0.5 +
        (Number.isNaN(params.top * zoom) ? 0 : params.top * zoom),
    });
  };

  init() {
    const canvas = new fabric.Canvas(this.canvasRef.current, {
      enableRetinaScaling: true,
      fireRightClick: true,
      stopContextMenu: true,
      imageSmoothingEnabled: false,
      includeDefaultValues: false,
      selection: false,
      ...this.getInner(),
    });
    this.mouseFunc(canvas);
    this.canvas = canvas;

    const { product } = this.props;
    if (product && Object.keys(product).length) {
      this.canvasDraw(product);
    }
  }

  addPolygon({ defect_items = [] }) {
    const { getTypeConfig } = this.props;
    const array = defect_items.map((item) => {
      const temp = this.minValue(item.points);
      const tempValue = item.points.map((item1) => {
        const res = { x: item1[0], y: item1[1] };
        return res;
      });
      return new fabric.Polygon(tempValue, {
        left: temp.left,
        top: temp.top,
        stroke: getTypeConfig ? getTypeConfig(item.label).color : item.fill_color,
        fill: item.fill_color,
        strokeWidth: 2,
        selectable: false,
      });
    });
    if (array.length) {
      this.canvas.add(...array);
    }
  }

  minValue = (param) => ({
    left: Math.min(...param.map((item) => item[0])),
    top: Math.min(...param.map((item) => item[1])),
  });

  transform = (canvas) => {
    const center = canvas.getVpCenter();
    const absCenter = { x: canvas.width * 0.5, y: canvas.height * 0.5 };
    const zoom = canvas.getZoom();
    const scaleX = absCenter.x - center.x * zoom;
    const scaleY = absCenter.y - center.y * zoom;
    return function (point) {
      return [(point[0] - scaleX) / zoom, (point[1] - scaleY) / zoom];
    };
  };
  mouseFunc = (canvas) => {
    canvas.on('mouse:wheel', (options) => {
      options.e.preventDefault();
      let zoom = canvas.getZoom();
      const delta = options.e.wheelDelta;
      if (delta !== 0) {
        if (delta > 0) {
          zoom += zoom * 0.05;
          if (zoom > 10) zoom = 10;
          canvas.zoomToPoint(canvas.getPointer(options, true), zoom);
        } else if (delta < 0) {
          zoom -= zoom * 0.05;
          if (zoom < 0.05) zoom = 0.05;
          canvas.zoomToPoint(canvas.getPointer(options, true), zoom);
        }
      }
    });
  };
  clearFunc = (e) => {
    const { canvas } = this;
    canvas.getObjects().forEach((item, index) => {
      if (index > 0) {
        item.visible = e;
      }
    });
    canvas.renderAll();
  };

  render() {
    const { className } = this.props;
    return (
      <div ref={this.containerRef} className={className}>
        <canvas ref={this.canvasRef} />
      </div>
    );
  }
}
export default Fabric;
