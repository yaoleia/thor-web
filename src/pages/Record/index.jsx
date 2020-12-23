import { Button, message, Select, Modal, Divider, Badge, Spin, Image, Tag, Typography } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import { connect } from 'umi';
import hotkeys from 'hotkeys-js';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { queryRecord, updateRecord, removeRecord, getRecordById } from '@/services/record';
import FabricContainer from '@/components/Fabric/fabricContainer';
import ModalForm from '@/components/ModalForm';
import styles from './style.less';

const { Option } = Select;
const { Text } = Typography;

/**
 *  删除节点
 * @param selectedRows
 */

const handleRemove = async (selectedRows) => {
  const hide = message.loading({ content: '正在删除', key: 'removeRecord' });
  if (!selectedRows) return true;
  try {
    const deleteKey = selectedRows.map((row) => row.uid).join(',');
    const res = await removeRecord(deleteKey);
    if (!(res.deletedCount > 0)) {
      hide();
      message.error('删除失败，请重试');
      return false;
    }
    message.success({ content: `成功删除${res.deletedCount}条记录`, key: 'removeRecord' });
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const TableList = ({ patterns, devices }) => {
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [detailModalVisible, handleDetailModalVisible] = useState(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const [detailValues, setDetailValues] = useState({});
  const [selectedRowsState, setSelectedRows] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const actionRef = useRef();

  const showDetail = async (record) => {
    try {
      setDetailLoading(true);
      handleDetailModalVisible(true);
      const detail = await getRecordById(record.uid);
      detail.indexTemp = record.indexTemp;
      setDetailValues(detail);
    } catch (error) {
      message.error('详情信息获取失败！');
    } finally {
      setDetailLoading(false);
    }
  };

  const nextPrev = (num = 1, disabled) => {
    if (!detailValues.uid || detailLoading) return;
    const index = dataList.findIndex((d) => d.uid === detailValues.uid);
    const item = dataList[index + num];
    if (disabled) return !item;
    if (!item) return;
    showDetail(item);
  };

  useEffect(() => {
    hotkeys('left,right', (event) => {
      nextPrev(event.key === 'ArrowLeft' ? -1 : 1);
    });
    return function cleanup() {
      hotkeys.unbind('left,right');
    };
  }, [dataList, detailValues, detailLoading]);

  const ColSelect = ({ value, onChange, children }) => (
    <Select
      defaultValue={value}
      onChange={onChange}
      className={styles.nameSelect}
      allowClear
      placeholder="请选择"
      dropdownClassName="hasUid"
    >
      {children}
    </Select>
  );

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      search: false,
      hideInForm: true,
      width: 80,
      render: (_, record) => record.indexTemp,
    },
    {
      title: 'ID',
      dataIndex: 'uid',
      hideInForm: true,
      copyable: true,
      ellipsis: true,
    },
    {
      title: '模板名称',
      dataIndex: 'pattern_uid',
      valueType: 'text',
      hideInForm: true,
      renderFormItem: () => (
        <ColSelect>
          {patterns.map((p) => (
            <Option value={p.uid} key={p.uid}>
              <Text ellipsis>{p.name}</Text>
              {p.sample_image ? (
                <Image src={p.sample_image} preview={false} width={110} />
              ) : (
                <Tag>{p.uid}</Tag>
              )}
            </Option>
          ))}
        </ColSelect>
      ),
      renderText: (_, record) => {
        const pattern = patterns.find((p) => p.uid === record.pattern.uid);
        return pattern ? pattern.name : record.pattern.name;
      },
    },
    {
      title: '设备名称',
      dataIndex: 'device_uid',
      valueType: 'text',
      hideInForm: true,
      renderFormItem: () => (
        <ColSelect>
          {devices.map((d) => (
            <Option value={d.uid} key={d.uid}>
              <Text ellipsis>{d.name}</Text>
              <Tag>{d.uid}</Tag>
            </Option>
          ))}
        </ColSelect>
      ),
      renderText: (_, record) => {
        const device = devices.find((p) => p.uid === record.device.uid);
        return device ? device.name : record.device.name;
      },
    },
    {
      title: '缺陷状态',
      dataIndex: 'defect_alarm',
      render: (_, record) =>
        record.defect_alarm ? (
          <Badge status="error" text="NG" />
        ) : (
          <Badge status="success" text="OK" />
        ),
      renderFormItem: () => (
        <ColSelect>
          <Option value>NG</Option>
          <Option value={false}>OK</Option>
        </ColSelect>
      ),
    },
    {
      title: '尺寸状态',
      dataIndex: 'size_alarm',
      render: (_, record) =>
        record.size_alarm ? (
          <Badge status="error" text="NG" />
        ) : (
          <Badge status="success" text="OK" />
        ),
      renderFormItem: () => (
        <ColSelect>
          <Option value>NG</Option>
          <Option value={false}>OK</Option>
        </ColSelect>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'time',
      valueType: 'dateRange',
      hideInForm: true,
      render: (_, record) => moment(record.time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      dataIndex: 'option',
      width: 180,
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
          <Divider type="vertical" />
          <a
            onClick={() => {
              Modal.confirm({
                title: '删除生产记录',
                content: `确定删除该条生产记录(${record.uid})吗？`,
                okText: '确认',
                cancelText: '取消',
                centered: true,
                maskClosable: true,
                onOk: async () => {
                  const success = await handleRemove([record]);
                  if (success) {
                    if (actionRef.current) {
                      actionRef.current.reload();
                    }
                  }
                },
              });
            }}
          >
            删除
          </a>
          <Divider type="vertical" />
          <a onClick={() => showDetail(record)}>详情</a>
        </>
      ),
    },
  ];
  return (
    <PageContainer>
      <ProTable
        actionRef={actionRef}
        search={{
          labelWidth: 100,
        }}
        request={async (params) => {
          const {
            pageSize,
            current,
            time,
            uid,
            defect_alarm,
            size_alarm,
            pattern_uid,
            device_uid,
          } = params;
          const paramTemp = {
            offset: (current - 1) * pageSize,
            limit: pageSize,
            start_date: time && new Date(time[0]).getTime(),
            end_date: time && new Date(time[1]).getTime(),
            uid: uid || undefined,
            defect_alarm,
            size_alarm,
            'pattern.uid': pattern_uid || undefined,
            'device.uid': device_uid || undefined,
          };
          const resp = await queryRecord(paramTemp);
          if (!resp) {
            message.error('查询失败, 请稍后重试！');
            return { success: false };
          }
          resp.data.map((item, index) => {
            item.indexTemp = index + 1 + (current - 1) * pageSize;
            return item;
          });
          setDataList(resp.data);
          return {
            data: resp.data,
            success: true,
            total: resp.meta.total,
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
              条记录&nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={() => {
              Modal.confirm({
                title: '删除生产记录',
                content: `确定删除选中的${
                  selectedRowsState.length
                }条生产记录(${selectedRowsState.map((r) => r.uid)})吗？`,
                okText: '确认',
                cancelText: '取消',
                centered: true,
                maskClosable: true,
                onOk: async () => {
                  await handleRemove(selectedRowsState);
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
              });
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}

      {stepFormValues && Object.keys(stepFormValues).length ? (
        <ModalForm
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          modalVisible={updateModalVisible}
          title="修改生产记录"
        >
          <ProTable
            onSubmit={async (value) => {
              value.uid = stepFormValues.uid;
              const success = await updateRecord(value);
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
        </ModalForm>
      ) : null}
      <Modal
        bodyStyle={{ padding: 0 }}
        width="70%"
        title={
          <div className="detailModalTitle">
            <span>{`检测详情${detailValues.uid ? ` - ${detailValues.uid}` : ''}`}</span>
            {detailValues.indexTemp && (
              <Spin wrapperClassName={styles.nextPrevWrap} spinning={detailLoading}>
                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  disabled={nextPrev(-1, true)}
                  onClick={() => nextPrev(-1)}
                />
                <span> {detailValues.indexTemp || ''} </span>
                <Button
                  type="text"
                  shape="circle"
                  icon={<RightOutlined />}
                  disabled={nextPrev(1, true)}
                  onClick={() => nextPrev(1)}
                />
              </Spin>
            )}
          </div>
        }
        visible={detailModalVisible}
        onCancel={() => {
          handleDetailModalVisible(false);
          setDetailValues({});
        }}
        footer={null}
      >
        <Spin wrapperClassName={styles.detailWrap} spinning={detailLoading}>
          <FabricContainer title={null} product={detailValues}></FabricContainer>
        </Spin>
      </Modal>
    </PageContainer>
  );
};

export default connect(({ device, pattern }) => ({
  devices: device.devices,
  patterns: pattern.patterns,
}))(TableList);
