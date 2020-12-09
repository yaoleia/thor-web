import React from 'react';
import Fabric from '@/components/Fabric/fabric';
import { connect } from 'umi';
import _ from 'lodash';
import io from 'socket.io-client';
import { Select, Form, message, Tag, Card, Descriptions } from 'antd';
import ProCard from '@ant-design/pro-card';
import moment from 'moment';
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
    this.setState({
      device,
      product: {},
    });
  };

  modelhandleChange = async (style_id) => {
    this.props.dispatch({
      type: 'device/bindModel',
      payload: {
        device_id: _.get(this.state, 'device.uid'),
        style_id,
      },
    });
  };

  getGroup = (arr) => {
    if (!Array.isArray(arr) || !arr.length) return;
    return _.groupBy(arr, 'label');
  };

  render() {
    const { devices, models } = this.props;
    const { product, device } = this.state;
    const { defect_items, size_items, size_alarm, defect_alarm } = product;
    const defect_detail = this.getGroup(defect_items);
    const size_detail = this.getGroup(size_items);
    const style_id = _.get(device, 'style.uid');
    return (
      <div className={styles.runtimeContainer}>
        <Form layout="inline" className={styles.formSelect}>
          <Form.Item label="运行设备">
            <Select
              style={{ width: '200px' }}
              value={device.uid}
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
        <div className={styles.fabricContainer}>
          <ProCard title="" colSpan="20%" className={styles.leftMsg}>
            <Descriptions column={1} title="检测结果">
              {product.uid && (
                <>
                  <Descriptions.Item label="ID">{product.uid}</Descriptions.Item>
                  <Descriptions.Item label="检测时间">
                    {moment(product.time).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                  {defect_detail && (
                    <Descriptions.Item className={styles.defectDetail} label="瑕疵缺陷">
                      {Object.keys(defect_detail).map((defect) => (
                        <Tag key={defect}>
                          {defect}: {defect_detail[defect].length}
                        </Tag>
                      ))}
                    </Descriptions.Item>
                  )}
                  {size_detail && (
                    <Descriptions.Item className={styles.defectDetail} label="尺寸缺陷">
                      {Object.keys(size_detail).map((size) => (
                        <Tag key={size}>
                          {size}: {size_detail[size].length}
                        </Tag>
                      ))}
                    </Descriptions.Item>
                  )}
                  {typeof defect_alarm === 'boolean' && (
                    <Descriptions.Item>
                      <Card className={defect_alarm ? styles.alarm : styles.ok}>
                        瑕疵: {defect_alarm ? 'NG' : 'OK'}
                      </Card>
                    </Descriptions.Item>
                  )}
                  {typeof size_alarm === 'boolean' && (
                    <Descriptions.Item>
                      <Card className={size_alarm ? styles.alarm : styles.ok}>
                        尺寸: {size_alarm ? 'NG' : 'OK'}
                      </Card>
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>
          </ProCard>
          <Fabric product={product} className={styles.canvasContainer} />
        </div>
      </div>
    );
  }
}

export default connect(({ device, model }) => ({
  devices: device.devices,
  models: model.models,
}))(Runtime);
