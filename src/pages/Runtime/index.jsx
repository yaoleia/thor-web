import React from 'react';
import FabricContainer from '@/components/Fabric/fabricContainer';
import { connect } from 'umi';
import _ from 'lodash';
import io from 'socket.io-client';
import { Select, Form, message, Tag } from 'antd';
import styles from './style.less';

class Runtime extends React.Component {
  state = {
    product: {},
    device: {},
  };
  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this.wsClose();
  }

  async init() {
    try {
      const { devices } = this.props;
      let selectIndex = devices.findIndex((item) => item.uid === localStorage.currentDevice);
      selectIndex = selectIndex === -1 ? 0 : selectIndex;
      const device = devices[selectIndex];
      if (!device) return;
      this.setState({ device });
      this.socketCreate(device);
    } catch (error) {
      message.error(error);
    }
  }

  wsClose = () => {
    if (!this.socket) return;
    this.socket.close();
    this.socket = null;
  };

  socketCreate = ({ uid: rooms }) => {
    this.wsClose();
    localStorage.currentDevice = rooms;
    const socket = io(SOCKETIO, {
      query: { rooms },
    });
    socket.on('connect', () => {
      console.log(`ws connected ${rooms} !`);
    });
    socket.on('disconnect', () => {
      console.log(`ws closed ${rooms} !`);
    });
    socket.on('res', (res) => {
      const {
        data: { payload, action },
      } = res;
      switch (action) {
        case 'product':
          this.setState({
            product: payload,
          });
          break;
        default:
          message.error({
            content: _.get(payload, 'msg.code') || _.get(payload, 'msg.error') || payload.msg,
            key: 'wsError',
          });
          break;
      }
    });
    window.socket = socket;
    this.socket = socket;
  };
  handleChange = (device_id) => {
    const device = this.props.devices.find((item) => item.uid === device_id);
    this.socketCreate(device);
    this.selectDevice.blur();
    this.setState({
      device,
      product: {},
    });
  };

  modelhandleChange = async (style_id) => {
    this.selectModel.blur();
    this.props.dispatch({
      type: 'device/bindModel',
      payload: {
        device_id: _.get(this.state, 'device.uid'),
        style_id,
      },
    });
  };
  render() {
    const { devices, models, loading } = this.props;
    const { product, device } = this.state;
    const style_id = _.get(device, 'style.uid');
    return (
      <div className={styles.runtimeContainer}>
        <Form layout="inline" className={styles.formSelect}>
          <Form.Item label="运行设备">
            <Select
              ref={(ref) => {
                this.selectDevice = ref;
              }}
              disabled={loading}
              placeholder="请选择运行设备"
              style={{ width: '200px' }}
              value={device && device.uid}
              onChange={this.handleChange}
              dropdownClassName="hasUid"
            >
              {devices &&
                devices.map((item) => {
                  return (
                    <Select.Option value={item.uid} key={item.uid}>
                      <span>{item.name}</span>
                      <Tag>{item.uid}</Tag>
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>
          <Form.Item label="检测型号">
            <Select
              ref={(ref) => {
                this.selectModel = ref;
              }}
              disabled={loading}
              loading={loading}
              placeholder="当前设备还未绑定型号"
              style={{ width: '200px' }}
              value={style_id}
              onChange={this.modelhandleChange}
              dropdownClassName="hasUid"
            >
              {models.map((item) => {
                return (
                  <Select.Option value={item.uid} key={item.uid}>
                    <span>{item.name}</span>
                    <Tag>{item.uid}</Tag>
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
        <FabricContainer product={product} height={143}></FabricContainer>
      </div>
    );
  }
}

export default connect(({ device, model, loading }) => ({
  devices: device.devices,
  models: model.models,
  loading: loading.models.device,
}))(Runtime);
