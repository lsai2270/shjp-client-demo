import React, { useEffect, useState } from 'react';
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
  Cascader,
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
import { createPlanPlot } from '@/services/v2/plot';
import styles from './index.less';
interface Step1Props {
  plotRecordDataIndex: any;
  setPlotRecordDataIndex: Function;
  plotInfoData: any[];
  setPlotInfoData: Function;
  dictData: any;
  form: any;
}
declare let window: any;

const Step2Comp: React.FC<Step1Props> = (props) => {
  const kgydxzData = [
    {
      id: '1',
      name: '居住用地',
      children: [
        {
          id: '2',
          name: '住宅组团用地',
          children: [
            {
              id: '2',
              name: '住宅组团用地',
            },
          ],
        },
      ],
    },
  ];
  const {
    plotRecordDataIndex,
    setPlotRecordDataIndex,
    plotInfoData,
    setPlotInfoData,
    dictData,
    form,
  } = props;
  const [step2RangeVisible, setStep2RangeVisible] = useState<boolean>(false);
  const [moreInfoFlag, setMoreInfoFlag] = useState<boolean>(false);
  const [selectedRegulatoryPlanningLand, setSelectedRegulatoryPlanningLand] = useState<any>([]);
  // 确定研究范围
  const handleOnConfirmRange = () => {
    setStep2RangeVisible(true);
  };
  // 更多信息
  const handleOnMoreClick = () => {
    if (moreInfoFlag) {
      setMoreInfoFlag(false);
    } else {
      setMoreInfoFlag(true);
    }
  };
  // 确定
  const handleOnConfirm = async () => {
    if (plotRecordDataIndex == 'undefined') {
      message.warning('请选择规划地块!');
      return;
    }
    const formData = await form.validateFields();
    console.log('formData', formData);
    let newPlotInfo = plotInfoData.concat([]);
    let objData = newPlotInfo[plotRecordDataIndex];
    delete objData['checked'];
    objData = {
      ...objData,
      ...formData,
      nature: selectedRegulatoryPlanningLand,
      buildEndAt: formData.buildEndAt.format(),
      buildYear: formData.buildYear.label,
      buildYearId: formData.buildYear.value,
      type: '2',
    };
    const res = await createPlanPlot(objData);
    if (res.code == 200) {
      message.success('规划地块保存成功');
      newPlotInfo.splice(plotRecordDataIndex, 1, {
        ...objData,
        plotId: res.data._id,
        status: 1,
      });
      form.resetFields();
      console.log('newPlotInfo', newPlotInfo);
      setPlotRecordDataIndex(undefined);
      setPlotInfoData(newPlotInfo);
      // // 更新地图中plot图层的数据
      const layers = window.map.getLayers();
      let plotLayer = layers.filter((item: any) => item.get('name') == 'plotLayer')[0];
      plotLayer.setData(newPlotInfo, {
        lnglat: 'lnglat',
      });
      plotLayer.render();
    }
  };
  return (
    <>
      {!step2RangeVisible && (
        <>
          <Form.Item label="" name="east" rules={[{ required: true, message: '请输入!' }]}>
            <Search addonBefore="东至" placeholder="请输入!" autoComplete="off" enterButton />
          </Form.Item>
          <Form.Item label="" name="south" rules={[{ required: true, message: '请输入!' }]}>
            <Search addonBefore="南至" placeholder="请输入!" autoComplete="off" enterButton />
          </Form.Item>
          <Form.Item label="" name="west" rules={[{ required: true, message: '请输入!' }]}>
            <Search addonBefore="西至" placeholder="请输入!" autoComplete="off" enterButton />
          </Form.Item>
          <Form.Item label="" name="north" rules={[{ required: true, message: '请输入!' }]}>
            <Search addonBefore="北至" placeholder="请输入!" autoComplete="off" enterButton />
          </Form.Item>
          <Form.Item label="" name="notice" rules={[{ required: true, message: '请输入!' }]}>
            <Space className={styles.spaceContain}>
              <span className={styles.prefix}>*</span>
              <p>
                {' '}
                建设项目邻近的城市次干路（若为项目边界则顺移至下一条）或主干路、黄浦江、苏州河、其他四级以上内河航道、地面铁路干线等天然屏障围合的范围。
              </p>
            </Space>
          </Form.Item>
          <div className={styles.btn}>
            <Button style={{ width: '100%' }} type="primary" onClick={handleOnConfirmRange}>
              {' '}
              确认研究范围
            </Button>
          </div>
          <Form.Item label="" name="notice" rules={[{ required: false, message: '请输入!' }]}>
            <Space className={styles.spaceContain}>
              <span className={styles.prefix}>*</span>
              <a>依据《上海市建设项目交通影响评价技术标准》（DG/TJ08-2165-2015）</a>
            </Space>
          </Form.Item>
        </>
      )}
      {step2RangeVisible && (
        <div className={styles.step2PlanPlots}>
          <Form.Item label="地块编号" name="code" rules={[{ required: true, message: '请输入!' }]}>
            <Input placeholder="地块编号(必填)" />
          </Form.Item>
          <Form.Item
            label="用地性质"
            name="nature"
            rules={[{ required: true, message: '请选择!' }]}
          >
            <Cascader
              fieldNames={{ label: 'name', value: 'id' }}
              // changeOnSelect
              // options={dictData['kgydxz']}
              options={kgydxzData}
              onChange={(value: any, selectedOptions: any) => {
                // let title = '';
                // selectedOptions.forEach((item: any, index: number) => {
                //   title += item.name;
                //   if (index < selectedOptions.length - 1) {
                //     title += '/';
                //   }
                // });
                // setNatureTitle(title);
                setSelectedRegulatoryPlanningLand(selectedOptions);
              }}
              placeholder="请选择"
            />
            {/* <Select placeholder="用地性质(必填)" style={{ width: '100%' }}>
              <Option value="jack">Jack</Option>
            </Select> */}
          </Form.Item>
          <Form.Item
            label="建筑面积"
            name="buildArea"
            rules={[{ required: true, message: '请输入!' }]}
          >
            <Input placeholder="建筑面积(必填)" />
          </Form.Item>
          <Space>
            <Form.Item
              label="建成周期"
              name="buildYear"
              rules={[{ required: true, message: '请选择!' }]}
            >
              <Select placeholder="建成周期(必填)" labelInValue style={{ width: '170px' }}>
                <Option value="1">近期</Option>
                <Option value="2">远期</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="建成年份"
              name="buildEndAt"
              rules={[{ required: true, message: '请选择!' }]}
            >
              <DatePicker
                placeholder="请选择"
                picker="year"
                // disabledDate={disabledDate}
                style={{ width: '170px' }}
              />
            </Form.Item>
          </Space>
          <div className={styles.moreInfo}>
            <a onClick={handleOnMoreClick}>更多信息</a>
          </div>
          {moreInfoFlag && (
            <div className={styles.moreInfoContent}>
              <ul>
                <li>
                  <span className={styles.infoTitle}>日出行量(Ptrip/d)</span>
                  <span className={styles.infoValue}>123</span>
                </li>
                <li>
                  <span className={styles.infoTitle}>高峰小时产生量(Pcu/h)</span>
                  <span className={styles.infoValue}>100</span>
                </li>
                <li>
                  <span className={styles.infoTitle}>高峰小时吸引量(Pcu/h)</span>
                  <span className={styles.infoValue}>200</span>
                </li>
              </ul>
            </div>
          )}
          <div className={styles.step2_tools}>
            <Space direction="vertical" style={{ width: '95%' }}>
              <Button type="primary" style={{ width: '100%' }} onClick={handleOnConfirm}>
                确定
              </Button>
              <Button danger style={{ width: '100%' }}>
                删除
              </Button>
            </Space>
          </div>
        </div>
      )}
    </>
  );
};

export default Step2Comp;
