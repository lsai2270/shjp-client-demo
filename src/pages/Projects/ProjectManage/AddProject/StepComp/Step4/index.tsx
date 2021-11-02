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
import styles from './index.less';
interface Step1Props {
  connectorsData: any[];
}
const Step4Comp: React.FC<Step1Props> = (props) => {
  const { connectorsData } = props;
  const dataSource: any[] = [
    // {
    //   key: '1',
    //   plotName: '基地',
    //   road: '人民北路',
    //   linkRoad: '狮子桥与胡同口路段',
    // },
    // {
    //   key: '2',
    //   plotName: 'B1-02',
    //   road: '园美路',
    //   linkRoad: '狮子桥与胡同口路段',
    // },
    // {
    //   key: '3',
    //   plotName: '基地',
    //   road: '人民北路',
    //   linkRoad: '狮子桥与胡同口路段',
    // },
    // {
    //   key: '4',
    //   plotName: 'B1-02',
    //   road: '园美路',
    //   linkRoad: '狮子桥与胡同口路段',
    // },
  ];
  const columns: any = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      align: 'center',
      render: (text: any, record: any, index: number) => <div>{index + 1}</div>,
    },
    {
      title: '地块名称',
      dataIndex: 'plotName',
      key: 'plotName',
    },
    {
      title: '道路',
      dataIndex: 'road',
      key: 'road',
    },
    {
      title: '关联路段',
      dataIndex: 'linkRoad',
      key: 'linkRoad',
    },
  ];
  return (
    <>
      <div className={styles.step3Steps}>
        <h3>1、选中地块;</h3>
      </div>
      <div className={styles.step3Steps}>
        <h3>2、将地块小区出入口与附近路网关联;</h3>
      </div>
      <Table
        dataSource={connectorsData}
        columns={columns}
        pagination={false}
        bordered={true}
        size="small"
      />
    </>
  );
};

export default Step4Comp;
