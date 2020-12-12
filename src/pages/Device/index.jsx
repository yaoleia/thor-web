import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { connect } from 'umi';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import moment from 'moment';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const TableList = (props) => {
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
      width: 150,
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
      width: 150,
    },
    {
      title: '设备IP',
      dataIndex: 'ip',
      valueType: 'input',
      width: 150,
    },
    {
      title: '硬件服务地址',
      dataIndex: 'camera_server',
      valueType: 'textarea',
      ellipsis: true,
      search: false,
    },
    {
      title: '模型服务地址',
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
        </>
      ),
    },
  ];

  const { devices, dispatch } = props;
  return (
    <PageContainer>
      <ProTable
        actionRef={actionRef}
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        pagination={false}
        toolBarRender={() => [
          <Button type="primary" key="show" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 添加设备
          </Button>,
        ]}
        request={async () => {
          return {
            data: devices,
            success: true,
            total: devices.length,
          };
        }}
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
              await dispatch({
                type: 'device/removeModel',
                payload: selectedRowsState.map((row) => row.uid),
              });
              await dispatch({
                type: 'device/fetch',
              });
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      <CreateForm onCancel={() => handleModalVisible(false)} modalVisible={createModalVisible}>
        <ProTable
          onSubmit={async (value) => {
            // TODO: 这不是promise的
            await dispatch({
              type: 'device/addModel',
              payload: { ...value },
            });
            await dispatch({
              type: 'device/fetch',
            });
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
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
              await dispatch({
                type: 'device/updateModel',
                payload: { ...value },
              });
              await dispatch({
                type: 'device/fetch',
              });
              handleUpdateModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
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

export default connect(({ device }) => ({
  devices: device.devices,
}))(TableList);
