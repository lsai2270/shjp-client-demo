import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import {
  EditOutlined,
  CheckCircleOutlined,
  DoubleRightOutlined,
  DoubleLeftOutlined,
  createFromIconfontCN,
} from '@ant-design/icons';
import {
  message,
  Button,
  Space,
  Input,
  Select,
  Form,
  TreeSelect,
  Drawer,
  Tabs,
  Table,
  Modal,
  DatePicker,
  InputNumber,
} from 'antd';
// import projectData from './data';
import $ from 'jquery';
import lodash from 'lodash';
import { getTreeData } from '@/tools';
import { getDictData } from '@/services/projectManage';
import LinksComp from './LinksComp';
import NodesComp from './NodesComp';
import styles from './index.less';

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

interface Step1Props {
  linksData: any[];
  setLinksData: Function;
  nodesData: any;
  setNodesData: Function;
  dictData: any;
  stepNum: any;
  setStepNum: Function;
}
const columns: any = [
  {
    title: '路段',
    dataIndex: 'linkName',
    key: 'linkName',
    align: 'center',
    render: (text: any, record: any, index: number) => {
      return <span>Link{record.num}</span>;
    },
  },
  {
    title: '所属道路',
    align: 'center',
    dataIndex: 'name',
    key: 'name',
    render: (text: any, record: any, index: number) => {
      return <span>{lodash.get(record, 'name.label')}</span>;
    },
  },
  {
    title: '路段',
    align: 'center',
    dataIndex: 'roadName',
    key: 'roadName',
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
const nodeColumns: any = [
  {
    title: '节点',
    dataIndex: 'nodeName',
    key: 'nodeName',
    width: 80,
    align: 'center',
    render: (text: any, record: any, index: number) => {
      return <span>Node{record.num}</span>;
    },
  },
  {
    title: '交叉路',
    align: 'center',
    dataIndex: 'intersection',
    key: 'intersection',
    render: (text: any, record: any, index: number) => {
      return <span>{record.crossRoadName || `-`}</span>;
    },
  },
  {
    title: '是否交叉口',
    align: 'center',
    dataIndex: 'crossroad',
    key: 'crossroad',
    render: (text: any, record: any, index: number) => {
      return <span>{record.crossFlag ? '是' : '否'}</span>;
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
const Step5Comp: React.FC<Step1Props> = (props) => {
  const [step5Form] = Form.useForm();
  const { linksData, setLinksData, nodesData, setNodesData, stepNum, setStepNum, dictData } = props;
  const [leftVisible, setLeftVisible] = useState<boolean>(true); // 左侧抽屉状态
  const [rightVisible, setRightVisible] = useState<boolean>(false); // 右侧抽屉状态
  const [leftTabsKeys, setLeftTabsKeys] = useState<string>('1'); // 左侧抽屉状态
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [linkIndex, setLinkIndex] = useState<any>(undefined);
  const [nodeIndex, setNodeIndex] = useState<any>(undefined);
  useEffect(() => {
    console.log('stepNum', stepNum);
  }, [stepNum]);
  useEffect(() => {
    console.log('rightVisible===>', rightVisible);
  }, [rightVisible]);
  // 底部步骤的切换
  const handleStepChange = (value: string) => {
    setStepNum(Number(value));
  };
  // 上一步
  const hanldeOnPre = () => {
    setStepNum(stepNum - 1);
  };
  // 下一步
  const handleOnNext = () => {
    history.push({
      pathname: '/projects/predictManage/predictResult',
      query: {
        id: '60e5294352e1f6003c5f26fb',
        projectId: '60decb645b7fec003537890d',
      },
    });
  };
  // 左侧抽屉的折叠
  const handleOnLeftDrawChange = () => {};
  // 左侧tabs切换
  const handleOnTabsChange = (key: any) => {
    setLeftTabsKeys(key);
    if (nodeIndex) {
      setRowStyle(nodeIndex, 'node');
    }
    if (linkIndex) {
      setRowStyle(linkIndex, 'link');
    }
  };
  // 路段选择
  const handleOnLinkTableRow = (record: any, index: any) => {
    setRowStyle(index, 'link');
  };
  // 节点选择
  const handleOnNodeTableRow = (record: any, index: any) => {
    setRowStyle(index, 'node');
  };
  const setRowStyle = (index: any, type: string) => {
    let nodeElement: any =
      type == 'link' ? document.getElementById('linkLists') : document.getElementById('nodeLists');
    var arr = nodeElement.getElementsByClassName('ant-table-row');
    arr.forEach((eleItem: any, rowIndex: any) => {
      let str = eleItem.getAttribute('class');
      if (index == rowIndex) {
        if (str.indexOf('ant-table-row-selected') != -1) {
          setRightVisible(false);
          eleItem.classList.remove('ant-table-row-selected');
        } else {
          setRightVisible(true);
          eleItem.classList.add('ant-table-row-selected');
        }
      } else {
        arr[rowIndex].classList.remove('ant-table-row-selected');
      }
    });
    if ((type = 'link')) {
      if (!linkIndex) {
        setLinkIndex(index);
      } else {
        setLinkIndex(undefined);
      }
    } else {
      if (!nodeIndex) {
        setNodeIndex(index);
      } else {
        setNodeIndex(undefined);
      }
    }
  };
  // 弹窗确认
  const handleOk = async () => {
    const formData = await step5Form.validateFields();

    setIsModalVisible(false);
  };
  // 弹窗取消
  const handleCancel = () => {
    setIsModalVisible(false);
    setStepNum(stepNum - 1);
  };
  return (
    <div className={styles.step5Container}>
      <Modal title="项目研究年" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={step5Form} labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} initialValues={{}}>
          <Form.Item label="建成年份" name="year" rules={[{ required: true, message: '请输入!' }]}>
            <DatePicker
              placeholder="请选择"
              picker="year"
              onChange={(date, dateString) => {
                console.log('dateString', dateString);
                step5Form.setFieldsValue({
                  recentYear: Number(dateString) + 5,
                });
              }}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            label="近期"
            name="recentYear"
            rules={[{ required: true, message: '请输入!' }]}
          >
            <Input placeholder="请输入研究年(必填)" />
          </Form.Item>
          <Form.Item
            label="远期"
            name="futureYear"
            rules={[{ required: false, message: '请输入!' }]}
          >
            <Input placeholder="请输入研究年(必填)" />
          </Form.Item>
        </Form>
      </Modal>
      <div>
        <Drawer
          title=""
          placement="left"
          closable={false}
          mask={false}
          zIndex={160}
          width={400}
          getContainer={false}
          bodyStyle={{ padding: '10px' }}
          style={{ position: 'absolute' }}
          onClose={handleOnLeftDrawChange}
          visible={leftVisible}
          handler={
            <div className={styles.visibleIconContainer}>
              {leftVisible && (
                <DoubleLeftOutlined
                  className={styles.visibleIcon}
                  onClick={() => {
                    setLeftVisible(false);
                  }}
                />
              )}
              {!leftVisible && (
                <DoubleRightOutlined
                  className={styles.visibleIcon}
                  onClick={() => {
                    setLeftVisible(true);
                  }}
                />
              )}
            </div>
          }
        >
          <Tabs activeKey={leftTabsKeys} centered onChange={handleOnTabsChange}>
            <TabPane tab="路段" key="1">
              <div>
                <h3>路段列表:</h3>
              </div>
              <div className={styles.linkTableContain}>
                <Table
                  id="linkLists"
                  onRow={(record, index) => {
                    return {
                      onClick: (event: any) => {
                        handleOnLinkTableRow(record, index);
                      },
                    };
                  }}
                  dataSource={linksData}
                  columns={columns}
                  pagination={false}
                  scroll={{ y: 700 }}
                  bordered
                />
              </div>
            </TabPane>
            <TabPane tab="节点" key="2">
              <div>
                <h3>节点列表:</h3>
              </div>
              <div>
                <Table
                  id="nodeLists"
                  onRow={(record, index) => {
                    return {
                      onClick: (event: any) => {
                        handleOnNodeTableRow(record, index);
                      },
                    };
                  }}
                  dataSource={nodesData}
                  columns={nodeColumns}
                  pagination={false}
                  scroll={{ y: 700 }}
                  bordered
                />
              </div>
            </TabPane>
          </Tabs>
        </Drawer>
      </div>
      <div>
        <Drawer
          title=""
          placement="right"
          closable={false}
          mask={false}
          zIndex={160}
          width={500}
          getContainer={false}
          bodyStyle={{ padding: '10px' }}
          style={{ position: 'absolute' }}
          onClose={handleOnLeftDrawChange}
          visible={rightVisible}
        >
          {leftTabsKeys == '1' && (
            <LinksComp
              linksData={linksData}
              setLinksData={setLinksData}
              stepData={{}}
              roadwayInfo={[]}
              currentProject={{}}
            />
          )}
          {leftTabsKeys == '2' && (
            <NodesComp
              nodesData={nodesData}
              linksData={linksData}
              setNodesData={setNodesData}
              zonesData={[]}
              currentProject={{}}
            />
          )}
        </Drawer>
      </div>
      <div className={styles.step5Tools}>
        <div>
          <Select value={stepNum + ''} style={{ width: 300 }} onChange={handleStepChange}>
            <Option value="1">添加基地地块</Option>
            <Option value="2">添加规划地块</Option>
            <Option value="3">添加规划道路</Option>
            <Option value="4">小区出入口关联路网</Option>
            <Option value="5">预测设置</Option>
          </Select>
        </div>
        <div>
          <Space>
            <Button onClick={hanldeOnPre}>上一步</Button>
            <Button type="primary" onClick={handleOnNext}>
              下一步
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default Step5Comp;
