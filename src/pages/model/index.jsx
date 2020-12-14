import React, { useState, useRef, useEffect } from 'react';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { Button, message, Input, Upload, Divider, Modal } from 'antd';
import { connect } from 'umi';
import moment from 'moment';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const { Dragger } = Upload;

const TableList = ({ models, dispatch, loading }) => {
  const [createModalVisible, handleModalVisible] = useState(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [updateValues, setUpdateValues] = useState({});
  const actionRef = useRef();
  const [selectedRowsState, setSelectedRows] = useState([]);
  const columns = [
    {
      title: '模型id',
      dataIndex: 'uid',
      hideInForm: true,
      copyable: true,
    },
    {
      title: '模型名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '名称为必填项',
          },
        ],
      },
    },
    {
      title: '缺陷地址',
      dataIndex: 'defect_model',
      valueType: 'textarea',
      ellipsis: true,
      search: false,
    },
    {
      title: '模型地址',
      dataIndex: 'size_model',
      search: false,
      disabled: true,
      ellipsis: true,
      renderFormItem: (_, { defaultRender }, form) => {
        return defaultRender(
          <>
            <Input value={form.getFieldValue('size_model')} placeholder="请选择模型地址" />
            <Dragger
              name="file"
              action="/api/upload"
              fileList={[]}
              onChange={(info) => {
                const { status } = info.file;
                if (status !== 'uploading') {
                  console.log(info.file, info.fileList);
                }
                if (status === 'done') {
                  message.success(`${info.file.name} 上传成功`);
                  form.setFieldsValue({ size_model: info.file.response[0].url });
                } else if (status === 'error') {
                  message.error(`${info.file.name} 上传失败`);
                }
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
            </Dragger>
          </>,
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'time',
      valueType: 'dateTimeRange',
      hideInForm: true,
      search: false,
      render: (_, record) => moment(record.time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setUpdateValues(record);
            }}
          >
            修改
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              Modal.confirm({
                title: '删除设备',
                content: `确定删除模型(${record.uid})吗？`,
                okText: '确认',
                cancelText: '取消',
                centered: true,
                maskClosable: true,
                onOk: () =>
                  dispatch({
                    type: 'model/removeModel',
                    payload: [record.uid],
                  }),
              });
            }}
          >
            删除
          </a>
        </>
      ),
    },
  ];
  useEffect(() => {
    setSelectedRows([]);
    actionRef.current?.reloadAndRest?.();
  }, [models]);

  const requestFilter = ({ uid: s_uid, name: s_name }) => {
    const filtered = models.filter((model) => {
      const { uid, name } = model;
      return (
        (!s_uid || uid.toLowerCase().includes(s_uid)) &&
        (!s_name || name.toLowerCase().includes(s_name))
      );
    });
    return {
      data: filtered,
      success: true,
      total: filtered.length,
    };
  };
  return (
    <PageContainer>
      <ProTable
        loading={loading}
        actionRef={actionRef}
        pagination={false}
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        toolBarRender={() => [
          <Button type="primary" key="show" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 添加模型
          </Button>,
        ]}
        request={requestFilter}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
        headerTitle="查询表格"
        rowKey="uid"
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项&nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              if (!selectedRowsState) return true;
              dispatch({
                type: 'model/removeModel',
                payload: selectedRowsState.map((row) => row.uid),
              });
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      <CreateForm onCancel={() => handleModalVisible(false)} modalVisible={createModalVisible}>
        <ProTable
          onSubmit={(value) => {
            dispatch({
              type: 'model/addModel',
              payload: { ...value },
            });
            handleModalVisible(false);
          }}
          rowKey="uid"
          type="form"
          columns={columns}
        />
      </CreateForm>
      {updateValues && Object.keys(updateValues).length ? (
        <UpdateForm
          onCancel={() => {
            handleUpdateModalVisible(false);
            setUpdateValues({});
          }}
          modalVisible={updateModalVisible}
        >
          <ProTable
            onSubmit={async (value) => {
              value.uid = updateValues.uid;
              dispatch({
                type: 'model/updateModel',
                payload: { ...value },
              });
              handleUpdateModalVisible(false);
            }}
            rowKey="uid"
            type="form"
            form={{ initialValues: updateValues }}
            columns={columns}
          />
        </UpdateForm>
      ) : null}
    </PageContainer>
  );
};

export default connect(({ model, loading }) => ({
  models: model.models,
  loading: loading.models.model,
}))(TableList);
