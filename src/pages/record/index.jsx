import { Button, message, Input, Select } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import moment from 'moment';
import ProTable from '@ant-design/pro-table';
import UpdateForm from './components/UpdateForm';
import { queryRule, updateRecord, removeRule } from './service';

const { Option } = Select;

/**
 *  删除节点
 * @param selectedRows
 */

const handleRemove = async (selectedRows) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    const deleteKey = selectedRows
      .map((row) => {
        return row.uid;
      })
      .join(',');
    const res = await removeRule(deleteKey);
    console.log('--deletedCount---');
    console.log(res.deletedCount);
    if (res.deletedCount > 0) {
      hide();
      message.success(`成功删除${res.deletedCount}条信息，即将刷新`);
      return true;
    } else {
      message.error('删除失败，请重试');
      return false;
    }
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const TableList = () => {
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef();
  const [selectedRowsState, setSelectedRows] = useState([]);
  const columns = [
    {
      title: '生产id',
      dataIndex: 'uid',
      hideInForm: true,
    },
    {
      title: '是否有缺陷',
      dataIndex: 'defect_alarm',
      render: (_, record) => (record.defect_alarm ? '有' : '无'),
      renderFormItem: (_, record) => (
        <Select defaultValue={record.defect_alarm} placeholder="请选择">
          <Option value={true}>有</Option>
          <Option value={false}>无</Option>
        </Select>
      ),
    },
    {
      title: '大小警告',
      dataIndex: 'size_alarm',
      render: (_, record) => (record.defect_alarm ? '是' : '否'),
      renderFormItem: (_, record) => (
        <Select defaultValue={record.defect_alarm} placeholder="请选择">
          <Option value={true}>是</Option>
          <Option value={false}>否</Option>
        </Select>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'time',
      valueType: 'dateRange',
      render: (_, record) => moment(record.time).format('YYYY-MM-DD HH:mm:ss'),
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status');

        if (`${status}` === '0') {
          return false;
        }

        if (`${status}` === '3') {
          return <Input {...rest} placeholder="请输入异常原因！" />;
        }

        return defaultRender(item);
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      width: 200,
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setStepFormValues(record);
            }}
          >
            修改
          </a>
        </>
      ),
    },
  ];
  return (
    <PageContainer
      pageHeaderRender={() => {
        return false;
      }}
    >
      <ProTable
        actionRef={actionRef}
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        request={async (params) => {
          console.log(params);
          // queryRule({ offset: (params.current - 1) * params.pageSize, limit: params.pageSize })
          const { pageSize, current, time, ...p } = params;
          const paramTemp = {
            ...p,
            offset: (current - 1) * pageSize,
            limit: pageSize,
            start_date: time && time[0],
            end_date: time && time[1],
            // 'device.uid': '2325287426'
          };
          const msg = await queryRule(paramTemp);
          return {
            data: msg.data || {},
            success: true,
            total: msg.meta.total,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
        headerTitle="生产记录表格"
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
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}

      {stepFormValues && Object.keys(stepFormValues).length ? (
        <UpdateForm
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          updateModalVisible={updateModalVisible}
        >
          <ProTable
            onSubmit={async (value) => {
              value.uid = stepFormValues.uid;
              const success = await updateRecord(value);
              console.log(success);
              if (success) {
                handleUpdateModalVisible(false);
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }
            }}
            rowKey="uid"
            type="form"
            form={{ initialValues: stepFormValues }}
            columns={columns}
          />
        </UpdateForm>
      ) : null}
    </PageContainer>
  );
};

export default TableList;
