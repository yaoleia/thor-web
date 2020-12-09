import React from 'react';
import Fabric from '@/components/Fabric/fabric';
import { connect } from 'umi';
import _ from 'lodash';
import io from 'socket.io-client';
import { Select, Form, message, Tag, Card, Descriptions } from 'antd';
import { bindDeviceModel, queryDevice, queryModel } from '@/services/bind';
import ProCard from '@ant-design/pro-card';
import moment from 'moment';
import styles from './style.less';

class Runtime extends React.Component {
  state = {
    ioResponseData: {},
    deviceData: [],
    deviceValue: '',
    modelData: [],
    modelValue: '',
  };
  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this.wsDisconnect();
  }

  async init(device_id = localStorage.currentDevice) {
    try {
      const [models, devices] = await Promise.all([queryModel(), queryDevice()]);
      let selectIndex = devices.data.findIndex((item) => item.uid === device_id);
      selectIndex = selectIndex === -1 ? 0 : selectIndex;
      const currentDevice = devices.data[selectIndex];
      device_id = _.get(currentDevice, 'uid');
      this.setState({
        modelData: models.data,
        deviceData: devices.data,
        deviceValue: device_id,
        modelValue: _.get(currentDevice, 'style.uid'),
      });
      this.socketCreate(device_id);
    } catch (error) {
      message.error(error);
    }
  }

  wsDisconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
    }
  };

  socketCreate = (rooms) => {
    this.wsDisconnect();
    localStorage.currentDevice = rooms;
    const socket = io(SOCKETIO, {
      query: { rooms },
    });

    socket.on('res', (res) => {
      const {
        data: { payload, action },
      } = res;
      switch (action) {
        case 'product':
          this.setState({
            ioResponseData: payload,
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
    this.socketCreate(device_id);
    const device = this.state.deviceData.find((item) => item.uid === device_id);
    this.setState({
      deviceValue: device_id,
      ioResponseData: {},
      modelValue: _.get(device, 'style.uid'),
    });
  };

  modelhandleChange = async (model_id) => {
    await bindDeviceModel({
      device_id: this.state.deviceValue,
      style_id: model_id,
    });
    message.success({ content: '型号更改成功！', key: 'changeModel' });
    this.setState({
      modelValue: model_id,
    });
  };

  getGroup = (arr) => {
    if (!Array.isArray(arr) || !arr.length) return;
    return _.groupBy(arr, 'label');
  };

  render() {
    const product = this.state.ioResponseData;
    const { defect_items, size_items, size_alarm, defect_alarm } = product;
    const defect_detail = this.getGroup(defect_items);
    const size_detail = this.getGroup(size_items);
    return (
      <div className={styles.runtimeContainer}>
        <Form layout="inline" className={styles.formSelect}>
          <Form.Item label="运行设备">
            <Select
              style={{ width: '200px' }}
              value={this.state.deviceValue}
              onChange={this.handleChange}
              dropdownClassName="hasUid"
            >
              {this.state.deviceData &&
                this.state.deviceData.map((item) => {
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
              value={this.state.modelValue}
              onChange={this.modelhandleChange}
              dropdownClassName="hasUid"
            >
              {this.state.modelData.map((item) => {
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

export default connect(() => ({}))(Runtime);
