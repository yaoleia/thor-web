import React, { useState, useRef, useEffect } from 'react';
import { PlusOutlined, UploadOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Button, message, Image, Upload, Divider, Modal, Typography, Progress } from 'antd';
import { connect } from 'umi';
import lodash from 'lodash';
import moment from 'moment';
import DefectType from '@/components/DefectType';
import AsyncFabric from '@/components/Fabric/AsyncFabric';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import ModalForm from '@/components/ModalForm';
import styles from './style.less';

const { Paragraph, Text, Link } = Typography;
const { Dragger } = Upload;

const SampleView = ({ value, onChange }) => {
  const props = {
    data: {
      type: 'sample',
    },
    accept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
    className: styles.sampleUpload,
    showUploadList: false,
    name: 'file',
    action: '/api/upload',
    onChange({ file: { status, name, response } }) {
      if (status === 'done') {
        message.success(`${name} 上传模板图成功`);
        onChange(lodash.get(response, '[0].url'));
      } else if (status === 'error') {
        message.error(`${name} 模板图上传失败！`);
      }
    },
  };
  return (
    <Dragger {...props}>
      {value ? <AsyncFabric product={{ thumbnail_url: value, uid: 1 }} /> : <PlusOutlined />}
      {value && (
        <CloseCircleFilled
          role="button"
          className="ant-input-clear-icon"
          onClick={(e) => {
            onChange('');
            e.stopPropagation();
          }}
        />
      )}
    </Dragger>
  );
};

const UploadRender = ({ form, value, paramMd5, param }) => {
  const [percent, setPercent] = useState();

  const handleChange = ({ file: { status, name, response }, event }) => {
    if (status === 'uploading' && event) {
      setPercent(parseInt(event.percent, 10));
    }
    if (status === 'done') {
      message.success(`${name} 上传模型成功`);
      const { url, md5 } = response[0];
      form.setFieldsValue({
        [param]: url,
        [paramMd5]: md5,
      });
      setPercent();
    } else if (status === 'error') {
      message.error(`${name} 上传模型失败`);
      setPercent();
    }
  };
  return (
    <Dragger
      accept=".pth"
      className={styles.uploadDragger}
      name="file"
      action="/api/upload"
      showUploadList={false}
      data={{ md5: true, type: 'pattern' }}
      onChange={handleChange}
    >
      {value && (
        <Paragraph
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Paragraph ellipsis={{ rows: 2 }}>
            <Text keyboard>url</Text>
            <Link href={value} target="_blank">
              {value}
            </Link>
          </Paragraph>
          <Paragraph ellipsis={{ rows: 1 }}>
            <Text keyboard>md5</Text> <Text>{form.getFieldValue([paramMd5])}</Text>
          </Paragraph>
          <CloseCircleFilled
            role="button"
            className="ant-input-clear-icon"
            onClick={() => {
              form.setFieldsValue({
                [param]: '',
                [paramMd5]: '',
              });
            }}
          />
        </Paragraph>
      )}
      {percent ? (
        <Progress
          className="ant-upload-text"
          strokeColor={{
            from: '#108ee9',
            to: '#87d068',
          }}
          percent={percent}
          status="active"
        />
      ) : (
        <Text code className="ant-upload-text">
          <UploadOutlined /> 点击/拖拽到该区域内上传 (.pth)
        </Text>
      )}
    </Dragger>
  );
};

const TableList = ({ patterns, dispatch, loading }) => {
  const [defectTypeModalVisible, handleDefectTypeModalVisible] = useState(false);
  const [createModalVisible, handleModalVisible] = useState(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [updateValues, setUpdateValues] = useState({});
  const [selectedRowsState, setSelectedRows] = useState([]);
  const actionRef = useRef();

  const columns = [
    {
      order: 7,
      dataIndex: 'defect_md5',
      search: false,
      hideInTable: true,
      valueType: 'input',
      fieldProps: {
        style: {
          display: 'none',
        },
      },
    },
    {
      title: '序号',
      valueType: 'index',
      search: false,
      hideInForm: true,
      width: 60,
    },
    {
      title: '模板ID',
      dataIndex: 'uid',
      order: 8,
      hideInForm: true,
      copyable: true,
      width: 150,
    },
    {
      title: '模板名称',
      dataIndex: 'name',
      order: 6,
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
      dataIndex: 'size_md5',
      search: false,
      order: 5,
      hideInTable: true,
      valueType: 'input',
      fieldProps: {
        style: {
          display: 'none',
        },
      },
    },
    {
      title: '模板图',
      order: 3,
      dataIndex: 'sample_image',
      search: false,
      width: 220,
      renderFormItem: () => <SampleView />,
      render: (_, record) => <Image width={200} src={record.sample_image} />,
    },
    {
      title: '缺陷模型',
      order: 4,
      dataIndex: 'defect_model',
      ellipsis: true,
      search: false,
      renderFormItem: (_, __, form) => (
        <UploadRender form={form} param="defect_model" paramMd5="defect_md5" />
      ),
    },
    {
      title: '尺寸模型',
      order: 2,
      dataIndex: 'size_model',
      search: false,
      ellipsis: true,
      renderFormItem: (_, __, form) => (
        <UploadRender form={form} param="size_model" paramMd5="size_md5" />
      ),
    },
    {
      title: '尺寸标准值',
      order: 1,
      dataIndex: 'size_standard',
      search: false,
      hideInTable: true,
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
            onClick={() =>
              Modal.confirm({
                title: '删除模板',
                content: `确定删除模板(${record.uid})吗？`,
                okText: '确认',
                cancelText: '取消',
                centered: true,
                maskClosable: true,
                onOk: () =>
                  dispatch({
                    type: 'pattern/remove',
                    payload: [record.uid],
                  }),
              })
            }
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
    dispatch({
      type: 'device/fetch',
    });
  }, [patterns]);

  const requestFilter = ({ uid: s_uid, name: s_name }) => {
    const filtered = patterns.filter((pattern) => {
      const { uid, name } = pattern;
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
    <PageContainer
      extra={
        <Button type="primary" onClick={() => handleDefectTypeModalVisible(true)}>
          缺陷类型配置
        </Button>
      }
    >
      <ProTable
        loading={loading}
        actionRef={actionRef}
        pagination={false}
        search={{
          labelWidth: 100,
          defaultCollapsed: false,
        }}
        toolBarRender={() => [
          <Button type="primary" key="show" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建模板
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
            onClick={() =>
              Modal.confirm({
                title: '删除模板',
                content: `确定删除选中的${selectedRowsState.length}个模板(${selectedRowsState.map(
                  (r) => r.uid,
                )})吗？`,
                okText: '确认',
                cancelText: '取消',
                centered: true,
                maskClosable: true,
                onOk: () =>
                  dispatch({
                    type: 'pattern/remove',
                    payload: selectedRowsState.map((row) => row.uid),
                  }),
              })
            }
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        onCancel={() => handleDefectTypeModalVisible(false)}
        modalVisible={defectTypeModalVisible}
        title="缺陷类型配置"
        width="800px"
        bodyStyle={{
          height: '60vh',
          overflow: 'auto',
        }}
      >
        <DefectType></DefectType>
      </ModalForm>
      <ModalForm
        wrapClassName={styles.patternForm}
        onCancel={() => handleModalVisible(false)}
        modalVisible={createModalVisible}
        title="新建模板"
      >
        <ProTable
          onSubmit={(value) => {
            dispatch({
              type: 'pattern/add',
              payload: { ...value },
            });
            handleModalVisible(false);
          }}
          rowKey="uid"
          type="form"
          columns={columns}
        />
      </ModalForm>
      {updateValues && Object.keys(updateValues).length ? (
        <ModalForm
          wrapClassName={styles.patternForm}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setUpdateValues({});
          }}
          modalVisible={updateModalVisible}
          title={`修改模板 - ${updateValues.uid}`}
        >
          <ProTable
            onSubmit={(value) => {
              value.uid = updateValues.uid;
              dispatch({
                type: 'pattern/update',
                payload: { ...value },
              });
              handleUpdateModalVisible(false);
            }}
            rowKey="uid"
            type="form"
            form={{ initialValues: updateValues }}
            columns={columns}
          />
        </ModalForm>
      ) : null}
    </PageContainer>
  );
};

export default connect(({ pattern, loading }) => ({
  patterns: pattern.patterns,
  loading: loading.models.pattern,
}))(TableList);
