import React, { useState } from 'react';
import { connect } from 'umi';
import { EditableProTable } from '@ant-design/pro-table';
import { SketchPicker } from 'react-color';
import { Typography, Popover, Button } from 'antd';

const { Text } = Typography;

const ColorPicker = ({ onChange, value }) => {
  return (
    <Popover
      content={
        <SketchPicker
          onChange={({ rgb: { r, g, b, a } }) => {
            onChange(typeof a === 'number' ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`);
          }}
          color={value}
        />
      }
      trigger="click"
    >
      <Button>
        {value ? (
          <Text style={{ background: value }} code>
            {value}
          </Text>
        ) : (
          '请选择颜色'
        )}
      </Button>
    </Popover>
  );
};

const columns = [
  {
    title: '字段值',
    dataIndex: 'field',
    formItemProps: {
      rules: [{ required: true, message: '请输入字段值' }],
    },
  },
  {
    title: '显示名称',
    dataIndex: 'name',
  },
  {
    title: '标注颜色',
    dataIndex: 'color',
    width: 180,
    renderFormItem: () => <ColorPicker />,
    render: (_, record) =>
      record.color && (
        <Text style={{ background: record.color }} code>
          {record.color}
        </Text>
      ),
  },
  {
    title: '操作',
    valueType: 'option',
    width: 150,
    render: (text, record, _, action) => [
      <a
        key="editable"
        onClick={() => {
          action.startEditable?.(record.uid);
        }}
      >
        编辑
      </a>,
    ],
  },
];
const TypeTable = ({ types, dispatch }) => {
  const [editableKeys, setEditableRowKeys] = useState([]);

  return (
    <EditableProTable
      rowKey="uid"
      recordCreatorProps={{
        position: 'top',
        record: { uid: 0 },
      }}
      toolBarRender={false}
      columns={columns}
      value={types}
      request={() => {
        return {
          data: types,
          total: types.length,
          success: true,
        };
      }}
      onChange={(data, preData) => {
        const editId = editableKeys[0];
        if (!editId) return;
        const type = data.find((t) => t.uid === editId);
        const pre_type = preData.find((t) => t.uid === editId);
        if (!type && pre_type) {
          dispatch({
            type: 'defect_type/remove',
            payload: editableKeys,
          });
        }
      }}
      editable={{
        editableKeys,
        onSave: (_, row) => {
          dispatch({
            type: `defect_type/${row.uid ? 'update' : 'add'}`,
            payload: row,
          });
        },
        onChange: setEditableRowKeys,
      }}
    />
  );
};

export default connect(({ defect_type, loading }) => ({
  types: defect_type.types,
  loading: loading.models.defect_type,
}))(TypeTable);
