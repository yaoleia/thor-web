import React from 'react';
import { Modal } from 'antd';

const CreateForm = (props) => {
  const { modalVisible, onCancel, wrapClassName } = props;
  return (
    <Modal
      centered
      wrapClassName={wrapClassName}
      destroyOnClose
      title="新建模板"
      visible={modalVisible}
      onCancel={() => onCancel()}
      footer={null}
    >
      {props.children}
    </Modal>
  );
};

export default CreateForm;
