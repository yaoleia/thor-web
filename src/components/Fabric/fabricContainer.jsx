import React from 'react';
import Fabric from './fabric';
import _ from 'lodash';
import ProCard from '@ant-design/pro-card';
import moment from 'moment';
import { Tag, Card, Descriptions } from 'antd';
import styles from './style.less';

class FabricContainer extends React.PureComponent {
  getGroup = (arr) => {
    if (!Array.isArray(arr) || !arr.length) return;
    return _.groupBy(arr, 'label');
  };
  render() {
    const { product } = this.props;
    const { defect_items, size_items, size_alarm, defect_alarm } = product;
    const defect_detail = this.getGroup(defect_items);
    const size_detail = this.getGroup(size_items);
    return (
      <div className={styles.fabricContainer}>
        <ProCard colSpan="25%" className={styles.leftMsg}>
          {product.uid && (
            <Descriptions column={1} title="检测结果">
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
            </Descriptions>
          )}
        </ProCard>
        <Fabric product={product} className={styles.canvasContainer} />
      </div>
    );
  }
}
export default FabricContainer;
