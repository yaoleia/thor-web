import React from 'react';
import { Modal } from 'antd';

const UpdateForm = (props) => {
  const { modalVisible, onCancel, wrapClassName } = props;
  return (
    <Modal
      centered
      wrapClassName={wrapClassName}
      destroyOnClose
      title="修改模板"
      visible={modalVisible}
      onCancel={() => onCancel()}
      footer={null}
    >
      {props.children}
    </Modal>
  );
};

export default UpdateForm;
