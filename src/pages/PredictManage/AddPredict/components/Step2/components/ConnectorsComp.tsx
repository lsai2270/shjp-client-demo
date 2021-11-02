import React, { useState } from 'react';
import { connect, Dispatch } from 'umi';
import { Form, Button, Card, Select, Input, Table, Row, Col, Tabs, message } from 'antd';
const { Option } = Select;
const { TextArea } = Input;
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styles from '../index.less';
import { createConnector } from '@/services/predictManage';

const gridStyleLeft: any = {
  width: '35%',
  // textAlign: 'center',
};
const gridStyleRight: any = {
  width: '65%',
  // textAlign: 'center',
};

const formItemLayout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
  },
};
interface ConnectorsCompProps {
  setTabsKey: any;
  connectorsData: any;
  setConnectorsData: any;
  nodesData: any[];
  zonesData: any[];
  currentProject: any;
}
const ConnectorsComp: React.FC<ConnectorsCompProps> = (props) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const { connectorsData, setConnectorsData, setTabsKey, nodesData, zonesData, currentProject } =
    props;
  const [railway, setRailway] = useState([]);
  const [currentRowIndex, setCurrentRowIndex] = useState<any>(undefined);

  const columns: any = [
    {
      title: 'Connector',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: '设置状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      align: 'center',
      render: (text: any, record: any, index: number) => {
        if (record.status) {
          return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
        } else {
          return <a>待设置</a>;
        }
      },
    },
  ];
  //选中行
  const handleOnTableRow = (event: any, record: object, index: any) => {
    let rowDom = event.target.parentElement;
    let str = event.target.parentElement.getAttribute('class');
    var arr = rowDom.parentElement.getElementsByClassName('ant-table-row');
    arr.forEach((item: any, rowIndex: any) => {
      if (index == rowIndex) {
        if (str.indexOf('ant-table-row-selected') != -1) {
          rowDom.classList.remove('ant-table-row-selected');
          form.resetFields();
        } else {
          rowDom.classList.add('ant-table-row-selected');
          form.setFieldsValue(record);
        }
      } else {
        arr[rowIndex].classList.remove('ant-table-row-selected');
      }
    });
    if (index == currentRowIndex) {
      setCurrentRowIndex(undefined);
    } else {
      setCurrentRowIndex(index);
    }
  };
  const hanldeOnSave = async () => {
    if (currentRowIndex == undefined) {
      message.warning('请先选中connector后,进行保存!');
      return;
    }
    const values = await validateFields();
    console.log('values', values);
    let newConnectorsData = connectorsData.concat([]);
    newConnectorsData.splice(currentRowIndex, 1, {
      ...newConnectorsData[currentRowIndex],
      ...values,
      status: 1,
    });
    let currentConnector = newConnectorsData[currentRowIndex];
    createConnector({
      _id: currentConnector._id,
      name: 'Link' + currentConnector.num,
      sum: currentConnector.num + '',
      bId: currentConnector.bId,
      projectId: currentProject._id,
      projectName: currentProject.name,
      zoneId: values.zone.value,
      zoneName: values.zone.label,
      nodeId: values.node.split('_')[0],
      nodeSum: values.node.split('_')[1],
    })
      .then((res) => {
        console.log(res);
        if (res.code == 200) {
          message.success('保存成功!');
        } else {
          message.error('保存失败!');
        }
      })
      .catch((err) => {
        message.error('保存失败!');
      });
    form.resetFields();
    setCurrentRowIndex(undefined);
    setConnectorsData(newConnectorsData);
  };
  return (
    <Card>
      <Card.Grid hoverable={false} style={gridStyleLeft}>
        <div> Connectors列表：</div>
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyleRight}>
        <Button type="primary" onClick={hanldeOnSave}>
          保存
        </Button>
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyleLeft}>
        <Table
          onRow={(record, index) => {
            return {
              onClick: (event: any) => {
                handleOnTableRow(event, record, index);
              },
            };
          }}
          dataSource={connectorsData}
          columns={columns}
          pagination={false}
          scroll={{ y: 700 }}
          bordered
        />
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyleRight}>
        <Form
          {...formItemLayout}
          form={form}
          layout="vertical"
          // className={styles.stepForm}
          initialValues={{}}
        >
          <Form.Item label="连接Zone" name="zone" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="请选择" style={{ width: '100%' }} labelInValue>
              {zonesData &&
                zonesData.map((zone: any, index: number) => {
                  return <Option value={zone._id}>{zone.name}</Option>;
                })}
            </Select>
          </Form.Item>
          <Row style={{ marginBottom: '10px' }}>
            <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              找不到小区?{' '}
              <a
                onClick={() => {
                  setTabsKey('3');
                }}
              >
                点此新增
              </a>
            </Col>
          </Row>
          <Form.Item label="连接Node" name="node" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="请选择" style={{ width: '100%' }}>
              {nodesData &&
                nodesData.map((node: any, index: number) => {
                  return <Option value={`${node._id}_${node.num}`}>{`Node` + node.num}</Option>;
                })}
            </Select>
          </Form.Item>
        </Form>
      </Card.Grid>
    </Card>
  );
};
export default connect(({ predictManageAndAddPredict }: any) => ({
  current: predictManageAndAddPredict.current,
}))(ConnectorsComp);
