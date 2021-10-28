import React, { useState, useEffect } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, message } from 'antd';
interface Item {
  plotId: string;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  record: Item;
  index: number;
  children: React.ReactNode;
}
const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  ...restProps
}) => {
  return (
    <td {...restProps}>
      {editing ? (
        dataIndex == 'personType' ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `*必填`,
              },
            ]}
          >
            <Input style={{ width: '100%' }} />
          </Form.Item>
        ) : (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `*必填`,
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        )
      ) : (
        children
      )}
    </td>
  );
};
interface RoadTableProps {
  handleOnUpdateTable: Function;
  plotInfo: any;
}
const RoadTable: React.FC<RoadTableProps> = (props) => {
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState<any>([]);
  const [editingKey, setEditingKey] = useState<any>('');
  const { handleOnUpdateTable, plotInfo } = props;
  useEffect(() => {
    // console.log(plotInfo);
    let newTableData = [];
    if (plotInfo) {
      newTableData = plotInfo.tripDivision;
    }
    handleOnUpdateTable(newTableData);
    setTableData(newTableData);
  }, []);
  const isEditing = (index: number) => index === editingKey;
  const handleOnEdit = (record: Item, index: number) => {
    form.setFieldsValue({ ...record });
    setEditingKey(index);
  };

  const cancel = () => {
    setEditingKey('');
  };
  const hanldeOnSave = async (index: any) => {
    try {
      const row: any = (await form.validateFields()) as Item;
      const newData = [...tableData];
      // const index = newData.findIndex((item, index1) => index === index1);
      if (index != -1) {
        const item = newData[index];
        let newTotal =
          Number(row.rail) +
          Number(row.bus) +
          Number(row.car) +
          Number(row.taxi) +
          Number(row['non-motor']) +
          Number(row.walk);
        if (newTotal != 100) {
          message.error('出行方式总计应等于100%');
          return;
        }
        newData.splice(index, 1, {
          ...item,
          rail: row.rail + '',
          bus: row.bus + '',
          car: row.car + '',
          taxi: row.taxi + '',
          ['non-motor']: row['non-motor'] + '',
          walk: row.walk + '',
        });
        setTableData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setTableData(newData);
        setEditingKey('');
      }
      handleOnUpdateTable(newData);
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: '人员',
      dataIndex: 'personType',
      key: 'personType',
      editable: true,
      width: 110,
      render: (text: any) => {
        return <a>{text}</a>;
      },
    },
    {
      title: '轨道交通',
      dataIndex: 'rail',
      key: 'rail',
      editable: true,
      render: (text: any, record: any, index: any) => {
        return <a>{text}%</a>;
      },
    },
    {
      title: '公交',
      dataIndex: 'bus',
      key: 'bus',
      editable: true,
      render: (text: any, record: any, index: any) => {
        return <a>{text}%</a>;
      },
    },
    {
      title: '汽车',
      dataIndex: 'car',
      key: 'car',
      editable: true,
      render: (text: any, record: any, index: any) => {
        return <a>{text}%</a>;
      },
    },
    {
      title: '出租车',
      dataIndex: 'taxi',
      key: 'taxi',
      editable: true,
      render: (text: any, record: any, index: any) => {
        return <a>{text}%</a>;
      },
    },
    {
      title: '非机动车',
      dataIndex: 'non-motor',
      key: 'non-motor',
      editable: true,
      render: (text: any, record: any, index: any) => {
        return <a>{text}%</a>;
      },
    },
    {
      title: '步行',
      dataIndex: 'walk',
      key: 'walk',
      editable: true,
      render: (text: any, record: any, index: any) => {
        return <a>{text}%</a>;
      },
    },
    {
      title: '总计',
      dataIndex: 'total',
      key: 'total',
      //   editable: true,
      width: 60,
      render: (text: any, record: any, index: any) => {
        let total = 0;
        for (const key in record) {
          if (Object.prototype.hasOwnProperty.call(record, key)) {
            const element = record[key];
            let arr = ['rail', 'bus', 'car', 'taxi', 'non-motor', 'walk'];
            if (arr.indexOf(key) != -1) {
              total += Number(element);
            }
          }
        }
        return <a>{total} %</a>;
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 85,
      render: (_: any, record: Item, index: number) => {
        const editable = isEditing(index);
        return editable ? (
          <span>
            <a href="javascript:;" onClick={() => hanldeOnSave(index)} style={{ marginRight: 8 }}>
              保存
            </a>
            <Popconfirm title="确定取消?" onConfirm={cancel}>
              <a>取消</a>
            </Popconfirm>
          </span>
        ) : (
          <a onClick={() => handleOnEdit(record, index)}>修改</a>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item, index: any) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(index),
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={tableData}
        columns={mergedColumns}
        rowClassName="editable-row"
        size="small"
        pagination={false}
      />
    </Form>
  );
};
export default RoadTable;
