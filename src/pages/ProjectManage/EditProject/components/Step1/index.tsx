import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Divider,
  Input,
  Select,
  DatePicker,
  Alert,
  Row,
  Col,
  Table,
  InputNumber,
  TreeSelect,
  Space,
  Tag,
  Cascader,
} from 'antd';
const { SHOW_PARENT } = TreeSelect;
import { connect, Dispatch } from 'umi';
import lodash from 'lodash';
import moment from 'moment';
import { getTreeData } from '@/tools';
import Loading from '@/components/Loading';
import { StateType } from '../../model';
import styles from './index.less';
import { getDictData } from '@/services/projectManage';

const { Option } = Select;

const formItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 8,
  },
};
interface Step1Props {
  stepData: any;
  current: any;
  currentRecord: any;
  dispatch?: Dispatch;
}

const Step1: React.FC<Step1Props> = (props) => {
  const { dispatch, current, stepData, currentRecord } = props;
  const [form] = Form.useForm();
  const { validateFields } = form;
  const [plotInfoData, setPlotInfoData] = useState<any>([]);
  const [dictData, setDictData] = useState<any>({});
  const [natureTitle, setNatureTitle] = useState<any>('');
  const [selectedPlanningArea, setSelectedPlanningArea] = useState<any>([]);
  const [selectedRegulatoryPlanningLand, setSelectedRegulatoryPlanningLand] = useState<any>([]);
  const [zoneBitSelectedOptions, setZoneBitSelectedOptions] = useState<any>([]);
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false);
  useEffect(() => {
    // getDictDataAll();
    if (currentRecord && Object.keys(stepData.step1Form).length > 0) {
      form.setFieldsValue({
        ...stepData.step1Form,
        designAt: moment(stepData.step1Form.designAt),
        buildYear: moment(stepData.step1Form.buildYear),
      });
      setPlotInfoData(stepData.step1Form.plotInfo);
      return;
    }
    //  else {
    //   handleOnInitForm();
    // }
  }, []);
  useEffect(() => {
    if (currentRecord && Object.keys(currentRecord).length > 0) {
      if (JSON.stringify(dictData) == '{}') {
        getDictDataAll();
      }
      console.log('currentRecord', currentRecord);
      handleOnInitForm();
    }
  }, [currentRecord]);
  const handleOnInitForm = () => {
    if (currentRecord && Object.keys(currentRecord).length > 0) {
      let initFormData = {};
      console.log('currentRecord.plotInfo', currentRecord.plotInfo);
      let initPlotData = currentRecord?.plotInfo.map((item: any, index: number) => {
        initFormData[`code${index}`] = item.code;
        // initFormData[`nature${index}`] = item.nature.map((n: any) => {
        //   return { label: n.name, value: n.id };
        // });
        initFormData[`motorParking${index}`] = item.motorParking;
        initFormData[`notMotorParking${index}`] = item.notMotorParking;
        const fpBuildAreaInput = item?.functionalPartitioningBuildArea.map(
          (item1: any, index1: number) => {
            initFormData[`funPBuildArea_${index}_${item1.child.id}`] = item1.child.area;
            return {
              value: item1.child.id,
              label: item1.child.name,
            };
          },
        );
        initFormData[`functionalPartitioningBuildArea${index}`] = fpBuildAreaInput;
        // console.log('item.businessFormat', item.businessFormat);
        let newBusinessFormat = item.businessFormat.map((item: any) => {
          if (item.parentName == '??????') {
            const newHouseType = item.houseType.map((item1: any) => {
              if (item.name == '???????????????????????????') {
                initFormData[`houseTypeArea_${index}_${item.id}_${item1.id}`] = item1.area;
                initFormData[`houseTypeNumber_${index}_${item.id}_${item1.id}`] = item1.number;
                initFormData[`houseTypeAverageArea_${index}_${item.id}_${item1.id}`] =
                  item1.avgArea;
              } else {
                initFormData[`houseTypeArea_${index}_${item.id}_${item1.id}`] = item1.area;
                initFormData[`houseTypeNumber_${index}_${item.id}_${item1.id}`] = item1.number;
              }
              return {
                value: item1.id,
                label: item1.name,
              };
            });
            initFormData[`houseType_${index}_${item.id}`] = newHouseType;
          }
          if (item.parentName == '??????') {
            initFormData[`numberOfStudents_${index}_${item.id}`] = item.numberOfStudents;
            initFormData[`numberOfTeacher_${index}_${item.id}`] = item.numberOfTeacher;
          }
          if (item.parentName == '??????') {
            if (item.numberOfGuest) {
              initFormData[`numberOfGuest_${index}_${item.id}`] = item.numberOfGuest;
            }
          }
          if (item.parentName != '??????') {
            initFormData[`area_${index}_${item.id}`] = item.area;
          }
          return {
            value: item.id,
            label: item.name,
          };
        });
        initFormData[`businessFormat${index}`] = newBusinessFormat;
        return {
          _id: item._id,
          code: item.code,
          // nature: item.nature.map((n: any) => {
          //   return { name: n.name, id: n.id };
          // }),
          motorParking: item.motorParking,
          notMotorParking: item.notMotorParking,
          // fpBuildAreaInput: fpBuildAreaInput,
          businessFormat: item.businessFormat,
          functionalPartitioningBuildArea: item.functionalPartitioningBuildArea,
          type: '1',
        };
      });
      form.setFieldsValue({
        name: currentRecord.name,
        buildYear: moment(currentRecord.buildYear),
        designAt: moment(currentRecord.designAt),
        address: currentRecord.address,
        plotNumber: currentRecord.plotNumber,
        administrativeRegion: {
          label: currentRecord.administrativeRegion,
          value: currentRecord.administrativeRegionId,
        },
        regulatoryPlanningLand: currentRecord.regulatoryPlanningLandId.split(','),
        planningArea: currentRecord?.planningAreaId?.split(','),
        zoneBit: currentRecord.zoneBitId.split(','),
        startThresholdArea: {
          label: currentRecord.startThresholdArea,
          value: currentRecord.startThresholdAreaId + '_' + currentRecord.startThresholdAreaCode,
        },
        staticDistinguishArea: {
          label: currentRecord.staticDistinguishArea,
          value:
            currentRecord.staticDistinguishAreaId + '_' + currentRecord.staticDistinguishAreaCode,
        },
        chargingPileDistinguishArea: {
          label: currentRecord.chargingPileDistinguishArea,
          value: currentRecord.chargingPileDistinguishAreaId,
        },
        landArea: currentRecord.landArea,
        buildArea: currentRecord.buildArea,
        aboveBuildArea: currentRecord.aboveBuildArea,
        belowBuildArea: currentRecord.belowBuildArea,
        studyPhase: {
          label: currentRecord.studyPhase,
          value: currentRecord.studyPhaseId,
        },
        ...initFormData,
      });
      setNatureTitle(currentRecord.regulatoryPlanningLand);
      setPlotInfoData(initPlotData);
    }
  };
  const onValidateForm = async () => {
    let values: any = await validateFields();
    // for (let key in values) {
    //   if (values.hasOwnProperty(key)) {
    //     if (key.indexOf('roadNum') != -1 || key.indexOf('roadType') != -1) {
    //       delete values[key];
    //     }
    //   }
    // }
    if (dispatch) {
      dispatch({
        type: 'projectManageAndEditProject/saveStepFormData',
        payload: {
          step1Form: {
            ...values,
            designAt: moment(values['designAt']).format('YYYY-MM-DD'),
            buildYear: moment(values['buildYear']).format('YYYY-MM-DD'),
            plotInfo: plotInfoData.map((item: any) => {
              delete item['id'];
              // delete item['fpBuildAreaInput'];
              return item;
            }),
            selectedPlanningArea,
            selectedRegulatoryPlanningLand,
            zoneBitSelectedOptions,
            // functionalPartitioningBuildArea: buildAreas,
          },
        },
      });
      dispatch({
        type: 'projectManageAndEditProject/saveCurrentStep',
        payload: '1',
      });
    }
  };
  const columns: any[] = [
    {
      title: '??????',
      dataIndex: 'index',
      key: 'index',
      width: 70,
      align: 'center',
      render: (text: any, record: any, index: any) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: '????????????',
      dataIndex: 'code',
      key: 'code',
      align: 'center',
      // width: 120,
      render: (text: any, record: any, index: any) => {
        return (
          <Form.Item
            label=""
            name={`code${index}`}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: '?????????' }]}
          >
            <Input
              placeholder="?????????"
              onChange={(e) => handleOnSetValue(e.target.value, index, 'code')}
            />
          </Form.Item>
        );
      },
    },
    {
      title: '????????????',
      dataIndex: 'setting',
      key: 'setting',
      align: 'center',
      render: (text: any, record: any, index: any) => {
        return (
          <>
            {/* <div>
              <div className={styles.nature}>
                <Space>
                  <span style={{ color: 'red' }}>*</span>
                  <span>????????????</span>
                </Space>
              </div>
              <div className={styles.natureName}>
                <Tag>{natureTitle}</Tag>
              </div>
            </div> */}
            <Form.Item
              label="????????????????????????????????????"
              name={`motorParking${index}`}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[{ required: true, message: '?????????' }]}
            >
              <Input
                placeholder="?????????"
                onChange={(e) => handleOnSetValue(e.target.value, index, 'motorParking')}
              />
            </Form.Item>
            <Form.Item
              label="???????????????????????????????????????"
              name={`notMotorParking${index}`}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[{ required: true, message: '?????????' }]}
            >
              <Input
                placeholder="?????????"
                onChange={(e) => handleOnSetValue(e.target.value, index, 'notMotorParking')}
              />
            </Form.Item>
            <Form.Item
              label="???????????????????????????"
              name={`businessFormat${index}`}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[{ required: true, message: '?????????' }]}
            >
              <TreeSelect
                treeData={dictData['dkssyt']}
                treeCheckable={true}
                // showCheckedStrategy={SHOW_PARENT}
                // treeCheckStrictly={true}
                placeholder="?????????"
                labelInValue
                style={{
                  textAlign: 'left',
                }}
                onChange={(value, label, extra) => {
                  handleOnSetValue(value, index, 'businessFormat');
                }}
              />
            </Form.Item>
            {record.businessFormat &&
              record.businessFormat.map((item: any, index1: any) => {
                if (item.parentName == '??????') {
                  return (
                    <div key={index1} style={{ marginLeft: '15px', marginBottom: '5px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <Space>
                          <span style={{ color: 'red' }}>*</span>
                          <span>{item.name}</span>
                        </Space>
                      </div>
                      <Form.Item
                        label="??????????????????"
                        name={`houseType_${index}_${item.id}`}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        className={styles.leftGap}
                        rules={[{ required: true, message: '?????????' }]}
                      >
                        <TreeSelect
                          treeData={dictData['zzahjmjfl']}
                          treeCheckable={true}
                          // showCheckedStrategy={SHOW_PARENT}
                          // treeCheckStrictly={true}
                          placeholder="?????????"
                          labelInValue
                          style={{
                            textAlign: 'left',
                          }}
                          onChange={(value, label, extra) => {
                            console.log(value);
                            handleOnSetBusinessFormatValue(
                              value,
                              index,
                              index1,
                              item.parentName,
                              'houseType',
                            );
                          }}
                        />
                      </Form.Item>
                      {record.businessFormat[index1]?.houseType &&
                        record.businessFormat[index1]?.houseType.map((item1: any, index2: any) => {
                          return (
                            <div key={index2} className={`${styles.leftGap} ${styles.topGap}`}>
                              <div style={{ textAlign: 'left', marginBottom: '5px' }}>
                                <Space>
                                  <span style={{ color: 'red' }}>*</span>
                                  <span>{item1.name}</span>
                                </Space>
                              </div>
                              {item.name == '???????????????????????????' && (
                                <Form.Item
                                  label="??????????????????"
                                  name={`houseTypeAverageArea_${index}_${item.id}_${item1.id}`}
                                  labelCol={{ span: 7 }}
                                  wrapperCol={{ span: 16 }}
                                  className={styles.leftGap}
                                  rules={[{ required: true, message: '?????????' }]}
                                >
                                  <Input
                                    placeholder="?????????"
                                    addonAfter="???"
                                    onChange={(e) =>
                                      handleOnSetBusinessFormatValue(
                                        e.target.value,
                                        index,
                                        index1,
                                        item.parentName,
                                        'avgArea',
                                        index2,
                                      )
                                    }
                                  />
                                </Form.Item>
                              )}
                              <Form.Item
                                label="????????????"
                                name={`houseTypeArea_${index}_${item.id}_${item1.id}`}
                                labelCol={{ span: 7 }}
                                wrapperCol={{ span: 16 }}
                                className={`${styles.leftGap} ${styles.topGap}`}
                                rules={[{ required: true, message: '?????????' }]}
                              >
                                <Input
                                  placeholder="?????????"
                                  addonAfter="???"
                                  onChange={(e) =>
                                    handleOnSetBusinessFormatValue(
                                      e.target.value,
                                      index,
                                      index1,
                                      item.parentName,
                                      'area',
                                      index2,
                                    )
                                  }
                                />
                              </Form.Item>
                              <Form.Item
                                label="??????"
                                name={`houseTypeNumber_${index}_${item.id}_${item1.id}`}
                                labelCol={{ span: 7 }}
                                wrapperCol={{ span: 16 }}
                                className={`${styles.leftGap} ${styles.topGap}`}
                                rules={[{ required: true, message: '?????????' }]}
                              >
                                <Input
                                  placeholder="?????????"
                                  addonAfter="???"
                                  onChange={(e) =>
                                    handleOnSetBusinessFormatValue(
                                      e.target.value,
                                      index,
                                      index1,
                                      item.parentName,
                                      'number',
                                      index2,
                                    )
                                  }
                                />
                              </Form.Item>
                            </div>
                          );
                        })}
                    </div>
                  );
                }
                if (item.parentName == '??????') {
                  return (
                    <div key={index1} className={styles.leftGap} style={{ marginTop: '15px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <Space>
                          <span style={{ color: 'red' }}>*</span>
                          <span>{item.name}</span>
                        </Space>
                      </div>
                      <Form.Item
                        label="????????????"
                        name={`numberOfStudents_${index}_${item.id}`}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        className={styles.leftGap}
                        rules={[{ required: true, message: '?????????' }]}
                      >
                        <Input
                          placeholder="?????????"
                          addonAfter="???"
                          onChange={(e) =>
                            handleOnSetBusinessFormatValue(
                              e.target.value,
                              index,
                              index1,
                              item.parentName,
                              'numberOfStudents',
                            )
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        label="??????????????????"
                        name={`numberOfTeacher_${index}_${item.id}`}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        className={`${styles.leftGap} ${styles.topGap}`}
                        rules={[{ required: true, message: '?????????' }]}
                      >
                        <Input
                          placeholder="?????????"
                          addonAfter="???"
                          onChange={(e) =>
                            handleOnSetBusinessFormatValue(
                              e.target.value,
                              index,
                              index1,
                              item.parentName,
                              'numberOfTeacher',
                            )
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        label="????????????"
                        name={`area_${index}_${item.id}`}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        className={`${styles.leftGap} ${styles.topGap}`}
                        rules={[{ required: true, message: '?????????' }]}
                      >
                        <Input
                          placeholder="?????????"
                          addonAfter="???"
                          onChange={(e) =>
                            handleOnSetBusinessFormatValue(
                              e.target.value,
                              index,
                              index1,
                              item.parentName,
                              'area',
                            )
                          }
                        />
                      </Form.Item>
                    </div>
                  );
                }
                if (item.parentName == '??????') {
                  return (
                    <div className={styles.leftGap} key={index1} style={{ marginTop: '15px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <Space>
                          <span style={{ color: 'red' }}>*</span>
                          <span>{item.name}</span>
                        </Space>
                      </div>
                      {item.name != '??????' && item.name != '????????????' && (
                        <Form.Item
                          label="????????????"
                          name={`numberOfGuest_${index}_${item.id}`}
                          labelCol={{ span: 6 }}
                          wrapperCol={{ span: 18 }}
                          className={styles.leftGap}
                          rules={[{ required: true, message: '?????????' }]}
                        >
                          <Input
                            placeholder="?????????"
                            addonAfter="???"
                            onChange={(e) =>
                              handleOnSetBusinessFormatValue(
                                e.target.value,
                                index,
                                index1,
                                item.parentName,
                                'numberOfGuest',
                              )
                            }
                          />
                        </Form.Item>
                      )}
                      <Form.Item
                        label="????????????"
                        name={`area_${index}_${item.id}`}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        className={`${styles.leftGap} ${styles.topGap}`}
                        rules={[{ required: true, message: '?????????' }]}
                      >
                        <Input
                          placeholder="?????????"
                          addonAfter="???"
                          onChange={(e) =>
                            handleOnSetBusinessFormatValue(
                              e.target.value,
                              index,
                              index1,
                              item.parentName,
                              'area',
                            )
                          }
                        />
                      </Form.Item>
                    </div>
                  );
                }
                if (
                  item.parentName == '??????' ||
                  item.parentName == '??????' ||
                  item.parentName == '??????'
                ) {
                  return (
                    <div className={styles.leftGap} key={index1} style={{ marginTop: '15px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <Space>
                          <span style={{ color: 'red' }}>*</span>
                          <span>{item.name}</span>
                        </Space>
                      </div>
                      <Form.Item
                        label="????????????"
                        name={`area_${index}_${item.id}`}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        className={styles.leftGap}
                        rules={[{ required: true, message: '?????????' }]}
                      >
                        <Input
                          placeholder="?????????"
                          addonAfter="???"
                          onChange={(e) =>
                            handleOnSetBusinessFormatValue(
                              e.target.value,
                              index,
                              index1,
                              item.parentName,
                              'area',
                            )
                          }
                        />
                      </Form.Item>
                    </div>
                  );
                }
              })}
            <Form.Item
              label="???????????????"
              name={`functionalPartitioningBuildArea${index}`}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[{ required: true, message: '?????????' }]}
            >
              <TreeSelect
                treeData={dictData['agnhfjzmj']}
                treeCheckable={true}
                showCheckedStrategy={SHOW_PARENT}
                placeholder="?????????"
                labelInValue
                style={{
                  textAlign: 'left',
                }}
                onChange={(value, label, extra) => {
                  console.log(value);
                  handleOnSetValue(value, index, 'functionalPartitioningBuildArea');
                }}
              />
            </Form.Item>
            {record.functionalPartitioningBuildArea &&
              record.functionalPartitioningBuildArea.map((item: any, index1: any) => {
                return (
                  <Form.Item
                    key={index1}
                    label={item.child.name + '????????????'}
                    name={`funPBuildArea_${index}_${item.child.id}`}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    style={{ marginLeft: '20px' }}
                    rules={[{ required: true, message: '?????????' }]}
                  >
                    <Input
                      placeholder="?????????"
                      addonAfter="???"
                      onChange={(e) =>
                        handleOnBuildAreaSetValue(e.target.value, index, item, 'area')
                      }
                    />
                  </Form.Item>
                );
              })}
          </>
        );
      },
    },
  ];
  const handleOnPlotNum = (num: any) => {
    let newPlotInfoData: any[] = plotInfoData.concat([]);
    if (num > newPlotInfoData.length) {
      for (let i = 0; i < num - newPlotInfoData.length; i++) {
        newPlotInfoData.push({
          id: newPlotInfoData.length + i,
        });
      }
    } else {
      newPlotInfoData = newPlotInfoData.slice(0, num);
    }
    // console.log("newPlotInfoData",newPlotInfoData);
    setPlotInfoData(newPlotInfoData);
  };
  //
  const handleOnSetValue = (value: any, index: number, type: any) => {
    let newPlotInfo = plotInfoData.concat([]);
    if (type == 'nature') {
      newPlotInfo.splice(index, 1, {
        ...plotInfoData[index],
        [type]: value.map((item: any) => {
          return {
            id: item.value,
            name: item.label,
          };
        }),
      });
    } else if (type == 'functionalPartitioningBuildArea') {
      let newFPBuildArea = newPlotInfo[index].functionalPartitioningBuildArea || [];
      const valueIds = value.map((item: any) => item.value);
      newFPBuildArea.forEach((item: any, index: number) => {
        if (valueIds.indexOf(item.child.id) == -1) {
          newFPBuildArea.splice(index, 1);
          form.resetFields([`funPBuildArea${item.child.id}`]);
        }
      });
      const newFPBuildAreaIds = newFPBuildArea.map((item: any) => item.child.id);
      value.forEach((fItem: any) => {
        dictData['agnhfjzmj'].forEach((item: any, index: number) => {
          let id = fItem.value;
          item.children.forEach((item1: any, index1: number) => {
            if (fItem.value == item1.value) {
              if (newFPBuildAreaIds.indexOf(id) == -1) {
                newFPBuildArea.push({
                  value: item._id,
                  label: item.name,
                  code: item.code,
                  key: item._id,
                  child: {
                    id: item1._id,
                    name: item1.name,
                    code: item1.code,
                  },
                });
              }
            }
          });
        });
      });
      // console.log("newFPBuildArea",newFPBuildArea);
      newPlotInfo.splice(index, 1, {
        ...plotInfoData[index],
        [type]: newFPBuildArea,
        // fpBuildAreaInput: value,
      });
    } else if (type == 'businessFormat') {
      let newBusinessFormat = newPlotInfo[index].businessFormat || [];
      const valueIds = value.map((item: any) => item.value);
      newBusinessFormat.forEach((item: any, index: number) => {
        if (valueIds.indexOf(item.id) == -1) {
          form.resetFields([
            `houseType${item.id}`,
            `numberOfStudents${item.id}`,
            `numberOfTeacher${item.id}`,
            `numberOfGuest${item.id}`,
          ]);
          item?.houseType?.forEach((item1: any) => {
            form.resetFields([
              `houseTypeArea${item.id}_${item1.id}`,
              `houseTypeNumber${item.id}_${item1.id}`,
            ]);
          });
          newBusinessFormat.splice(index, 1);
        }
      });
      const newBusinessFormatIds = newBusinessFormat?.map((item: any) => item.id);
      value.forEach((fItem: any) => {
        let id = fItem.value;
        if (newBusinessFormatIds.indexOf(id) == -1) {
          dictData['dkssyt'].forEach((item: any, index: number) => {
            item.children.forEach((item1: any, index1: number) => {
              if (fItem.value == item1.value) {
                newBusinessFormat.push({
                  id: fItem.value,
                  name: fItem.label,
                  code: item1.code,
                  parentName: item.name,
                });
              }
            });
          });
        }
      });
      // console.log('newBusinessFormat', newBusinessFormat);
      newPlotInfo.splice(index, 1, {
        ...plotInfoData[index],
        [type]: newBusinessFormat,
      });
    } else {
      newPlotInfo.splice(index, 1, {
        ...plotInfoData[index],
        [type]: value,
      });
    }
    setPlotInfoData(newPlotInfo);
  };
  const handleOnBuildAreaSetValue = (value: any, parentIndex: number, item: any, type: any) => {
    let newPlotInfo = plotInfoData.concat([]);
    let newBuildArea = newPlotInfo[parentIndex].functionalPartitioningBuildArea;
    newBuildArea = newBuildArea.map((ele: any) => {
      if (item.child.id == ele.child.id) {
        ele.child.area = value;
      }
      return ele;
    });
    newPlotInfo.splice(parentIndex, 1, {
      ...newPlotInfo[parentIndex],
      functionalPartitioningBuildArea: newBuildArea,
      type: '1',
    });
    setPlotInfoData(newPlotInfo);
  };
  // ??????
  const handleOnSetBusinessFormatValue = (
    value: any,
    index: number,
    index1: number,
    parentName: string,
    type: any,
    index2?: any,
  ) => {
    let newPlotInfo = plotInfoData.concat([]);
    let newBusinessFormat = newPlotInfo[index].businessFormat || [];
    if (parentName == '??????') {
      if (type == 'houseType') {
        newBusinessFormat.splice(index1, 1, {
          ...newBusinessFormat[index1],
          houseType: value.map((hItem: any) => {
            let currentHouseType = dictData['zzahjmjfl'].filter(
              (item: any) => item._id == hItem.value,
            );
            return {
              id: hItem.value,
              name: hItem.label,
              code: currentHouseType[0]?.code,
            };
          }),
        });
      }
      if (type == 'area' || type == 'avgArea' || type == 'number') {
        let newHouseType = newPlotInfo[index]?.businessFormat[index1]?.houseType || [];
        let number = 0;
        let area = 0;
        newHouseType.splice(index2, 1, {
          ...newHouseType[index2],
          [type]: value,
        });
        newHouseType.forEach((item: any) => {
          if (item.area) {
            area += Number(item.area);
          }
          if (item.number) {
            number += Number(item.number);
          }
        });
        newBusinessFormat.splice(index1, 1, {
          ...newBusinessFormat[index1],
          number: number + '',
          area: area + '',
          houseType: newHouseType,
        });
      }
    }
    if (parentName != '??????') {
      newBusinessFormat.splice(index1, 1, {
        ...newBusinessFormat[index1],
        [type]: value,
      });
    }
    // console.log("newBusinessFormat",newBusinessFormat);
    newPlotInfo.splice(index, 1, {
      ...newPlotInfo[index],
      businessFormat: newBusinessFormat,
      type: '1',
    });
    // console.log("newPlotInfo-------",newPlotInfo);
    setPlotInfoData(newPlotInfo);
  };
  //???????????????
  const getDictDataAll = () => {
    setLoadingFlag(true);
    let parentIds = [
      {
        name: '???????????????',
        type: 'ssxzq',
        parentId: '606c33c676426f003c7039e1',
      },
      {
        name: '????????????????????????',
        type: 'qdfzssqy',
        parentId: '606d10a0621189002f1bc7ed',
      },
      {
        name: '????????????????????????',
        type: 'jtpbssqy',
        parentId: '606d1ab7baf2e30043bd3bfd',
      },
      {
        name: '?????????????????????????????????',
        type: 'cdzcwpbssqy',
        parentId: '606d241c41bcccaa247dc0ec',
      },
      {
        name: '??????????????????',
        type: 'kgydxz',
        parentId: '606d275341bcccaa247dc0f4',
      },
      {
        name: '?????????????????????????????????????????????)',
        type: 'agnhfjzmj',
        parentId: '6066f305621189002f1bc6d0',
      },
      {
        name: '????????????????????????????????????',
        type: 'ssghqy',
        parentId: '6066f17276426f003c7039dc',
      },
      {
        name: '??????????????????',
        type: 'xmyjsd',
        parentId: '607696f3a67748bbc5c764bb',
      },
      {
        name: '??????????????????',
        type: 'dkssyt',
        parentId: '607ea7ebbe59b58b9807b4ab',
      },
      {
        name: '???????????????????????????',
        type: 'zzahjmjfl',
        parentId: '607eb051be59b58b9807b4c2',
      },
    ];
    // let parentId = parentIds.map((item)=>item.parentId);
    getDictData({ typeCode: 'baseData' }).then((res) => {
      if (res.code == 200) {
        let treeData = getTreeData(res.data, '0', 'allData');
        // console.log(treeData);
        let newDictData = {};
        parentIds.forEach((item: any) => {
          treeData.forEach((item1: any) => {
            if (item.parentId == item1._id) {
              if (item.type == 'dkssyt' || item.type == 'agnhfjzmj') {
                newDictData[item.type] = item1.children.map((item2: any) => {
                  return {
                    ...item2,
                    disabled: true,
                    checkable: false,
                  };
                });
              } else {
                newDictData[item.type] = item1.children;
              }
            }
          });
        });
        if (Object.keys(stepData.step1Form).length == 0) {
          // ??????????????????
          let newSelectedPlanningArea: any[] = [];
          newDictData['ssghqy'].forEach((item: any) => {
            if (currentRecord?.planningAreaId?.includes(item._id)) {
              newSelectedPlanningArea.push(item);
              item.children.forEach((item1: any) => {
                if (currentRecord.planningAreaId.includes(item1._id)) {
                  newSelectedPlanningArea.push(item1);
                }
              });
            }
          });
          // console.log("newSelectedPlanningArea",newSelectedPlanningArea);
          setSelectedPlanningArea(newSelectedPlanningArea);
          // ??????????????????
          let newSelectedRegulatoryPlanningLand: any[] = [];
          newDictData['kgydxz'].forEach((item: any) => {
            if (currentRecord?.regulatoryPlanningLandId?.includes(item._id)) {
              newSelectedRegulatoryPlanningLand.push(item);
              item.children.forEach((item1: any) => {
                if (currentRecord.regulatoryPlanningLandId.includes(item1._id)) {
                  newSelectedRegulatoryPlanningLand.push(item1);
                  item1?.children?.forEach((item2: any) => {
                    if (currentRecord.regulatoryPlanningLandId.includes(item2._id)) {
                      newSelectedRegulatoryPlanningLand.push(item2);
                    }
                  });
                }
              });
            }
          });
          setSelectedRegulatoryPlanningLand(newSelectedRegulatoryPlanningLand);
          // ??????????????????
          let newZoneBitSelectedOptions: any[] = [];
          newDictData['ssghqy'].forEach((item: any) => {
            if (currentRecord?.zoneBitId?.includes(item._id)) {
              newZoneBitSelectedOptions.push(item);
              item.children.forEach((item1: any) => {
                if (currentRecord.zoneBitId.includes(item1._id)) {
                  newZoneBitSelectedOptions.push(item1);
                }
              });
            }
          });
          // console.log('newZoneBitSelectedOptions', newZoneBitSelectedOptions);
          setZoneBitSelectedOptions(newZoneBitSelectedOptions);
        }
        // console.log(newDictData);
        setDictData(newDictData);
        setLoadingFlag(false);
      }
    });
  };
  // ???????????????
  const disabledDate = (current: any) => {
    // Can not select days before today and today
    return current && current < moment().endOf('day');
  };
  return (
    <>
      <Loading visible={loadingFlag} />
      <Form
        {...formItemLayout}
        form={form}
        layout="horizontal"
        className={styles.stepForm}
        // hideRequiredMark
        initialValues={{
          includeRoads: '1',
        }}
      >
        <Alert closable showIcon message="??????????????????????????????" style={{ marginBottom: 24 }} />
        <Form.Item label="????????????" name="name" rules={[{ required: true, message: '?????????' }]}>
          <Input placeholder="?????????" />
        </Form.Item>
        {/* <Form.Item label="????????????" name="design" rules={[{ required: true, message: '?????????' }]}>
          <Input placeholder="?????????" />
        </Form.Item> */}
        <Form.Item
          label="????????????"
          name="buildYear"
          rules={[{ required: true, message: '???????????????' }]}
        >
          <DatePicker
            placeholder="?????????"
            picker="year"
            // disabledDate={disabledDate}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          label="????????????"
          name="designAt"
          rules={[{ required: true, message: '???????????????' }]}
        >
          <DatePicker placeholder="?????????" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="????????????" name="address" rules={[{ required: true, message: '?????????' }]}>
          <Input placeholder="?????????" />
        </Form.Item>
        <Form.Item
          label="???????????????"
          name="administrativeRegion"
          rules={[{ required: true, message: '?????????' }]}
        >
          <Select style={{ width: '100%' }} placeholder="?????????" labelInValue>
            {dictData['ssxzq'] &&
              dictData['ssxzq'].map((item: any, index: number) => {
                return (
                  <Option key={index} value={item._id}>
                    {item.name}
                  </Option>
                );
              })}
          </Select>
        </Form.Item>
        <Form.Item
          label="??????????????????"
          name="regulatoryPlanningLand"
          rules={[{ required: true, message: '?????????' }]}
        >
          <Cascader
            fieldNames={{ label: 'name', value: '_id' }}
            // changeOnSelect
            options={dictData['kgydxz']}
            onChange={(value: any, selectedOptions: any) => {
              let title = '';
              selectedOptions.forEach((item: any, index: number) => {
                title += item.name;
                if (index < selectedOptions.length - 1) {
                  title += '/';
                }
              });
              setNatureTitle(title);
              setSelectedRegulatoryPlanningLand(selectedOptions);
            }}
            placeholder="?????????"
          />
        </Form.Item>
        <Form.Item
          label="??????????????????"
          name="plotNumber"
          rules={[{ required: true, message: '?????????' }]}
        >
          <InputNumber min={1} placeholder="?????????" onChange={handleOnPlotNum} />
        </Form.Item>
        <Row className={styles.roadNumTable}>
          <Col span={12} offset={8}>
            <Table
              rowKey={(record) => record.id}
              dataSource={plotInfoData}
              columns={columns}
              size="small"
              bordered
              pagination={false}
            />
          </Col>
        </Row>
        <Form.Item
          label="??????????????????"
          name="planningArea"
          rules={[{ required: true, message: '?????????' }]}
        >
          <Cascader
            fieldNames={{ label: 'name', value: '_id' }}
            // changeOnSelect
            options={dictData['ssghqy']}
            onChange={(value, selectedOptions) => {
              setSelectedPlanningArea(selectedOptions);
            }}
            placeholder="?????????"
          />
        </Form.Item>
        <Form.Item label="??????" name="zoneBit" rules={[{ required: true, message: '?????????' }]}>
          <Cascader
            fieldNames={{ label: 'name', value: '_id' }}
            changeOnSelect
            options={dictData['ssghqy']}
            onChange={(value, selectedOptions) => {
              // console.log(value);
              // console.log(selectedOptions);
              setZoneBitSelectedOptions(selectedOptions);
            }}
            placeholder="?????????"
          />
        </Form.Item>
        <Form.Item
          label="????????????????????????"
          name="startThresholdArea"
          rules={[{ required: true, message: '?????????' }]}
        >
          <Select labelInValue placeholder="?????????" style={{ width: '100%' }}>
            {dictData['qdfzssqy'] &&
              dictData['qdfzssqy'].map((item: any, index: number) => {
                return (
                  <Option key={index} value={`${item._id}_${item.code}`}>
                    {item.name}
                  </Option>
                );
              })}
          </Select>
        </Form.Item>
        <Form.Item
          label="????????????????????????"
          name="staticDistinguishArea"
          rules={[{ required: true, message: '?????????' }]}
        >
          <Select labelInValue placeholder="?????????" style={{ width: '100%' }}>
            {dictData['jtpbssqy'] &&
              dictData['jtpbssqy'].map((item: any, index: number) => {
                return (
                  <Option key={index} value={item._id + '_' + item.code}>
                    {item.name}
                  </Option>
                );
              })}
          </Select>
        </Form.Item>
        <Form.Item
          label="?????????????????????????????????"
          name="chargingPileDistinguishArea"
          rules={[{ required: true, message: '?????????' }]}
        >
          <Select labelInValue placeholder="?????????" style={{ width: '100%' }}>
            {dictData['cdzcwpbssqy'] &&
              dictData['cdzcwpbssqy'].map((item: any, index: number) => {
                return (
                  <Option key={index} value={item._id}>
                    {item.name}
                  </Option>
                );
              })}
          </Select>
        </Form.Item>
        <Form.Item
          label="???????????????"
          name="landArea"
          rules={[{ required: true, message: '?????????' }]}
        >
          <Input placeholder="?????????" addonAfter="???" />
        </Form.Item>
        <Form.Item
          label="???????????????"
          name="buildArea"
          rules={[{ required: true, message: '?????????' }]}
        >
          <Input placeholder="?????????" addonAfter="???" />
        </Form.Item>
        <Form.Item
          label="??????????????????"
          name="aboveBuildArea"
          rules={[{ required: true, message: '?????????' }]}
        >
          <Input placeholder="?????????" addonAfter="???" />
        </Form.Item>
        <Form.Item
          label="??????????????????"
          name="belowBuildArea"
          rules={[{ required: true, message: '?????????' }]}
        >
          <Input placeholder="?????????" addonAfter="???" />
        </Form.Item>
        <Form.Item
          label="??????????????????"
          name="studyPhase"
          rules={[{ required: true, message: '?????????' }]}
        >
          <Select
            labelInValue
            placeholder="?????????"
            style={{ width: '100%' }}
            onChange={(value) => {}}
          >
            {dictData['xmyjsd'] &&
              dictData['xmyjsd'].map((item: any, index: number) => {
                return (
                  <Option key={index} value={item._id}>
                    {item.name}
                  </Option>
                );
              })}
          </Select>
        </Form.Item>
        <Form.Item
          wrapperCol={{
            xs: { span: 24, offset: 0 },
            sm: {
              span: formItemLayout.wrapperCol.span,
              offset: formItemLayout.labelCol.span,
            },
          }}
        >
          <Button type="primary" onClick={onValidateForm}>
            ?????????
          </Button>
        </Form.Item>
      </Form>
      <Divider style={{ margin: '40px 0 24px' }} />
      <div className={styles.desc}>
        <h3>??????</h3>
        <h4>??? * ???????????????</h4>
      </div>
    </>
  );
};

export default connect(
  ({ projectManageAndEditProject }: { projectManageAndEditProject: StateType }) => ({
    stepData: projectManageAndEditProject.step,
    current: projectManageAndEditProject.current,
    currentRecord: projectManageAndEditProject.currentRecord,
  }),
)(Step1);
