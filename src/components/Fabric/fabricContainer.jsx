import React from 'react';
import { connect } from 'umi';
import _ from 'lodash';
import moment from 'moment';
import { Tag, Card, Descriptions } from 'antd';
import ProCard from '@ant-design/pro-card';
import AsyncFabric from './AsyncFabric';
import styles from './style.less';

class FabricContainer extends React.PureComponent {
  getGroup = (arr, attr = 'label') => {
    if (!Array.isArray(arr) || !arr.length) return;
    return _.groupBy(arr, attr);
  };

  getTypeConfig = (type) => {
    const { types = [] } = this.props;
    const groupType = this.getGroup(types, 'field');
    return _.get(groupType[type], '[0]') || { name: type, color: '#888' };
  };

  render() {
    const { product, title } = this.props;
    const { defect_items, size_items, size_alarm, defect_alarm } = product;
    const defect_detail = this.getGroup(defect_items);
    const size_detail = this.getGroup(size_items);
    return (
      <div className={styles.fabricContainer}>
        <ProCard colSpan="25%" className={styles.leftMsg}>
          {product.uid && (
            <Descriptions
              column={1}
              layout="vertical"
              size="middle"
              title={title === undefined ? `ID: ${product.uid}` : title}
            >
              <Descriptions.Item label="检测时间">
                {moment(product.time).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              {defect_detail && (
                <Descriptions.Item className={styles.defectDetail} label="缺陷详情">
                  {Object.keys(defect_detail).map((defect) => (
                    <Tag color={this.getTypeConfig(defect).color} key={defect}>
                      {this.getTypeConfig(defect).name}: {defect_detail[defect].length}
                    </Tag>
                  ))}
                </Descriptions.Item>
              )}
              {size_detail && (
                <Descriptions.Item className={styles.defectDetail} label="尺寸详情">
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
                    缺陷: {defect_alarm ? 'NG' : 'OK'}
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
            </Descriptions>
          )}
        </ProCard>
        <AsyncFabric
          product={product}
          getTypeConfig={this.getTypeConfig}
          className={styles.canvasContainer}
        />
      </div>
    );
  }
}
export default connect(({ defect_type }) => ({
  types: defect_type.types,
}))(FabricContainer);
