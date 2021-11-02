import { PageContainer } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, Children } from 'react';
import { history, useParams, useHistory, withRouter } from 'umi';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import {
  Spin,
  Row,
  Col,
  Input,
  Button,
  Divider,
  Tree,
  Space,
  message,
  Modal,
  Image,
  Table,
  Tag,
  Select,
  Tabs,
} from 'antd';
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
import lodash from 'lodash';
import { CarryOutOutlined, FormOutlined } from '@ant-design/icons';
import styles from './index.less';
import { getList, getDetailById, getTreeList } from '@/services/predictManage';
import Item from 'antd/lib/list/Item';

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: any[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    // await removeRule({
    //   key: selectedRows.map((row) => row.key),
    // });
    // hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

export default withRouter((props: any) => {
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRocord, setCurrentRocord] = useState<any>({});
  const [leftTreeData, setLeftTreeData] = useState<any>([]);
  const [expendedKey, setExpendedKey] = useState<React.Key[]>([]);
  const [seletedKey, setSeletedKey] = useState<string[]>([]);
  const [tableTitle, setTableTitle] = useState<string>('预测图');
  const [imgsData, setImgsData] = useState<any[]>([]);
  const [currentSaturability, setCurrentSaturability] = useState<any[]>([]);
  const [imgOrTable, setImgOrTable] = useState<boolean>(true);
  const [tablesArr, setTablesArr] = useState<any[]>([]);
  const [currentPredictData, setCurrentPredictData] = useState<any>(undefined);
  const [tabsKey, setTabsKey] = useState<any>('1');

  const { location } = props;
  const { id, projectId } = location.query;
  const columns: ProColumns<any>[] = [
    {
      title: '名称',
      key: 'name',
      dataIndex: 'name',
      // sorter: true,
      render: (_, record) => {
        return (
          <span onClick={() => handleOnPreview(record)}>
            <img
              src={`${record?.src?.substr(0, 1) != '/' ? '/' + record.src : record.src}`}
              style={{ width: '50px', height: '50px' }}
            />
            <a style={{ marginLeft: '20px' }}>{record.name}</a>
          </span>
        );
      },
    },
    {
      title: '预测时间',
      key: 'atCreated',
      dataIndex: 'atCreated',
      // sorter: true,
      hideInSearch: true,
      valueType: 'date',
    },
    // {
    //   title: '操作',
    //   dataIndex: 'option',
    //   valueType: 'option',
    //   width: 240,
    //   render: (_, record) => [<a onClick={() => {}}>删除</a>],
    // },
  ];
  const columns2: ProColumns<any>[] = [
    {
      title: '名称',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '预测时间',
      key: 'atCreated',
      dataIndex: 'atCreated',
      // sorter: true,
      hideInSearch: true,
      valueType: 'date',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      render: (_, record) => [
        <a
          onClick={() => {
            setCurrentRocord(record);
            setIsModalVisible(true);
          }}
        >
          查看
        </a>,
      ],
    },
  ];
  const type = {
    columns1: [
      {
        title: '道路',
        key: 'name',
        dataIndex: 'name',
        // sorter: true,
      },
      {
        title: '路段名称',
        key: 'lane',
        dataIndex: 'lane',
        // sorter: true,
      },
      {
        title: '交通量（总）',
        key: 'trafficTotal',
        dataIndex: 'trafficTotal',
        // sorter: true,
      },
      {
        title: '饱和度',
        key: 'saturability',
        dataIndex: 'saturability',
        // sorter: true,
      },
      {
        title: '服务水平',
        key: 'serviceLevel',
        dataIndex: 'serviceLevel',
        // sorter: true,
      },
      {
        title: '通行能力',
        key: 'capacity',
        dataIndex: 'capacity',
        // sorter: true,
      },
      // {
      //   title: '预测时间',
      //   key: 'atCreated',
      //   dataIndex: 'atCreated',
      //   // sorter: true,
      //   hideInSearch: true,
      //   valueType: 'date',
      // },
      // {
      //   title: '操作',
      //   dataIndex: 'option',
      //   valueType: 'option',
      //   width: 240,
      //   render: (_, record) => [<a onClick={() => {}}>删除</a>],
      // },
    ],
    columns2: [
      {
        title: '相位',
        key: 'phasePosition',
        dataIndex: 'phasePosition',
        // sorter: true,
      },
      {
        title: '转向交通',
        key: 'direction',
        dataIndex: 'direction',
        // sorter: true,
      },
      {
        title: '关键车道高峰小时流量(单位:pcu/h)',
        key: 'laneTraffic',
        dataIndex: 'laneTraffic',
        // sorter: true,
        // render: (value: any) => {
        //   return <span>{Math.ceil(Number(value))}</span>;
        // },
      },
      {
        title: '绿灯时间(单位:s)',
        key: 'greenTightTime',
        dataIndex: 'greenTightTime',
        // sorter: true,
      },
      {
        title: '饱和度',
        key: 'saturability',
        dataIndex: 'saturability',
        // sorter: true,
      },
      {
        title: '延误(单位:s)',
        key: 'delay',
        dataIndex: 'delay',
        // sorter: true,
      },
    ],
    columns3: [
      {
        title: '路段',
        children: [
          {
            title: '道路',
            key: 'name',
            dataIndex: 'name',
            // sorter: true,
          },
          {
            title: '路段名称',
            key: 'lane',
            dataIndex: 'lane',
            // sorter: true,
          },
          {
            title: '方向',
            key: 'direction',
            dataIndex: 'direction',
            // sorter: true,
          },
        ],
      },
      {
        title: '项目实施前',
        children: [
          {
            title: '流量',
            key: 'backgroundVolVehPrTAP',
            dataIndex: 'backgroundVolVehPrTAP',
            // sorter: true,
          },
          {
            title: '服务水平',
            key: 'backgroundServiceLevel',
            dataIndex: 'backgroundServiceLevel',
            // sorter: true,
          },
        ],
      },
      {
        title: '项目实施后',
        children: [
          {
            title: '流量',
            key: 'superpositionVolVehPrTAP',
            dataIndex: 'superpositionVolVehPrTAP',
            // sorter: true,
          },
          {
            title: '服务水平',
            key: 'superpositionServiceLevel',
            dataIndex: 'superpositionServiceLevel',
            // sorter: true,
          },
        ],
      },
    ],
  };
  useEffect(() => {
    // const params = useParams();
    setTableColumns(columns);
    if (id) {
      getTreeList({ projectId }).then((res) => {
        // console.log(res);
        if (res.code == 200) {
          let treeData = res.data.map((item: any) => {
            let parentData = {
              ...item,
              selectable: false,
              children: item.children.map((item1: any) => {
                return {
                  ...item1,
                  selectable: false,
                };
              }),
            };
            return parentData;
          });
          setLeftTreeData(treeData);
        }
      });
      getDataById(id, 'init');
    }
  }, []);
  const getDataById = (detailId: string, type: string, selectKey?: string) => {
    getDetailById(detailId).then((res) => {
      console.log(res);
      if (res.code == 200) {
        setCurrentPredictData(res.data);
        // 图
        let objArr: any = [
          {
            src: res?.data?.spiderDiagram,
            name: '蛛网图',
            atCreated: res.data.atCreated,
          },
          {
            src:
              res.data.assessType == '近期'
                ? res.data?.recentOD?.backgroundResultImg
                : res.data?.futureOD?.backgroundResultImg,
            name: '道路饱和度图(背景)',
            atCreated: res.data.atCreated,
          },
          {
            src:
              res.data.assessType == '近期'
                ? res.data?.recentOD?.backgroundFlowResultImg
                : res.data?.futureOD?.backgroundFlowResultImg,
            name: '道路流量图(背景)',
            atCreated: res.data.atCreated,
          },
          {
            src:
              res.data.assessType == '近期'
                ? res.data?.recentOD?.superpositionResultImg
                : res.data?.futureOD?.superpositionResultImg,
            name: '道路饱和度图(叠加)',
            atCreated: res.data.atCreated,
          },
          {
            src:
              res.data.assessType == '近期'
                ? res.data?.recentOD?.superpositionFlowResultImg
                : res.data?.futureOD?.superpositionFlowResultImg,
            name: '道路流量图(叠加)',
            atCreated: res.data.atCreated,
          },
        ];
        // 表
        let tablesArr: any = [
          {
            name: '路段现状饱和度',
            atCreated: res.data.atCreated,
            tableData: res.data.currentSaturability,
            columnsType: 'columns1',
          },
        ];
        res.data.nodeInfo.forEach((item: any) => {
          if (!item.isConnector) {
            if (item.isComparisonImg == '是') {
              // 背景渠化图
              objArr.push({
                name: `${res.data.assessType}${item.crosswayFrom}/${item.crosswayTo}交叉口渠化图(背景)`,
                src: item.backgroundChannelizationMap,
                atCreated: res.data.atCreated,
              });
              // 叠加渠化图
              objArr.push({
                name: `${res.data.assessType}${item.crosswayFrom}/${item.crosswayTo}交叉口渠化图(叠加)`,
                src: item.superpositionChannelizationMap,
                atCreated: res.data.atCreated,
              });
            }
            if (item.isChannelizationImg == '是') {
              // 背景交叉口流量及服务水平
              objArr.push({
                name: `${res.data.assessType}${item.crosswayFrom}/${item.crosswayTo}交叉口流量及服务水平(背景)`,
                src: item.backgroundVolumeImg,
                atCreated: res.data.atCreated,
              });
              // 叠加交叉口流量及服务水平
              objArr.push({
                name: `${res.data.assessType}${item.crosswayFrom}/${item.crosswayTo}交叉口流量及服务水平(叠加)`,
                src: item.superpositionVolumeImg,
                atCreated: res.data.atCreated,
              });
              // 背景交叉口流量及服务水平表
              tablesArr.push({
                name: `${res.data.assessType}${item.crosswayFrom}/${item.crosswayTo}交叉口流量及服务水平表(背景)`,
                atCreated: res.data.atCreated,
                tableData: item.backgroundFlowTable.map((table: any, index: any) => {
                  if (index != item.backgroundFlowTable.length - 1) {
                    return table;
                  }
                  return {
                    phasePosition: table.avgAaturabilityName,
                    direction: table.avgAaturability,
                    laneTraffic: table.avgDelayName,
                    greenTightTime: table.avgDelay,
                    saturability: table.serviceName,
                    delay: table.serviceLevel,
                  };
                }),
                columnsType: 'columns2',
              });
              // 叠加交叉口流量及服务水平表
              tablesArr.push({
                name: `${res.data.assessType}${item.crosswayFrom}/${item.crosswayTo}交叉口流量及服务水平表(叠加)`,
                atCreated: res.data.atCreated,
                tableData: item.superpositionFlowTable.map((table: any, index: any) => {
                  if (index != item.backgroundFlowTable.length - 1) {
                    return table;
                  }
                  return {
                    phasePosition: table.avgAaturabilityName,
                    direction: table.avgAaturability,
                    laneTraffic: table.avgDelayName,
                    greenTightTime: table.avgDelay,
                    saturability: table.serviceName,
                    delay: table.serviceLevel,
                  };
                }),
                columnsType: 'columns2',
              });
            }
          }
        });
        // 近期项目实施前后服务水平变化路段表
        if (res.data.recentOD) {
          tablesArr.push({
            name: `${res.data.assessType}项目实施前后服务水平变化路段`,
            atCreated: res.data.atCreated,
            tableData: res.data.recentOD.flowLevel,
            columnsType: 'columns3',
          });
        }
        // 远期项目实施前后服务水平变化路段表
        if (res.data.futureOD) {
          tablesArr.push({
            name: `${res.data.assessType}项目实施前后服务水平变化路段`,
            atCreated: res.data.atCreated,
            tableData: res.data.futureOD.flowLevel,
            columnsType: 'columns3',
          });
        }

        if (type == 'init') {
          setSeletedKey([`${id}_0`]);
          setExpendedKey([res.data.projectId, id]);
          setTableData(objArr);
          setImgsData(objArr);
          setTablesArr(tablesArr);
        } else {
          if (selectKey == '0') {
            setTableTitle('预测图');
            setTableData(objArr);
            setTableColumns(columns);
            setImgOrTable(true);
          } else {
            setTableTitle('路段现状饱和度');
            setTableColumns(columns2);
            setTableData(tablesArr);
            setImgOrTable(false);
          }
        }

        // setCurrentSaturability(res.data.currentSaturability);
      }
    });
  };
  const onSearch = (value: any) => console.log(value);
  const onSelect = async (selectedKeys: any, info: any) => {
    console.log('selected', selectedKeys, info);
    setSeletedKey(selectedKeys);
    if (selectedKeys.length == 0) {
      return;
    }
    let str = selectedKeys[0].split('_');
    if (str[0] == id) {
      if (str[1] == '0') {
        setTableTitle('预测图');
        setTableData(imgsData);
        setTableColumns(columns);
        setImgOrTable(true);
      } else {
        setTableTitle('预测表');
        setTableColumns(columns2);
        setTableData(tablesArr);
        setImgOrTable(false);
      }
    } else {
      getDataById(str[0], 'update', str[1]);
    }
  };

  const handleOnPreview = (record: object) => {
    // console.log(record);
    setCurrentRocord(record);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const hanldeOnMoreRemove = () => {
    handleRemove(selectedRows);
    setSelectedRows([]);
    actionRef.current?.reloadAndRest?.();
  };
  const onExpand = (expandedKeys: React.Key[]) => {
    // console.log('onExpand', expandedKeys);
    setExpendedKey(expandedKeys);
  };
  const handleOnWheel = (e: any) => {
    if (e.deltaY > 0) {
      // console.log("e.target.width---->",e.target.width);
      if (e.target.width < 1000) {
        e.target.width = e.target.width * 1.1;
        e.target.height = e.target.height * 1.1;
      }
    } else {
      if (e.target.width > 300) {
        e.target.width = e.target.width / 1.1;
        e.target.height = e.target.height / 1.1;
      }
    }
  };
  // tabs
  const handleOnTabsChange = (key: any) => {
    setTabsKey(key);
  };
  return (
    <PageContainer title="">
      <Row className={styles.resultContainer}>
        <Col span={4} style={{ borderRight: '1px solid rgba(0,0,0,0.2)', paddingRight: '10px' }}>
          <Row style={{ marginBottom: '20px' }}>
            {/* <Col span={24}>
              <Search placeholder="请输入" onSearch={onSearch} style={{ width: '100%' }} />
            </Col> */}
          </Row>
          {leftTreeData && (
            <Tree
              showLine={{ showLeafIcon: false }}
              showIcon={false}
              // defaultExpandAll
              onExpand={onExpand}
              expandedKeys={expendedKey}
              selectedKeys={seletedKey}
              onSelect={onSelect}
              treeData={leftTreeData}
            />
          )}
        </Col>
        <Col span={20} style={{ padding: '20px 20px 20px 50px' }}>
          <Space direction="vertical">
            <div>
              <Space>
                <span>当前预测: </span>
                <span>
                  <Tag closable>{currentPredictData && currentPredictData.name}</Tag>
                </span>
              </Space>
            </div>
            <div style={{ display: 'flex' }}>
              <div>
                <Space>
                  <span>研究年份: </span>
                  <span>
                    <Select placeholder="选择研究年份(多选)" mode="multiple" style={{ width: 200 }}>
                      <Option value="近期">近期</Option>
                      <Option value="远期">远期</Option>
                    </Select>
                  </span>
                </Space>
              </div>
              <div style={{ marginLeft: '50px' }}>
                <Space>
                  <span>预测类型: </span>
                  <span>
                    <Select placeholder="选择预测类型(多选)" mode="multiple" style={{ width: 200 }}>
                      <Option value="近期">近期</Option>
                      <Option value="远期">远期</Option>
                    </Select>
                  </span>
                </Space>
              </div>
            </div>
            <div>
              <Space>
                <span>预测结果: </span>
                <span>
                  <Select placeholder="选择预测结果(多选)" mode="multiple" style={{ width: 200 }}>
                    <Option value="近期">近期</Option>
                    <Option value="远期">远期</Option>
                  </Select>
                </span>
              </Space>
            </div>
          </Space>
          <div className={styles.content}>
            <Tabs activeKey={tabsKey} onChange={handleOnTabsChange}>
              <TabPane tab="预测图片" key="1">
                <div className={styles.TabPaneContent}>
                  <div className={styles.imgTypeContain}>
                    <div>
                      <Space>
                        <h3>道路流量</h3>
                        <a>展开</a>
                      </Space>
                    </div>
                    <div>
                      <ul>
                        <li>
                          <Image width={350} height={250} src="/img/道路流量图(背景).jpg" />
                          <div className={styles.imgTitle}>佘山北15A-02A地块住宅小区（背景）</div>
                        </li>
                        <li>
                          <Image width={350} height={250} src="/img/道路流量图(叠加).jpg" />
                          <div className={styles.imgTitle}>佘山北15A-02A地块住宅小区（背景）</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className={styles.imgTypeContain}>
                    <div>
                      <Space>
                        <h3>道路饱和度</h3>
                        <a>展开</a>
                      </Space>
                    </div>
                    <div>
                      <ul>
                        <li>
                          <Image width={350} height={250} src="/img/道路饱和度(背景).jpg" />
                          <div className={styles.imgTitle}>佘山北15A-02A地块住宅小区（背景）</div>
                        </li>
                        <li>
                          <Image width={350} height={250} src="/img/道路饱和度(背景).jpg" />
                          <div className={styles.imgTitle}>佘山北15A-02A地块住宅小区（背景）</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className={styles.imgTypeContain}>
                    <div>
                      <Space>
                        <h3>都会路与玉莲路交叉口</h3>
                        <a>展开</a>
                      </Space>
                    </div>
                    <div>
                      <ul>
                        <li>
                          <Image width={350} height={250} src="/img/交叉口图.bmp" />
                          <div className={styles.imgTitle}>佘山北15A-02A地块住宅小区（背景）</div>
                        </li>
                        <li>
                          <Image width={350} height={250} src="/img/交叉口(叠加).bmp" />
                          <div className={styles.imgTitle}>佘山北15A-02A地块住宅小区（背景）</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className={styles.imgTypeContain}>
                    <div>
                      <Space>
                        <h3>蛛网图</h3>
                        <a>展开</a>
                      </Space>
                    </div>
                    <div>
                      <ul>
                        <li>
                          <Image width={350} height={250} src="/img/蛛网图.jpg" />
                          <div className={styles.imgTitle}>佘山北15A-02A地块住宅小区</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabPane>
              <TabPane tab="预测表格" key="2">
                <ProTable
                  headerTitle={tableTitle}
                  actionRef={actionRef}
                  rowKey={(record) => record._id}
                  pagination={{
                    // showQuickJumper: true,
                    pageSize: 10,
                  }}
                  columns={columns2}
                  dataSource={tablesArr}
                  options={false}
                  search={false}
                />
                <Modal
                  title={currentRocord.name}
                  visible={isModalVisible}
                  onOk={handleOk}
                  onCancel={handleCancel}
                  footer={null}
                  width={830}
                  bodyStyle={{ height: '540px' }}
                >
                  <Table
                    columns={type[currentRocord.columnsType]}
                    dataSource={currentRocord.tableData}
                    pagination={false}
                    rowClassName={(record: any) => {
                      if (record.phasePosition == '平均饱和度') {
                        return 'ant-table-row-selected rowSelected';
                      }
                      return '';
                    }}
                    scroll={{ y: 400 }}
                  />
                </Modal>
              </TabPane>
            </Tabs>
          </div>
        </Col>
      </Row>
    </PageContainer>
  );
});
// export default PredictResult;
