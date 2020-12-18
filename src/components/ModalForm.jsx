import React from 'react';
import { Modal } from 'antd';

const CreateForm = (props) => {
  const { modalVisible, onCancel, wrapClassName, title } = props;
  return (
    <Modal
      centered
      wrapClassName={wrapClassName}
      destroyOnClose
      title={title}
      visible={modalVisible}
      onCancel={() => onCancel()}
      footer={null}
    >
      {props.children}
    </Modal>
  );
};

export default CreateForm;
