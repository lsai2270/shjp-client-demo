import React, { useState, useEffect, useRef } from 'react';
import { Form, Alert, Button, Row, Col, Tabs, Drawer, message, Checkbox } from 'antd';
const { TabPane } = Tabs;
import { connect, Dispatch } from 'umi';
import { StateType } from '../../model';
import styles from './index.less';
import Loading from '@/components/Loading';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';

// components
import LinksComp from './components/LinksComp';
import NodesComp from './components/NodesComp';
import ZonesComp from './components/ZonesComp';
import ConnectorsComp from './components/ConnectorsComp';
import { getAllZones, getVisumToken } from '@/services/predictManage';

interface Step2Props {
  stepData: StateType['step'];
  dxfData: StateType['dxfData'];
  currentProject: StateType['currentProject'];
  dispatch?: Dispatch;
}

const Step2: React.FC<Step2Props> = (props) => {
  const linkRef: any = useRef<HTMLDivElement>();
  const nodeRef: any = useRef<HTMLDivElement>();
  const [form] = Form.useForm();
  const { stepData, dispatch, dxfData, currentProject } = props;
  const [tabsKey, setTabsKey] = useState('1');
  const [visible, setVisible] = useState(false);
  const [linksData, setLinksData] = useState<any>([]);
  const [nodesData, setNodesData] = useState<any>([]);
  const [zonesData, setZonesData] = useState<any>([]);
  const [connectorsData, setConnectorsData] = useState<any>([]);
  const [netId, setNetId] = useState<string>('');
  const [linksCheck, setLinksCheck] = useState<boolean>(true);
  const [nodesCheck, setNodesCheck] = useState<boolean>(true);
  const [zonesCheck, setZonesCheck] = useState<boolean>(true);
  const [connectorsCheck, setConnectorsCheck] = useState<boolean>(true);
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [scrFilterType, setScrFilterType] = useState<string>('LINK');
  const [onmessageE, setOnmessageE] = useState<any>(undefined);
  const [token, setToken] = useState<any>(undefined);
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false);
  const [roadFlag, setRoadFlag] = useState<boolean>(true);

  useEffect(() => {
    // console.log('stepData', stepData);
    // console.log(dxfData);
    // console.log(currentProject);
    if (JSON.stringify(stepData.step2Form) != '{}') {
      // console.log('stepData', stepData);
      setLinksData(stepData.step2Form.linkInfo);
      setNodesData(stepData.step2Form.nodeInfo);
      setZonesData(stepData.step2Form.zoneInfo);
      setNetId(dxfData.netId);
      setIframeSrc(`${DXFURL}${dxfData.netId}&filterBizType=${scrFilterType}`);
      // setConnectorsData(stepData.step2Form.connectorInfo);
    } else if (dxfData && Object.keys(dxfData).length > 0) {
      setNetId(dxfData.netId);
      // console.log('dxfData', dxfData);
      setLinksData(dxfData.links);
      let newNodes = dxfData.nodes.map((node: any, index: number) => {
        // let nodeForLinks = dxfData.links.filter((link: any) => link.bId === node.linkId);
        if (node?.linkIds?.length < 3 || node?.data?.linkIds?.length < 3) {
          let objNode = { ...node, crossFlag: false };
          if (node?.data) {
            objNode.status = 1;
          }
          return objNode;
          return;
        } else {
          let objNode = { ...node, crossFlag: true };
          if (node?.data) {
            objNode.status = 1;
            // objNode.crossRoadName = `${node.crosswayFrom}/${node.crosswayTo}`;
          }
          return objNode;
        }
      });
      setNodesData(newNodes);
      getAllZones({
        projectId: currentProject._id,
      }).then((res) => {
        if (res.code == 200) {
          if (res.data.length > 0) {
            // setZonesData(res.data);
            let newZoneData = res.data.map((item: any) => {
              return {
                _id: item._id,
                status: 1,
                name: item.name || item.code,
                sum: item.sum,
                level: { label: item.belong, value: item.belongId },
                plot: item.plotInfo,
              };
            });
            setZonesData(newZoneData);
          }
        }
      });
      // setConnectorsData(dxfData.connectors);
    }
    getVisumToken().then((res) => {
      if (res.code == 200) {
        setToken(res.data.accessToken);
        setIframeSrc(`${DXFURL}${dxfData?.netId}&viewToken=${res.data.accessToken}`);
      }
    });
    setLoadingFlag(true);
    // handleOnWindowMessage();
  }, []);
  useEffect(() => {
    if (onmessageE && roadFlag) {
      setRoadFlag(false);
      const roadNameArr = linksData.map((link: any) => {
        return {
          roadName: link.name.label,
          position: {
            from: link?.nodes[0]?.position,
            to: link?.nodes[1]?.position,
          },
        };
      });
      onmessageE.source.postMessage(
        {
          type: 'SETROAD',
          roads: roadNameArr,
        },
        onmessageE.origin,
      );
      // console.log('roadNameArr',roadNameArr);
    }
  }, [onmessageE]);
  useEffect(() => {
    // 更新links
    if (dispatch) {
      if (linksData.length > 0) {
        dispatch({
          type: 'predictManageAndEditPredict/setDxfData',
          payload: {
            ...dxfData,
            links: linksData,
          },
        });
      }
    }
  }, [linksData]);
  // 更新nodes
  useEffect(() => {
    if (dispatch) {
      if (nodesData.length > 0) {
        dispatch({
          type: 'predictManageAndEditPredict/setDxfData',
          payload: {
            ...dxfData,
            nodes: nodesData,
          },
        });
      }
    }
  }, [nodesData]);
  useEffect(() => {
    handleOnWindowMessage();
  }, [tabsKey, linksData, nodesData]);
  const handleOnWindowMessage = () => {
    if (window) {
      window.onmessage = (e: any) => {
        console.log('get data from visum net viewer:', e.data);
        if (e.data.type == 'LINK') {
          linksData?.forEach((link: any, index: number) => {
            if (link.bId == e.data.id) {
              handleOnLinkClick(link, index);
            }
          });
        }
        if (e.data.type == 'NODE') {
          nodesData.forEach((node: any, index: number) => {
            if (node.bId == e.data.id) {
              handleOnNodeClick(node, index);
            }
          });
        }
        if (e.data.type == 'DIDMOUNT') {
          e.source.postMessage(
            {
              type: 'SETFILTERBIZTYPE',
              filterBizType: 'LINK',
            },
            e.origin,
          );
        }
        setOnmessageE(e);
      };
    }
  };
  const handleOnLinkClick = (link: any, index: number) => {
    linkRef.current.setCurrentLink(link, index);
  };
  const handleOnNodeClick = (node: any, index: number) => {
    nodeRef.current.setCurrentNode(node, index);
  };
  const showDrawer = () => {
    if (visible) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  };
  const onClose = () => {
    setVisible(false);
  };
  const onPrev = () => {
    if (dispatch) {
      dispatch({
        type: 'predictManageAndEditPredict/saveCurrentStep',
        payload: '0',
      });
    }
  };
  const onValidateForm = async () => {
    let linksStatusArr = linksData.filter((item: any) => item.status != 1);
    if (linksStatusArr.length > 0) {
      message.warning('请先完善所有路段数据后,进行下一步!');
      return;
    }
    let nodesStatusArr = nodesData.filter((item: any) => item.status != 1);
    if (nodesStatusArr.length > 0) {
      message.warning('请先完善所有节点数据后,进行下一步!');
      return;
    }
    let ZonesStatusArr = zonesData.filter((item: any) => {
      if (item.status) {
        return item.status != 1;
      }
      if (item.belong) {
        return false;
      }
    });
    if (ZonesStatusArr.length > 0) {
      message.warning('请先完善所有小区数据后,进行下一步!');
      return;
    }
    // let ConnectorsStatusArr = connectorsData.filter((item: any) => item.status != 1);
    // if (ConnectorsStatusArr.length > 0) {
    //   message.warning('请先完善所有Connectors数据后,进行下一步!');
    //   return;
    // }
    if (dispatch) {
      dispatch({
        type: 'predictManageAndEditPredict/saveStepFormData',
        payload: {
          // ...stepData,
          step2Form: {
            linkInfo: linksData,
            nodeInfo: nodesData,
            zoneInfo: zonesData,
            // connectorInfo: connectorsData,
          },
        },
      });
      dispatch({
        type: 'predictManageAndEditPredict/saveCurrentStep',
        payload: '2',
      });
    }
  };

  const callback = (key: string) => {
    if (key == '1') {
      setScrFilterType('LINK');
      onmessageE.source.postMessage(
        {
          type: 'SETFILTERBIZTYPE',
          filterBizType: 'LINK',
        },
        onmessageE.origin,
      );
      // setIframeSrc(`${DXFURL}${netId}&filterBizType=LINK&viewToken=${token}`);
    } else if (key == '3') {
      setScrFilterType('NODE');
      onmessageE.source.postMessage(
        {
          type: 'SETFILTERBIZTYPE',
          filterBizType: 'NODE',
        },
        onmessageE.origin,
      );
      // setIframeSrc(`${DXFURL}${netId}&filterBizType=NODE&viewToken=${token}`);
    }
    // setVisible(false)
    setTabsKey(key);
  };
  const handleOnCheck = (e: any, type: string) => {
    // console.log(e);
    let objectType = 'LINK';
    if (type == 'links') {
      objectType = 'LINK';
      setLinksCheck(e.target.checked);
    } else if (type == 'nodes') {
      objectType = 'NODE';
      setNodesCheck(e.target.checked);
    } else if (type == 'zones') {
      objectType = 'ZONE';
      setZonesCheck(e.target.checked);
    } else if (type == 'connectors') {
      objectType = 'CONNECTOR';
      setConnectorsCheck(e.target.checked);
    }
    if (e.target.checked) {
      if (onmessageE) {
        onmessageE.source.postMessage(
          {
            type: 'SHOWOBJECTSBYBTYPE',
            objectType: objectType,
          },
          onmessageE.origin,
        );
      }
    } else {
      if (onmessageE) {
        onmessageE.source.postMessage(
          {
            type: 'HIDEOBJECTSBYBTYPE',
            objectType: objectType,
          },
          onmessageE.origin,
        );
      }
    }
  };
  return (
    <Row>
      <Col span={24} className={styles.stepForm}>
        <div style={{ width: '85%', margin: '0 auto' }}>
          <Alert
            closable
            showIcon
            message="请设置节点、路段、交通小区及其相关参数。"
            style={{ marginBottom: 24 }}
          />
        </div>
        <Loading visible={loadingFlag} />
        <Row>
          <Col span={18} offset={2} style={{ zIndex: visible ? 0 : 2 }}>
            <Tabs onChange={callback} type="card" activeKey={tabsKey}>
              <TabPane tab="路段" key="1">
                <LinksComp
                  ref={linkRef}
                  currentProject={currentProject}
                  roadwayInfo={currentProject?.roadWayInfo}
                  linksData={linksData}
                  setLinksData={setLinksData}
                  onmessageE={onmessageE}
                  setOnmessageE={setOnmessageE}
                />
              </TabPane>
              <TabPane tab="交通小区" key="2">
                <ZonesComp
                  currentProject={currentProject}
                  plotInfo={currentProject?.plotInfo}
                  nearPlotInfo={currentProject?.nearPlotProjectInfo}
                  zonesData={zonesData}
                  setZonesData={setZonesData}
                />
              </TabPane>
              <TabPane tab="节点" key="3">
                <NodesComp
                  ref={nodeRef}
                  currentProject={currentProject}
                  linksData={linksData}
                  nodesData={nodesData}
                  zonesData={zonesData}
                  setNodesData={setNodesData}
                />
              </TabPane>

              {/* <TabPane tab="Connectors" key="4">
                <ConnectorsComp
                  currentProject={currentProject}
                  connectorsData={connectorsData}
                  nodesData={nodesData}
                  zonesData={zonesData}
                  setConnectorsData={setConnectorsData}
                  setTabsKey={setTabsKey}
                />
              </TabPane> */}
            </Tabs>
          </Col>
          {/* {visible && <DoubleRightOutlined className={styles.openDrawer} onClick={showDrawer} />}
          {!visible && <DoubleLeftOutlined className={styles.openDrawer} onClick={showDrawer} />} */}
          <Drawer
            title="路网图"
            placement="right"
            closable={true}
            onClose={onClose}
            visible={visible}
            style={{ width: '40%', zIndex: 1 }}
            getContainer={false}
            mask={false}
          >
            {visible && <DoubleRightOutlined className={styles.openDrawer} onClick={showDrawer} />}
            {!visible && <DoubleLeftOutlined className={styles.openDrawer} onClick={showDrawer} />}
            <Row>
              <Col span={8} className={styles.maptips}>
                <div className={styles.connector}>
                  <span></span>
                  <span>交通小区</span>
                </div>
                <div className={styles.node}>
                  <span></span>
                  <span>节点</span>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.boxes}>
                {/* <div>
                    <Checkbox checked={linksCheck} onChange={(e) => handleOnCheck(e, 'links')}>
                      显示Links
                    </Checkbox>
                  </div> */}
                <div>
                  <Checkbox checked={nodesCheck} onChange={(e) => handleOnCheck(e, 'nodes')}>
                    显示节点
                  </Checkbox>
                </div>
                {/* <div>
                    <Checkbox checked={zonesCheck} onChange={(e) => handleOnCheck(e, 'zones')}>
                      显示Zones
                    </Checkbox>
                  </div> */}
                <div>
                  <Checkbox
                    checked={connectorsCheck}
                    onChange={(e) => handleOnCheck(e, 'connectors')}
                  >
                    显示交通小区
                  </Checkbox>
                </div>
              </Col>
            </Row>
            <iframe
              src={iframeSrc}
              width="100%"
              height="100%"
              onLoad={() => {
                setLoadingFlag(false);
                handleOnWindowMessage();
              }}
            ></iframe>
          </Drawer>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button type="primary" onClick={onValidateForm}>
              下一步
            </Button>
            <Button onClick={onPrev} style={{ marginLeft: 8 }}>
              上一步
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
export default connect(
  ({ predictManageAndEditPredict }: { predictManageAndEditPredict: StateType }) => ({
    stepData: predictManageAndEditPredict.step,
    dxfData: predictManageAndEditPredict.dxfData,
    currentProject: predictManageAndEditPredict.currentProject,
  }),
)(Step2);
