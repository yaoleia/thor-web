import React from 'react';
import Fabric from '@/components/Fabric/fabric';
import { connect } from 'umi';
import io from 'socket.io-client';
import { Select, Form, message } from 'antd';
import { bindDeviceModel, queryDevice, queryModel } from '@/services/bind';
import ProCard from '@ant-design/pro-card';
import ProDescriptions from '@ant-design/pro-descriptions';
import styles from './style.less';

class Runtime extends React.Component {
  state = {
    ioResponseData: {},
    deviceData: [],
    socket: '',
    deviceValue: '',
    modelData: [],
    modelValue: '',
  };
  componentDidMount() {
    this.init();
  }
  init(param) {
    new Promise((resolve) => {
      resolve(queryModel());
    }).then((e) => {
      this.setState({
        modelData: e.data,
        modelValue: '',
      });
    });
    new Promise((resolve) => {
      resolve(queryDevice());
    }).then((e) => {
      let selectIndex = 0;
      if (param) {
        selectIndex = this.state.deviceData.findIndex((item) => item.uid === param);
      }
      let tempUid = '';
      if (e.data[selectIndex].style) {
        tempUid = e.data[selectIndex].style.uid;
      }
      this.setState({
        deviceData: e.data,
        deviceValue: e.data[selectIndex].uid,
        modelValue: tempUid,
      });
      this.socketCreate(e.data[selectIndex].uid);
    });
  }
  socketCreate = (param) => {
    if (this.state.socket) {
      this.state.socket.disconnect();
    }
    const socket = io(SOCKETIO, {
      query: {
        rooms: param,
      },
    });

    window.socket = socket;

    socket.on('res', (res) => {
      const { data } = res;
      if (data.action === 'product') {
        this.setState({
          ioResponseData: data.payload,
        });
      }
    });
    this.setState({
      socket,
    });
  };
  handleChange = (value) => {
    console.log(`selected ${value}`);
    this.socketCreate(value);
    this.setState({
      deviceValue: value,
      ioResponseData: {},
    });
    const itemValue = this.state.deviceData.find((item) => item.uid === value);
    if (itemValue.style) {
      this.setState({
        modelValue: itemValue.style.uid,
      });
    } else {
      this.setState({
        modelValue: '',
      });
    }
  };

  modelhandleChange = (value) => {
    console.log(`modelhandleChangeselected ${value}`);
    this.setState({
      modelValue: value,
    });
    const params = {
      device_id: this.state.deviceValue,
      style_id: value,
    };
    new Promise((resolve) => {
      resolve(bindDeviceModel(params));
    }).then((e) => {
      if (e.device.name) {
        message.success('绑定成功');
      }
      this.init(this.state.deviceValue);
    });
  };

  render() {
    const product = this.state.ioResponseData;
    return (
      <div className={styles.runtimeContainer}>
        <Form layout="inline" className={styles.formSelect}>
          <Form.Item label="运行设备">
            <Select
              style={{ width: '200px' }}
              value={this.state.deviceValue}
              onChange={this.handleChange}
            >
              {this.state.deviceData &&
                this.state.deviceData.map((item) => {
                  return (
                    <Select.Option value={item.uid} key={item.uid}>
                      {item.name}
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>
          <Form.Item label="检测型号">
            <Select
              placeholder="当前设备还未绑定型号"
              style={{ width: '200px' }}
              value={this.state.modelValue}
              onChange={this.modelhandleChange}
            >
              {this.state.modelData.map((item) => {
                return (
                  <Select.Option value={item.uid} key={item.uid}>
                    {item.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
        <div className={styles.fabricContainer}>
          <ProCard title="" colSpan="20%" className={styles.leftMsg}>
            <ProDescriptions column={1} title="展示列表">
              <ProDescriptions.Item label="uid">{product.uid}</ProDescriptions.Item>
              <ProDescriptions.Item label="缺损">
                {(product.defect_items && product.defect_items.length) || 0}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="创建时间">{product.time}</ProDescriptions.Item>
            </ProDescriptions>
          </ProCard>
          <Fabric product={product} className={styles.canvasContainer} />
        </div>
      </div>
    );
  }
}

export default connect(() => ({}))(Runtime);
