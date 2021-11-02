import React, { useState, useEffect } from 'react';
import { EditOutlined, createFromIconfontCN } from '@ant-design/icons';
import { message, Button, Space, Input, Select, Form, TreeSelect, Row, Col } from 'antd';
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
import { createPlot } from '@/services/v2/plot';
import styles from './index.less';
interface Step1Props {
  plotRecordDataIndex: any;
  setPlotRecordDataIndex: Function;
  // plotRecordData: any;
  // setPlotRecordData: Function;
  plotInfoData: any[];
  setPlotInfoData: Function;
  dictData: any;
  form: any;
}
declare let window: any;
const Step1Comp: React.FC<Step1Props> = (props) => {
  const agnhfjzmjData = [
    {
      title: '住宅',
      value: '1',
      code: 'Z01',
      children: [
        {
          title: '一类住宅',
          value: '2',
          code: 'Z011',
        },
        {
          title: '二类住宅',
          value: '3',
          code: 'Z012',
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
  const [currentData, setCurrentData] = useState<any>(undefined);

  const handleOnPlotSetValue = (value: any, type: any) => {
    let index = plotRecordDataIndex;
    let newPlotInfo = plotInfoData.concat([]);
    if (plotRecordDataIndex == 'undefined') {
      message.warning('请先选择基地地块!');
      form.resetFields(['plotPartitioning']);
      return;
    }
    if (plotInfoData.length == 0) {
      message.warning('请先绘制基地地块!');
      form.resetFields(['plotPartitioning']);
      return;
    }
    if (type == 'plotPartitioning') {
      let newFPBuildArea = newPlotInfo[index]?.plotPartitioning || [];
      const valueIds = value.map((item: any) => item.value);
      newFPBuildArea.forEach((item: any, index: number) => {
        if (valueIds.indexOf(item.id) == -1) {
          newFPBuildArea.splice(index, 1);
          form.resetFields([`funPBuildArea${item.id}`]);
        }
      });
      const newFPBuildAreaIds = newFPBuildArea.map((item: any) => item.id);
      value.forEach((fItem: any) => {
        agnhfjzmjData.forEach((item: any, index: number) => {
          let id = fItem.value;
          if (fItem.value == item.value) {
            item.children.forEach((item1: any, index1: number) => {
              newFPBuildArea.push({
                parentName: item.title,
                id: item1.value,
                name: item1.title,
                code: item1.code,
              });
            });
          } else {
            item.children.forEach((item1: any, index1: number) => {
              if (fItem.value == item1.value) {
                if (newFPBuildAreaIds.indexOf(id) == -1) {
                  newFPBuildArea.push({
                    parentName: item.title,
                    id: item1.value,
                    name: item1.title,
                    code: item1.code,
                  });
                }
              }
            });
          }
        });
      });
      console.log('newFPBuildArea', newFPBuildArea);
      newPlotInfo.splice(index, 1, {
        ...plotInfoData[index],
        [type]: newFPBuildArea,
        // fpBuildAreaInput: value,
      });
    }
    setPlotInfoData(newPlotInfo);
  };
  const handleOnBuildAreaSetValue = (value: any, index: number, item: any, type: any) => {
    let plotIndex = plotRecordDataIndex;
    let newPlotInfo = plotInfoData.concat([]);
    let newBuildArea = newPlotInfo[plotIndex].plotPartitioning;
    newBuildArea = newBuildArea.map((ele: any) => {
      if (item.id == ele.id) {
        ele.area = value;
      }
      return ele;
    });
    newPlotInfo.splice(plotIndex, 1, {
      ...newPlotInfo[plotIndex],
      plotPartitioning: newBuildArea,
    });
    setPlotInfoData(newPlotInfo);
  };
  // 更新地图中plot图层的数据
  const handleOnSetPlotLayerData = (data: any[]) => {
    const layers = window.map.getLayers();
    let plotLayer = layers.filter((item: any) => item.get('name') == 'plotLayer')[0];
    plotLayer.setData(data, {
      lnglat: 'lnglat',
    });
    plotLayer.render();
  };
  // 确定
  const handleOnConfirm = async () => {
    if (plotRecordDataIndex == 'undefined') {
      message.warning('请选择基地地块!');
      return;
    }
    const formData = await form.validateFields();
    console.log('formData', formData);
    let newPlotInfo = plotInfoData.concat([]);
    let objData = newPlotInfo[plotRecordDataIndex];
    delete objData['checked'];
    const res = await createPlot({
      ...objData,
      code: formData.code,
      type: '1',
    });
    if (res.code != 200) {
      message.warning('基地地块保存失败!');
      return;
    }
    message.success('基地地块保存成功!');
    newPlotInfo.splice(plotRecordDataIndex, 1, {
      ...objData,
      code: formData.code,
      type: '1',
      plotId: res.data._id,
      status: 1,
    });
    form.resetFields();
    localStorage.setItem('plotInfo', JSON.stringify(newPlotInfo));
    // console.log('newPlotInfo', newPlotInfo);
    setPlotRecordDataIndex(undefined);
    setPlotInfoData(newPlotInfo);
    handleOnSetPlotLayerData(newPlotInfo);
  };
  return (
    <>
      <Form.Item label="地块编号" name="code" rules={[{ required: true, message: '请输入!' }]}>
        <Input placeholder="地块编号(必填)" />
      </Form.Item>
      <div className={styles.step1formItemContainer}>
        <Form.Item
          label="按地块分类"
          name={`plotPartitioning`}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[{ required: true, message: '请输入' }]}
        >
          <TreeSelect
            // treeData={dictData['agnhfjzmj']}
            treeData={agnhfjzmjData}
            treeCheckable={true}
            showCheckedStrategy={SHOW_PARENT}
            placeholder="请选择"
            labelInValue
            style={{
              textAlign: 'left',
            }}
            onChange={(value, label, extra) => {
              console.log(value);
              handleOnPlotSetValue(value, 'plotPartitioning');
            }}
          />
        </Form.Item>
        {plotInfoData[plotRecordDataIndex]?.plotPartitioning &&
          plotInfoData[plotRecordDataIndex].plotPartitioning.map((item: any, index: any) => {
            return (
              <Form.Item
                key={index}
                label={item.name + '建筑面积'}
                name={`area_${item.code}`}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                style={{ marginLeft: '20px' }}
                rules={[{ required: true, message: '请输入' }]}
              >
                <Input
                  placeholder="请输入"
                  addonAfter="㎡"
                  onChange={(e) => handleOnBuildAreaSetValue(e.target.value, index, item, 'area')}
                />
              </Form.Item>
            );
          })}
      </div>
      <div className={styles.content_tools}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button type="primary" style={{ width: '100%' }} onClick={handleOnConfirm}>
            确定
          </Button>
          <Button danger style={{ width: '100%' }}>
            删除
          </Button>
        </Space>
      </div>
    </>
  );
};

export default Step1Comp;
