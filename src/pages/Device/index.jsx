import React, { useState, useRef, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Modal } from 'antd';
import { connect } from 'umi';
import moment from 'moment';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const TableList = ({ devices, dispatch, loading }) => {
  const [createModalVisible, handleModalVisible] = useState(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [updateValues, setUpdateValues] = useState({});
  const actionRef = useRef();
  const [selectedRowsState, setSelectedRows] = useState([]);
  const columns = [
    {
      title: '设备ID',
      dataIndex: 'uid',
      hideInForm: true,
      copyable: true,
    },
    {
      title: '设备名称',
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
      title: '设备IP',
      dataIndex: 'ip',
      valueType: 'input',
      search: false,
    },
    {
      title: '硬件URL',
      dataIndex: 'camera_server',
      valueType: 'textarea',
      ellipsis: true,
      search: false,
    },
    {
      title: '模型URL',
      dataIndex: 'model_server',
      valueType: 'textarea',
      ellipsis: true,
      search: false,
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
      dataIndex: 'option',
      valueType: 'option',
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
                content: `确定删除设备(${record.uid})吗？`,
                okText: '确认',
                cancelText: '取消',
                centered: true,
                maskClosable: true,
                onOk: () =>
                  dispatch({
                    type: 'device/removeModel',
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
  }, [devices]);

  const requestFilter = ({ uid: s_uid, name: s_name }) => {
    const filtered = devices.filter((device) => {
      const { uid, name } = device;
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
        search={{
          labelWidth: 100,
        }}
        pagination={false}
        toolBarRender={() => [
          <Button type="primary" key="show" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 添加设备
          </Button>,
        ]}
        request={requestFilter}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
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
                type: 'device/removeModel',
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
              type: 'device/addModel',
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
          onCancel={() => handleUpdateModalVisible(false)}
          modalVisible={updateModalVisible}
        >
          <ProTable
            onSubmit={async (value) => {
              value.uid = updateValues.uid;
              dispatch({
                type: 'device/updateModel',
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

export default connect(({ device, loading }) => ({
  devices: device.devices,
  loading: loading.models.device,
}))(TableList);
