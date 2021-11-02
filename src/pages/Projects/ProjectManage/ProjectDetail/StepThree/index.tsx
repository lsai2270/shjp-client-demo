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
import RoadListComp from './RoadListComp';
import styles from './index.less';

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

interface Step1Props {
  // plotRecordDataIndex: any;
  // plotInfoData: any[];
  // setPlotInfoData: Function;
  // plotRecordData: any;
  // setPlotRecordData: Function;
  // dictData: any;
  // stepNum: any;
  // setStepNum: Function;
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
  // const { stepNum, setStepNum, dictData } = props;
  const [leftVisible, setLeftVisible] = useState<boolean>(true); // 左侧抽屉状态
  const [rightVisible, setRightVisible] = useState<boolean>(false); // 右侧抽屉状态
  const [stepNum, setStepNum] = useState<any>(5); // 右侧抽屉状态

  const [linksData, setLinksData] = useState<any[]>([
    {
      bId: '60e51ae810b51900a8c63be4',
      btype: 'LINK',
      capt: '1297',
      capt1: '1297',
      connectors: [],
      createdTime: '2021-07-07T03:09:28.422Z',
      endNode: '60e51aea10b51900a8c63e56_2',
      from: { label: '东南', value: 'SE' },
      length: 0.2031846016029964,
      name: { label: '佘北公路', value: '60decb645b7fec0035378930' },
      netId: '60e51ae810b51900a8c63be3',
      nodes: [
        {
          bId: '60e51ae810b51900a8c63be5',
          btype: 'NODE',
          isConnector: true,
          linkIds: ['60e51ae810b51900a8c63be4'],
          netId: '60e51ae810b51900a8c63be3',
          num: 1,
          position: { x: -27401091.5236446, y: -12747079.89024263 },
          _id: '60e51aea10b51900a8c63e55',
        },
        {
          bId: '60e51ae810b51900a8c63be6',
          btype: 'NODE',
          linkIds: [
            '60e51ae810b51900a8c63be4',
            '60e51ae810b51900a8c63be7',
            '60e51ae810b51900a8c63cb9',
            '60e51ae810b51900a8c63d79',
          ],
          netId: '60e51ae810b51900a8c63be3',
          num: 2,
          position: { x: -27501205.25889174, y: -12570271.45621463 },
          _id: '60e51aea10b51900a8c63e56',
        },
      ],
      num: 1,
      points: [
        { x: -27401091.5236446, y: -12747079.89024263 },
        { x: -27501205.25889174, y: -12570271.45621463 },
      ],
      roadIndex: ['车道1', '车道2'],
      roadIndex1: ['车道3', '车道4'],
      roadLevel: '606ff3e4843ea2749135ba7d_4',
      roadName: '1',
      roadNum: '2',
      roadNum1: '2',
      roadSituation: { label: '已建成', value: '60018c95a7a8417bf7475b70' },
      roadTrafficCurrentStatusValue: '',
      roadTrafficCurrentStatusValue1: '',
      startNode: '60e51aea10b51900a8c63e55_1',
      status: '1',
      to: { label: '西北', value: 'NW' },
      _id: '60e51ae910b51900a8c63db9',
    },
  ]); // 路段数据
  const [nodesData, setNodesData] = useState<any[]>([
    { num: 1, crossRoadName: '恒丰路-恒通路', crossFlag: true },
  ]); // 节点数据
  const [leftTabsKeys, setLeftTabsKeys] = useState<string>('1'); // 左侧抽屉状态
  const [isModalVisible, setIsModalVisible] = useState(true);
  useEffect(() => {
    console.log('stepNum', stepNum);
  }, [stepNum]);
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
        setRightVisible(false);
        arr[rowIndex].classList.remove('ant-table-row-selected');
      }
    });
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
    <div className={styles.step2Container}>
      <div>
        <Drawer
          title=""
          placement="left"
          closable={false}
          mask={false}
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
          <div>
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
          </div>
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
            <RoadListComp
              linksData={linksData}
              setLinksData={setLinksData}
              stepData={{}}
              roadwayInfo={[]}
              currentProject={{}}
            />
          )}
        </Drawer>
      </div>
    </div>
  );
};

export default Step5Comp;
