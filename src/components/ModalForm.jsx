import React from 'react';
import { Modal } from 'antd';

const CreateForm = (props) => {
  const { modalVisible, onCancel, children, ...rest } = props;
  return (
    <Modal
      centered
      destroyOnClose
      visible={modalVisible}
      onCancel={() => onCancel()}
      footer={null}
      {...rest}
    >
      {children}
    </Modal>
  );
};

export default CreateForm;
