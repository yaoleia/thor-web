import React from 'react';
import { Modal, Input, Form, Button, message } from 'antd';
import { connect } from 'umi';
import { putCurrent } from '@/services/user';

const ChangePwd = ({ modalVisible, onCancel, dispatch }) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = React.useState(false);

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };

  const hideModal = () => {
    if (confirmLoading) return;
    onCancel();
  };

  const onFinish = async ({ pre_password, new_password }) => {
    setConfirmLoading(true);
    const resp = await putCurrent({ pre_password, new_password });
    if (resp.username) {
      hideModal();
      dispatch({
        type: 'login/logout',
      });
      message.success('修改密码成功，请重新登录！');
    }
    setConfirmLoading(false);
  };

  const checkPsd = (value, callback) => {
    const new_password = form.getFieldValue('new_password');
    if (value && new_password && new_password !== value) {
      callback(new Error('两次密码输入不一致'));
    } else {
      callback();
    }
  };

  return (
    <Modal title="修改密码" visible={modalVisible} onCancel={() => hideModal()} footer={null}>
      <Form {...layout} name="basic" form={form} onFinish={onFinish}>
        <Form.Item
          label="旧密码"
          name="pre_password"
          rules={[{ required: true, message: '请输入旧密码!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="新密码"
          name="new_password"
          rules={[{ required: true, message: '请输入新密码!' }, { max: 20 }, { min: 5 }]}
          validateTrigger="onBlur"
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="新密码确认"
          name="confirm_password"
          rules={[
            { required: true, message: '请再次输入新密码!' },
            {
              validator: (_, value, callback) => {
                checkPsd(value, callback);
              },
            },
          ]}
          validateTrigger="onBlur"
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 6,
            span: 16,
          }}
        >
          <Button
            loading={confirmLoading}
            type="primary"
            style={{ marginRight: 10 }}
            htmlType="submit"
          >
            确认修改
          </Button>
          <Button htmlType="button" onClick={() => hideModal()}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default connect()(ChangePwd);
