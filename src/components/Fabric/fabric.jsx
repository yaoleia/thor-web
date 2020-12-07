import React, { createRef } from 'react';
import { fabric } from 'fabric';
import ProCard from '@ant-design/pro-card';
import ProDescriptions from '@ant-design/pro-descriptions';
import styles from './style.less';

class Fabric extends React.Component {
  containerRef = createRef();
  state = {
    canvas: '',
    product: {},
  };

  componentDidMount() {
    this.init();
  }

  UNSAFE_componentWillReceiveProps({ values: product }) {
    this.canvasDraw(product);
    this.setState({ product });
  }

  getInner = () => {
    const { clientHeight, clientWidth } = this.containerRef.current;
    return {
      width: clientWidth,
      height: clientHeight,
    };
  };

  canvasDraw = (product) => {
    const { thumbnail_url } = product;
    const { canvas } = this.state;
    if (!thumbnail_url || !canvas) return;
    const image = new Image();
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
        left: image.clientLeft,
        top: image.clientTop,
      });
      this.addPoint(product);
      this.state.canvas.requestRenderAll();
    };
    image.src = thumbnail_url;
  };

  setZoom(params) {
    const { canvas } = this.state;
    let zoom = 1;
    const { height: eleHeight, width: eleWidth } = this.getInner();
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
  }

  init() {
    const canvas = new fabric.Canvas('canvas', {
      mageSmoothingEnabled: false,
      enableRetinaScaling: false,
      fireRightClick: true,
      stopContextMenu: true,
      imageSmoothingEnabled: false,
      includeDefaultValues: false,
      selection: false,
      ...this.getInner(),
    });
    this.mouseFunc(canvas);
    this.setState({ canvas });
  }

  addPoint({ defect_items = [] }) {
    const array = defect_items.forEach((item) => {
      const temp = this.minValue(item.points);
      const tempValue = item.points.map((item1) => {
        const res = { x: item1[0], y: item1[1] };
        return res;
      });
      return new fabric.Polygon(tempValue, {
        left: temp.left,
        top: temp.top,
        fill: item.fill_color,
        stroke: item.line_color,
        strokeWidth: 2,
      });
    });
    if (array.length) {
      this.state.canvas.add(...array);
    }
  }

  minValue = (param) => {
    return {
      left: Math.min(...param.map((item) => item[0])),
      top: Math.min(...param.map((item) => item[1])),
    };
  };

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
    const { canvas } = this.state;
    canvas.getObjects().forEach((item, index) => {
      if (index > 0) {
        item.visible = e;
      }
    });
    canvas.renderAll();
  };

  render() {
    const { product } = this.state;
    return (
      <div className={styles.fabricContainer}>
        <ProCard title="" colSpan="20%" className={styles.leftMsg}>
          <ProDescriptions column={1} title="展示列表" tooltip="">
            <ProDescriptions.Item label="uid">{product.uid}</ProDescriptions.Item>
            <ProDescriptions.Item label="缺损">
              {(product.defect_items && product.defect_items.length) || 0}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="创建时间">{product.time}</ProDescriptions.Item>
          </ProDescriptions>
        </ProCard>
        <div ref={this.containerRef} className={styles.canvasContainer}>
          <canvas id="canvas" />
        </div>
      </div>
    );
  }
}
export default Fabric;
