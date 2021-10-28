import React from 'react';
import { EditOutlined, createFromIconfontCN } from '@ant-design/icons';
import {
  message,
  Button,
  Space,
  Input,
  Select,
  Form,
  TreeSelect,
  Row,
  Col,
  DatePicker,
  Table,
} from 'antd';
const { Option } = Select;
const { Search } = Input;
const { SHOW_PARENT } = TreeSelect;
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2686590_idaxqb07swi.js',
});
// import projectData from './data';
import $ from 'jquery';
import lodash from 'lodash';
import { getTreeData } from '@/tools';
import { getDictData } from '@/services/projectManage';
import { createRoadway } from '@/services/v2/roadway';
import styles from './index.less';
interface Step1Props {
  currentRoadIndex: any;
  setCurrentRoadIndex: Function;
  roadLinksData: any[];
  setRoadLinksData: Function;
  roadData: any[];
  setRoadData: Function;
  dictData: any;
  form: any;
}
const columns: any = [
  {
    title: '已选路段',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
  },
  {
    title: '路段长度(单位: 公里)',
    dataIndex: 'distance',
    key: 'distance',
    align: 'center',
  },
];

declare let window: any;

const Step3Comp: React.FC<Step1Props> = (props) => {
  const {
    currentRoadIndex,
    setCurrentRoadIndex,
    roadData,
    setRoadData,
    roadLinksData,
    dictData,
    form,
  } = props;
  const handleOnConfirm = async () => {
    const formData = await form.validateFields();
    console.log('formData', formData);
    let newRoadData = roadData.concat([]);
    const res = await createRoadway({
      ...formData,
      level: formData.level.value,
      levelName: formData.level.label,
      buildYear: formData.buildYear.format(),
      linkInfo: roadLinksData.map((item: any) => {
        return {
          sum: item.sum,
          projectId: item.projectId,
          projectName: item.linkLength,
          linkLength: item.distance + '',
          nodeInfo: item.nodeInfo.map((node: any) => {
            return {
              sum: node.sum,
              projectId: node.projectId,
              projectName: node.linkLength,
              longitude: node.lng,
              latitude: node.lat,
            };
          }),
        };
      }),
    });
    if (res.code != 200) {
      return;
    }
    message.success('道路保存成功!');
    newRoadData.splice(currentRoadIndex, 1, {
      ...newRoadData[currentRoadIndex],
      ...formData,
      roadId: res.data._id,
      status: 1,
    });
    let layers = window.map.getLayers();
    let roadLineLayer = layers.filter((item: any) => item.get('name') == 'roadLineLayer')[0];
    roadLineLayer.setData(newRoadData, {
      lnglat: 'lnglat',
    });
    roadLineLayer.render();
    form.resetFields();
    setRoadData(newRoadData);
    setCurrentRoadIndex(undefined);
  };
  return (
    <>
      <div className={styles.formItemContain}>
        <div className={styles.step3Steps}>
          <h3>1、绘制规划道路</h3>
        </div>
        <div className={styles.step3Steps}>
          <h3>2、选中路段</h3>
        </div>
        <div className={styles.tablesContain}>
          <Table
            dataSource={roadLinksData}
            columns={columns}
            pagination={false}
            bordered={true}
            size="small"
          />
        </div>
        <div className={styles.step3Steps}>
          <h3>3、添加道路信息</h3>
        </div>
        <div>
          <Form.Item
            label="道路名称"
            name="roadName"
            rules={[{ required: true, message: '请输入!' }]}
          >
            <Input placeholder="道路名称(必填)" />
          </Form.Item>
          <Form.Item label="道路等级" name="level" rules={[{ required: true, message: '请选择!' }]}>
            <Select labelInValue placeholder="道路等级(必填)" style={{ width: '100%' }}>
              <Option value="1">高速公路</Option>
              <Option value="2">快速路</Option>
              <Option value="3">主干路</Option>
              <Option value="4">次干路</Option>
              <Option value="5">支路</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="双向车道数"
            name="twoWayNumber"
            rules={[{ required: true, message: '请输入!' }]}
          >
            <Input placeholder="双向车道数(必填)" />
          </Form.Item>
          {/* <Form.Item
            label="道路长度"
            name="roadLength"
            rules={[{ required: true, message: '请输入!' }]}
          >
            <Input placeholder="道路长度(单位千米,必填)" />
          </Form.Item> */}
          <Form.Item label="建成年份">
            <Space>
              <Form.Item name="buildAtType" rules={[{ required: true, message: '请选择!' }]}>
                <Select placeholder="请选择" style={{ width: '120px' }}>
                  <Option value="近期">近期</Option>
                  <Option value="远期">远期</Option>
                </Select>
              </Form.Item>
              <Form.Item name="buildYear" rules={[{ required: true, message: '请选择!' }]}>
                <DatePicker placeholder="请选择" style={{ width: '220px' }} />
              </Form.Item>
            </Space>
          </Form.Item>
        </div>
        <div className={styles.step3_tools}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" style={{ width: '100%' }} onClick={handleOnConfirm}>
              确定
            </Button>
            <Button danger style={{ width: '100%' }}>
              删除
            </Button>
          </Space>
        </div>
      </div>
    </>
  );
};

export default Step3Comp;
