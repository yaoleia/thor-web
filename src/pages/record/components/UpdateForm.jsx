import React from 'react';
import { Modal } from 'antd';

const UpdateForm = (props) => {
  const { updateModalVisible, onCancel } = props;
  return (
    <Modal
      destroyOnClose
      title="修改生产记录"
      visible={updateModalVisible}
      onCancel={() => onCancel()}
      footer={null}
    >
      {props.children}
    </Modal>
  );
};

export default UpdateForm;
