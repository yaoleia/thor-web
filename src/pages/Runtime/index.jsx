import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import _ from 'lodash';
import io from 'socket.io-client';
import { Select, Form, message, Tag, Image, Typography } from 'antd';
import FabricContainer from '@/components/Fabric/fabricContainer';
import styles from './style.less';

const { Text } = Typography;
class Runtime extends React.PureComponent {
  state = { product: {} };

  componentDidMount() {
    this.socketCreate(this.props.currentDevice);
  }

  componentWillUnmount() {
    this.wsClose();
  }

  componentDidUpdate({ currentDevice: preDevice }) {
    if (this.wsErrorHide) {
      this.wsErrorHide();
    }
    const { currentDevice } = this.props;
    if (preDevice.uid === currentDevice.uid) return;
    this.setState({ product: {} });
    this.socketCreate(currentDevice);
  }

  wsClose = () => {
    if (!this.socket) return;
    this.socket.close();
    this.socket = null;
  };

  socketCreate = ({ uid: rooms }) => {
    this.wsClose();
    if (!rooms) return;
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
          this.setState({ product: payload });
          break;
        default:
          this.wsErrorHide = message.error({
            content: _.get(payload, 'msg.code') || _.get(payload, 'msg.error') || payload.msg,
            key: 'wsError',
            duration: 3,
            onClose: () => {
              this.wsErrorHide = null;
            },
          });
          break;
      }
    });
    window.socket = socket;
    this.socket = socket;
  };
  handleChange = (device_id) => {
    const device = this.props.devices.find((item) => item.uid === device_id);
    this.deviceRef.blur();
    this.props.dispatch({
      type: 'device/setCurrent',
      payload: device,
    });
  };

  patternHandleChange = async (pattern_id) => {
    const { dispatch, currentDevice } = this.props;
    this.patternRef.blur();
    dispatch({
      type: 'device/bind',
      payload: {
        device_id: currentDevice.uid,
        pattern_id,
      },
    });
  };
  render() {
    const { devices, currentDevice, patterns, loading } = this.props;
    const { product } = this.state;
    const pattern_id = _.get(currentDevice, 'pattern.uid');
    return (
      <PageContainer pageHeaderRender={() => false} className={styles.runtimeContainer}>
        <Form layout="inline" className={styles.formSelect}>
          <Form.Item label="运行设备">
            <Select
              ref={(ref) => {
                this.deviceRef = ref;
              }}
              disabled={loading}
              placeholder="请选择运行设备"
              style={{ width: '240px' }}
              value={currentDevice.uid}
              onChange={this.handleChange}
              dropdownClassName="hasUid"
            >
              {devices &&
                devices.map((item) => {
                  return (
                    <Select.Option value={item.uid} key={item.uid}>
                      <Text ellipsis>{item.name}</Text>
                      <Tag>{item.uid}</Tag>
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>
          {currentDevice.uid && (
            <Form.Item label="检测模板">
              <Select
                ref={(ref) => {
                  this.patternRef = ref;
                }}
                disabled={loading}
                loading={loading}
                placeholder="当前设备还未绑定模板"
                style={{ width: '240px' }}
                value={pattern_id}
                onChange={this.patternHandleChange}
                dropdownClassName="hasUid"
              >
                {patterns.map((item) => {
                  return (
                    <Select.Option value={item.uid} key={item.uid}>
                      <Text ellipsis>{item.name}</Text>
                      {item.sample_image ? (
                        <Image src={item.sample_image} preview={false} width={110} />
                      ) : (
                        <Tag>{item.uid}</Tag>
                      )}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          )}
        </Form>
        <div className={styles.fabricDiv}>
          <FabricContainer product={product}></FabricContainer>
        </div>
      </PageContainer>
    );
  }
}

export default connect(({ device, pattern, loading }) => ({
  devices: device.devices,
  currentDevice: device.current,
  patterns: pattern.patterns,
  loading: loading.models.device,
}))(Runtime);
