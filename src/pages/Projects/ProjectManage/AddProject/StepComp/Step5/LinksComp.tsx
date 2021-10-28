import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Select, Input, Table, InputNumber, message, Affix } from 'antd';
const { Option } = Select;
const { TextArea } = Input;
import styles from './LinksComp.less';
import lodash from 'lodash';
import {
  getTwoPointDirection,
  getCapprt,
  getTreeData,
  getRoadCapRatio,
  getReverseDirection,
} from '@/tools';
import { getDictData } from '@/services/projectManage';
import { createLink } from '@/services/predictManage';
const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 12,
  },
};
const directionArr = ['东', '东北', '北', '西北', '西', '西南', '南', '东南', '东'];
const directionEArr = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE', 'E'];
function getPostData(values: any, currentLink: any, currentProject: any) {
  console.log('values', values);
  // console.log('currentLink', currentLink);
  // console.log('currentProject', currentProject);

  let objData: any = {
    _id: currentLink._id,
    name: 'Link' + currentLink.num,
    sum: currentLink.num + '',
    bId: currentLink.bId,
    projectId: currentProject._id,
    projectName: currentProject.name,
    roadName: values.roadName,
    statusId: values.roadSituation.value,
    status: values.roadSituation.label,

    belongId: values.name.value,
    belong: values.name.label,
    levelId: values.roadLevel.split('_')[0],
    level: values.roadLevel.split('_')[1],
    fromNode: {
      fromNodeSum: values.startNode.split('_')[1],
      fromNodeId: values.startNode.split('_')[0],
      toNodeSum: values.endNode.split('_')[1],
      toNodeId: values.endNode.split('_')[0],
      towardFrom: values.from.label,
      towardFromCode: values.from.value,
      towardTo: values.to.label,
      towardToCode: values.to.value,
      laneNumber: values.roadNum + '',
      laneSeq: values.roadIndex,
      trafficCapacity: values.capt + '',
    },
    reverseNode: {
      fromNodeSum: values.endNode.split('_')[1],
      fromNodeId: values.endNode.split('_')[0],
      toNodeSum: values.startNode.split('_')[1],
      toNodeId: values.startNode.split('_')[0],
      towardFrom: values.to.label,
      towardFromCode: values.to.value,
      towardTo: values.from.label,
      towardToCode: values.from.value,
      laneNumber: values.roadNum1 + '',
      laneSeq: values.roadIndex1,
      trafficCapacity: values.capt1 + '',
    },
  };
  if (values.roadTrafficCurrentStatusValue) {
    objData.fromNode.roadTrafficCurrentStatusValue = values.roadTrafficCurrentStatusValue + '';
  }
  if (values.roadTrafficCurrentStatusValue1) {
    objData.reverseNode.roadTrafficCurrentStatusValue = values.roadTrafficCurrentStatusValue1 + '';
  }
  if (values.year) {
    objData.buildEndAtId = values.year.value;
    objData.buildEndAt = values.year.label;
  }
  return objData;
}
interface LinksCompProps {
  linksData: any;
  setLinksData: any;
  stepData: any;
  roadwayInfo: any;
  currentProject: any;
}
const LinksComp: React.ForwardRefRenderFunction<any, LinksCompProps> = (props, ref) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const { linksData, setLinksData, stepData, roadwayInfo, currentProject } = props;
  const [railway, setRailway] = useState([]);
  const [roadNum, setRoadNum] = useState<any>([]);
  const [roadNum1, setRoadNum1] = useState<any>([]);
  const [currentRowIndex, setCurrentRowIndex] = useState<any>(undefined);
  const [dictData, setDictData] = useState<any>({});
  const [roadNode, setRoadNode] = useState<any>([]);
  const [otherNode, setOtherNode] = useState<any>([]);
  const [nodeFrom, setNodeFrom] = useState<any>(undefined);
  const [nodeTo, setNodeTo] = useState<any>(undefined);
  const [dircFrom, setDircFrom] = useState<any>(undefined);
  const [dircTo, setDircTo] = useState<any>(undefined);
  const [messageFlag, setMessageFlag] = useState<any>(true);
  const [linkFlag, setLinkFlag] = useState<any>(true);
  const [roadSituation, setRoadSituation] = useState<any>(undefined);
  useEffect(() => {
    getDictDataAll();
  }, []);
  const hanldeOnSave = async () => {
    if (currentRowIndex == undefined) {
      message.warning('请先选中link后,进行保存!');
      return;
    }
    const values = await validateFields();
    // console.log("values====>",values);
    const record = linksData[currentRowIndex];
    // let directionObj: any = getTwoPointDirection(
    //   record.nodes[0].position,
    //   record.nodes[1].position,
    // );
    let newLinksData = linksData.concat([]);
    newLinksData.splice(currentRowIndex, 1, {
      ...newLinksData[currentRowIndex],
      ...values,
      status: 1,
    });
    record.nodes.forEach((nodeItem: any, index: number) => {
      let i: any = 0;
      let filterLinks = newLinksData.filter((linkItem: any) => {
        const linkNodenNums = linkItem.nodes.map((linkNode: any) => linkNode.num);
        if (
          linkNodenNums.includes(nodeItem.num) &&
          linkItem.status == 1 &&
          record.num != linkItem.num
        ) {
          let nodeIndex = linkNodenNums.indexOf(nodeItem.num);
          let nodeIndex1: any;
          if (nodeIndex != -1) {
            if (nodeIndex == 0) {
              nodeIndex1 = 1;
            } else {
              nodeIndex1 = 0;
            }
          }
          let directionObj: any = getTwoPointDirection(
            linkItem.nodes[nodeIndex].position,
            linkItem.nodes[nodeIndex1].position,
          );
          let recordStartNode = index == 0 ? record.nodes[1] : record.nodes[0];
          let recordDirObj: any = getTwoPointDirection(nodeItem.position, recordStartNode.position);
          if (recordDirObj.start.label == directionObj.start.label) {
            i++;
          }
        }
        return linkNodenNums.includes(nodeItem.num);
      });
      // console.log('filterLinks===>', filterLinks);
      if (i != 0) {
        filterLinks.sort((a: any, b: any) => {
          let adegree = getTwoPointDirection(a.nodes[0].position, a.nodes[1].position, 'degree');
          let bdegree = getTwoPointDirection(b.nodes[0].position, b.nodes[1].position, 'degree');
          return adegree - bdegree;
        });
        filterLinks.forEach((linkItem: any, linkIndex: number) => {
          if (linkIndex != 0) {
            let dirIndex = directionArr.indexOf(filterLinks[0].from.label);
            linkItem.from = {
              value: directionEArr[dirIndex + linkIndex],
              label: directionArr[dirIndex + linkIndex],
            };
            linkItem.to = getReverseDirection(directionArr[dirIndex + linkIndex]);
          } else {
            const directionNodes = getTwoPointDirection(
              linkItem.nodes[0].position,
              linkItem.nodes[1].position,
            );
            linkItem.from = directionNodes.start;
            linkItem.to = directionNodes.end;
          }
          if (linkItem.num == record.num) {
            values.from = linkItem.from;
            values.to = linkItem.to;
            newLinksData.splice(currentRowIndex, 1, {
              ...newLinksData[currentRowIndex],
              from: linkItem.from,
              to: linkItem.to,
            });
          } else {
            if (linkItem.roadName) {
              let postData = getPostData(linkItem, linkItem, currentProject);
              // console.log('postData', postData);
              postData.data = linkItem;
              createLink(postData)
                .then((res) => {
                  // console.log(res);
                  if (res.code == 200) {
                    message.success('重复路段更新成功!');
                  } else {
                    message.error('重复路段更新失败!');
                  }
                })
                .catch((err) => {
                  message.error('重复路段更新错误!');
                });
            }
          }
        });
        filterLinks = filterLinks.filter((linkItem: any) => linkItem.num != record.num);
        let filterLinksNums = filterLinks.map((linkItem: any) => linkItem.num);
        newLinksData = newLinksData.map((item: any) => {
          let linkNumIndex = filterLinksNums.indexOf(item.num);
          if (linkNumIndex != -1) {
            return filterLinks[linkNumIndex];
          }
          return item;
        });
      }
    });
    /*--------------------------------*/
    console.log('newLinksData[currentRowIndex]', newLinksData[currentRowIndex]);
    let postData = getPostData(values, newLinksData[currentRowIndex], currentProject);
    // console.log('postData', postData);
    postData.data = linksData[currentRowIndex];
    setRowStyle(currentRowIndex);
    createLink(postData)
      .then((res) => {
        // console.log(res);
        if (res.code == 200) {
          message.success('保存成功');
        } else {
          message.error('保存失败');
        }
      })
      .catch((err) => {
        message.error('保存失败');
      });
    form.resetFields();
    setNodeFrom(undefined);
    setNodeTo(undefined);
    setDircFrom(undefined);
    setDircTo(undefined);
    setCurrentRowIndex(undefined);
    setLinksData(newLinksData);
  };
  const hanldeOnRoadNum = (value: any, type: string) => {
    if (type == '1') {
      form.setFieldsValue({
        roadIndex: new Array(value).fill({}).map((item: any, index: any) => {
          return `车道${index + 1}`;
        }),
      });
      setRoadNum(new Array(value).fill({}));
    } else {
      form.setFieldsValue({
        roadIndex1: new Array(value).fill({}).map((item: any, index: any) => {
          return `车道${roadNum.length + index + 1}`;
        }),
      });
      setRoadNum1(new Array(value).fill({}));
    }
  };
  //选中行
  const handleOnTableRow = (record: any, index: any) => {
    setRowStyle(index);
    if (index == currentRowIndex) {
      setCurrentRowIndex(undefined);
      setRoadNode([]);
      setOtherNode([]);
      form.resetFields();
    } else {
      form.resetFields();
      if (record.status == '1') {
        form.setFieldsValue({
          ...record,
        });
        let otherNode = record.nodes.filter((node: any) => record.endNode.indexOf(node._id) != -1);
        setRoadNode(record.nodes);
        setOtherNode(otherNode);
        setNodeFrom(`Node${record.startNode.split('_')[1]}`);
        setNodeTo(`Node${record.endNode.split('_')[1]}`);
        setDircFrom(record.from);
        setDircTo(record.to);
        setCurrentRowIndex(index);
        return;
      }
      setCurrentRowIndex(index);
      setRoadNode(record.nodes);
      let otherNodes = record.nodes.filter((item: any) => item._id != record.nodes[0]._id);
      setOtherNode(otherNodes);
      // 路段方向相同处理
      let directionObj: any = getTwoPointDirection(
        record.nodes[0].position,
        record.nodes[1].position,
      );
      if (record.from) {
        directionObj = {
          start: record.from,
          end: record.to,
        };
      }
      console.log('directionObj===>', directionObj);
      form.setFieldsValue({
        startNode: `${record.nodes[0]._id}_${record.nodes[0].num}`,
        endNode: `${record.nodes[1]._id}_${record.nodes[1].num}`,
        from: directionObj.start,
        to: directionObj.end,
      });
      setNodeFrom(`Node${record.nodes[0].num}`);
      setNodeTo(`Node${record.nodes[1].num}`);
      setDircFrom(directionObj.start);
      setDircTo(directionObj.end);
    }
  };
  const setRowStyle = (index: any) => {
    let nodeElement: any = document.getElementById('linkLists');
    var arr = nodeElement.getElementsByClassName('ant-table-row');
    arr.forEach((eleItem: any, rowIndex: any) => {
      let str = eleItem.getAttribute('class');
      if (index == rowIndex) {
        if (str.indexOf('ant-table-row-selected') != -1) {
          eleItem.classList.remove('ant-table-row-selected');
        } else {
          eleItem.classList.add('ant-table-row-selected');
        }
      } else {
        arr[rowIndex].classList.remove('ant-table-row-selected');
      }
    });
  };
  //下拉框字典
  const getDictDataAll = async () => {
    let newDictData = {};
    let parentIds = [
      {
        name: '道路等级',
        type: 'dldj',
        parentId: '606ff379843ea2749135ba79',
      },
      {
        name: '建成情况',
        type: 'jcqk',
        parentId: '608115ccdc75f61295d3307d',
      },
      {
        name: '建设年限',
        type: 'jsnx',
        parentId: '60768ad7a67748bbc5c764b8',
      },
      {
        name: '方向',
        type: 'fx',
        parentId: '608115ccdc75f61295d3307e',
      },
    ];
    // let parentId = parentIds.map((item)=>item.parentId);
    getDictData({ typeCode: 'baseData' }).then((res) => {
      if (res.code == 200) {
        let treeData = getTreeData(res.data, '0', 'allData');
        // console.log(treeData);
        // let newDictData = {};
        parentIds.forEach((item: any) => {
          treeData.forEach((item1: any) => {
            if (item.parentId == item1._id) {
              newDictData[item.type] = item1.children;
            }
          });
        });
        // console.log(newDictData);
        setDictData(newDictData);
      }
    });
  };
  const getOtherNode = (value: any) => {
    let nodeId = value.split('_')[0];
    let currentNode = linksData[currentRowIndex]?.nodes.filter((item: any) => item._id == nodeId);
    let newNodes = linksData[currentRowIndex].nodes.filter((item: any) => item._id != nodeId);
    // console.log(linksData[currentRowIndex]);
    setOtherNode(newNodes);
    setNodeFrom(`Node${value.split('_')[1]}`);
  };
  const handleOnRoadSituation = (seleted: any) => {
    // console.log(seleted);
    setRoadSituation(seleted.label);
  };
  const hanldeOnSelectedRoad = (selected: any) => {
    if (currentRowIndex == undefined) {
      message.warning('请先选择左侧路段后进行操作.');
      return;
    }
    const selectedRoadwayInfo = roadwayInfo.filter((item: any) => item._id == selected.value);
    // console.log(selectedRoadwayInfo);
    const selectedDldj = dictData['dldj'].filter(
      (item: any) => item.value == selectedRoadwayInfo[0].level,
    );
    // console.log(selectedDldj);

    const roadNumber = Math.floor(selectedRoadwayInfo[0].twoWayNumber / 2);
    const roadNumber1 = selectedRoadwayInfo[0].twoWayNumber - roadNumber;
    let roadSituation: any = {};
    if (
      selectedRoadwayInfo[0].planningImplementation == '已按红线实施完成' ||
      selectedRoadwayInfo[0].planningImplementation == '无规划红线'
    ) {
      roadSituation = { value: '60018c95a7a8417bf7475b70', label: '已建成' };
      setRoadSituation('已建成');
    }
    if (
      selectedRoadwayInfo[0].planningImplementation == '尚为按规划实施到位' ||
      selectedRoadwayInfo[0].planningImplementation == '尚未辟通'
    ) {
      setRoadSituation('未建成');
      roadSituation = { value: '5fec4f55ecfcc42214f38f63', label: '未建成' };
      form.setFieldsValue({
        year: { value: '60768afda67748bbc5c764b9', label: '近期' },
      });
    }
    form.setFieldsValue({
      roadLevel: `${selectedDldj[0]._id}_${selectedDldj[0].defaultValue}`,
      roadNum: roadNumber,
      roadIndex: new Array(roadNumber).fill({}).map((item: any, index: any) => {
        return `车道${index + 1}`;
      }),
      roadNum1: roadNumber1,
      roadIndex1: new Array(roadNumber1).fill({}).map((item: any, index: any) => {
        return `车道${roadNumber + index + 1}`;
      }),
      capt:
        getCapprt(selectedDldj[0].defaultValue, stepData.step1Form) * getRoadCapRatio(roadNumber),
      capt1:
        getCapprt(selectedDldj[0].defaultValue, stepData.step1Form) * getRoadCapRatio(roadNumber1),
      roadSituation: roadSituation,
    });
    setRoadNum(new Array(roadNumber).fill({}));
    setRoadNum1(new Array(roadNumber1).fill({}));
    let currentLink = linksData[currentRowIndex];
    // console.log(currentLink);
  };
  return (
    <div>
      <div>
        <Button type="primary" onClick={hanldeOnSave}>
          保存
        </Button>
      </div>
      <div className={styles.linkFormContainer}>
        <Form
          {...formItemLayout}
          form={form}
          layout="horizontal"
          className={styles.stepForm}
          initialValues={{}}
        >
          <Form.Item label="所属道路" name="name" rules={[{ required: true, message: '请选择' }]}>
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              labelInValue
              onChange={hanldeOnSelectedRoad}
            >
              {roadwayInfo &&
                roadwayInfo.map((item: any, index: number) => {
                  return (
                    <Option key={index} value={item._id}>
                      {item.roadName}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
          <Form.Item label="路段名" name="roadName" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item label="起讫点车道设置" wrapperCol={{ span: 24 }}>
            <div className={styles.formFieldItem} style={{ display: 'flex' }}>
              <Form.Item name="startNode" rules={[{ required: true, message: '请选择' }]}>
                <Select placeholder="请选择" style={{ width: '100px' }} onChange={getOtherNode}>
                  {roadNode.map((item: any, index: number) => {
                    return (
                      <Option key={index} value={`${item._id}_${item.num}`}>
                        Node{item.num}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <span style={{ padding: '0 5px' }}>—</span>
              <Form.Item name="endNode" rules={[{ required: true, message: '请选择' }]}>
                <Select
                  placeholder="请选择"
                  style={{ width: '100px' }}
                  onChange={(value: any) => {
                    let num = value.split('_')[1];
                    setNodeTo(`Node${num}`);
                    let startNode: any;
                    roadNode.forEach((node: any) => {
                      if (node.num != num) {
                        startNode = node;
                      }
                    });
                    // 路段方向相同处理
                    let directionObj: any = getTwoPointDirection(
                      startNode.position,
                      otherNode[0].position,
                    );
                    form.setFieldsValue({
                      from: directionObj.start,
                      to: directionObj.end,
                    });
                    setDircFrom(directionObj.start);
                    setDircTo(directionObj.end);
                  }}
                >
                  {otherNode.map((item: any, index: number) => {
                    return (
                      <Option key={index} value={`${item._id}_${item.num}`}>
                        Node{item.num}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </div>
            <div className={styles.formFieldItem} style={{ display: 'flex', marginTop: '20px' }}>
              <Form.Item label="走向">
                <Form.Item name="from" rules={[{ required: true, message: '请选择' }]}>
                  <Select
                    placeholder="请选择"
                    style={{ width: '100px' }}
                    labelInValue
                    onChange={(value: string) => {
                      setDircFrom(value);
                    }}
                  >
                    {dictData['fx'] &&
                      dictData['fx'].map((item: any, index: number) => {
                        return (
                          <Option key={index} value={item.code}>
                            {item.name}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
                <span style={{ padding: '0 5px' }}>—</span>
                <Form.Item name="to" rules={[{ required: true, message: '请选择' }]}>
                  <Select
                    placeholder="请选择"
                    style={{ width: '100px' }}
                    labelInValue
                    onChange={(value: string) => {
                      setDircTo(value);
                    }}
                  >
                    {dictData['fx'] &&
                      dictData['fx'].map((item: any, index: number) => {
                        return (
                          <Option key={index} value={item.code}>
                            {item.name}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Form.Item>
            </div>
            <div className={styles.formFieldItem} style={{ display: 'flex', marginTop: '20px' }}>
              <Form.Item
                label="车道数"
                name="roadNum"
                // className={styles.inlineFormItem}
                // wrapperCol={{ span: 24 }}
                rules={[{ required: true, message: '请选择' }]}
              >
                <InputNumber
                  placeholder="请输入"
                  min={0}
                  max={5}
                  style={{ width: '100px' }}
                  onChange={(value: any) => {
                    hanldeOnRoadNum(value, '1');
                  }}
                />
              </Form.Item>
              <Form.Item
                label="车道编号从左到右为"
                name="roadIndex"
                // className={styles.inlineFormItem}
                // wrapperCol={{ span: 24 }}
                rules={[{ required: false, message: '请选择' }]}
              >
                {roadNum.map((item: any, index: number) => {
                  if (index + 1 == roadNum.length) {
                    return <span key={index}>车道{index + 1}</span>;
                  }
                  return <span key={index}>车道{index + 1}、</span>;
                })}
              </Form.Item>
            </div>
            <div className={styles.formFieldItem} style={{ marginTop: '20px' }}>
              <Form.Item
                label="通行能力"
                name="capt"
                // className={styles.inlineFormItem}
                wrapperCol={{ span: 5 }}
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber placeholder="请输入" style={{ width: '200px' }} min={0} max={100000} />
              </Form.Item>
            </div>
            <div className={styles.formFieldItem} style={{ marginTop: '20px' }}>
              <Form.Item
                label="交通量现状观测值"
                name="roadTrafficCurrentStatusValue"
                // className={styles.inlineFormItem}
                wrapperCol={{ span: 5 }}
                rules={[{ required: false, message: '请输入' }]}
              >
                <InputNumber placeholder="请输入" style={{ width: '200px' }} min={0} max={100000} />
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item label="反方向车道设置" wrapperCol={{ span: 24 }}>
            <div className={styles.formFieldItem} style={{ display: 'flex' }}>
              {nodeFrom && nodeTo && (
                <>
                  <span> {nodeTo && nodeTo}</span>
                  <span style={{ padding: '0 5px' }}>—</span>
                  <span> {nodeFrom && nodeFrom}</span>
                </>
              )}
              {dircFrom && dircTo && (
                <>
                  <span style={{ marginLeft: '15px' }}>
                    走向:
                    <span>{dircTo && dircTo.label}</span>
                    <span style={{ padding: '0 5px' }}>—</span>
                    <span> {dircFrom && dircFrom.label}</span>
                  </span>
                </>
              )}
            </div>
            <div className={styles.formFieldItem} style={{ display: 'flex', marginTop: '20px' }}>
              <Form.Item
                label="车道数"
                name="roadNum1"
                // className={styles.inlineFormItem}
                // wrapperCol={{ span: 24 }}
                rules={[{ required: true, message: '请选择' }]}
              >
                <InputNumber
                  placeholder="请输入"
                  min={0}
                  max={5}
                  style={{ width: '100px' }}
                  onChange={(value: any) => {
                    hanldeOnRoadNum(value, '2');
                  }}
                />
              </Form.Item>
              <Form.Item
                label="车道编号从左到右为"
                name="roadIndex1"
                // className={styles.inlineFormItem}
                // wrapperCol={{ span: 24 }}
                rules={[{ required: false, message: '请选择' }]}
              >
                {roadNum1.map((item: any, index: any) => {
                  if (index + 1 == roadNum1.length) {
                    return <span key={index}>车道{roadNum.length + index + 1}</span>;
                  }
                  return <span key={index}>车道{roadNum.length + index + 1}、</span>;
                })}
              </Form.Item>
            </div>
            <div className={styles.formFieldItem} style={{ marginTop: '20px' }}>
              <Form.Item
                label="通行能力"
                name="capt1"
                // className={styles.inlineFormItem}
                wrapperCol={{ span: 5 }}
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber placeholder="请输入" style={{ width: '200px' }} min={0} max={100000} />
              </Form.Item>
            </div>
            <div className={styles.formFieldItem} style={{ marginTop: '20px' }}>
              <Form.Item
                label="交通量现状观测值"
                name="roadTrafficCurrentStatusValue1"
                // className={styles.inlineFormItem}
                wrapperCol={{ span: 5 }}
                rules={[{ required: false, message: '请输入' }]}
              >
                <InputNumber placeholder="请输入" style={{ width: '200px' }} min={0} max={100000} />
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item
            label="道路等级"
            name="roadLevel"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Select placeholder="请选择" style={{ width: '100%' }}>
              {dictData['dldj'] &&
                dictData['dldj'].map((item: any, index: number) => {
                  return (
                    <Option key={index} value={`${item._id}_${item.defaultValue}`}>
                      {item.name}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
          <Form.Item
            label="建成情况"
            name="roadSituation"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              labelInValue
              onChange={handleOnRoadSituation}
            >
              {dictData['jcqk'] &&
                dictData['jcqk'].map((item: any, index: number) => {
                  return (
                    <Option key={index} value={item._id}>
                      {item.name}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
          {roadSituation != undefined && roadSituation != '已建成' && (
            <Form.Item label="建成年份" name="year" rules={[{ required: true, message: '请选择' }]}>
              <Select
                placeholder="请选择"
                style={{ width: '100%' }}
                labelInValue
                onChange={(value) => {
                  console.log(value);
                }}
              >
                {dictData['jsnx'] &&
                  dictData['jsnx'].map((item: any, index: number) => {
                    return (
                      <Option key={index} value={item._id}>
                        {item.name}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
          )}
        </Form>
      </div>
    </div>
  );
};
export default LinksComp;
