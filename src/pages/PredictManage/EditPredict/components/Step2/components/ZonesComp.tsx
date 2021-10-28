import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Select, Input, Table, message } from 'antd';
const { Option } = Select;
const { TextArea } = Input;
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styles from '../index.less';
import { getDictData } from '@/services/projectManage';
import { createZone, deleteZone, getAllZones } from '@/services/predictManage';

const gridStyleLeft: any = {
  width: '35%',
  // textAlign: 'center',
};
const gridStyleRight: any = {
  width: '65%',
  // textAlign: 'center',
};

const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 12,
  },
};

const ZonesComp: any = (props: any) => {
  const [form] = Form.useForm();
  const { zonesData, setZonesData, plotInfo, nearPlotInfo, currentProject } = props;
  const { validateFields } = form;
  const [railway, setRailway] = useState([]);
  // const [zonesData, setZonesData] = useState<any>([]);
  const [dictData, setDictData] = useState<any>({});
  const [village, setVillage] = useState(undefined);
  const [currentRowIndex, setCurrentRowIndex] = useState<any>(undefined);
  const [maxZoneNum, setMaxZoneNum] = useState<any>(undefined);
  useEffect(() => {
    getDictDataAll();
  }, []);
  useEffect(() => {
    if (zonesData) {
      const zonesDataNum = zonesData.map((item: any) => item.sum);
      const newMaxZoneNum = Math.max.apply(null, zonesDataNum);
      setMaxZoneNum(newMaxZoneNum);
    }
  }, [zonesData]);
  const columns: any = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      align: 'center',
      render: (text: any, record: object, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    // {
    //   title: 'Zone',
    //   dataIndex: 'zone',
    //   key: 'zone',
    //   align: 'center',
    //   render: (text: any, record: object, index: number) => {
    //     return <span>{'Zone' + (index + 1)}</span>;
    //   },
    // },
    {
      title: '小区名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: '小区分类',
      dataIndex: 'level',
      key: 'level',
      align: 'center',
      render: (text: any) => {
        return text.label;
      },
    },
    {
      title: '操作',
      align: 'center',
      width: 70,
      dataIndex: 'action',
      key: 'action',
      render: (text: any, record: any, index: number) => {
        if (record.level.label == '其他') {
          return (
            <a
              onClick={() => {
                let newZonesData = zonesData.filter(
                  (item1: any, index1: number) => index != index1,
                );
                if (record._id) {
                  handleOnDelete(record._id);
                } else {
                  message.success('删除成功!');
                }
                setZonesData(newZonesData);
              }}
            >
              删除
            </a>
          );
        }
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
      },
    },
  ];
  //选中行
  const handleOnTableRow = (e: any, record: any, index: any) => {
    setRowStyle(index);
    if (index == currentRowIndex) {
      form.resetFields();
      setCurrentRowIndex(undefined);
      setVillage(undefined);
    } else {
      form.resetFields();
      form.setFieldsValue(record);
      if (record.level.label != '其他') {
        setVillage(record.level.label);
      } else {
        setVillage(undefined);
      }
      setCurrentRowIndex(index);
    }
  };
  const setRowStyle = (index: number) => {
    // console.log(index);
    let nodeElement: any = document.getElementById('zoneLists');
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
  const handleOnDelete = (id: string) => {
    deleteZone(id)
      .then((res) => {
        if (res.code == 200) {
          message.success('删除成功!');
        } else {
          message.error('删除失败!');
        }
      })
      .catch((err) => {
        message.error('删除失败!');
      });
  };
  const hanldeOnSave = async () => {
    // if (zonesData.length > 0) {
    //   let data = zonesData[zonesData.length - 1];
    //   if (data.name) {
    //     message.warning('请先添加新的的小区信息后,进行保存!');
    //     return;
    //   }
    const values = await validateFields();
    if (values.level.label != '其他') {
      message.warning('请选择其他类型的小区进行创建!');
      return;
    }
    let newZonesData: any[] = zonesData.concat([]);
    if (currentRowIndex != undefined) {
      newZonesData.splice(currentRowIndex, 1, {
        ...newZonesData[currentRowIndex],
        ...values,
        sum: currentRowIndex + 1,
        status: 1,
      });
    } else {
      newZonesData.push({
        ...values,
        sum: maxZoneNum + 1 + '',
        status: 1,
      });
    }

    let postData: any = {
      projectId: currentProject._id,
      projectName: currentProject.name,
      sum: currentRowIndex != undefined ? newZonesData[currentRowIndex]?.sum : maxZoneNum + 1 + '',
      name: values.name,
      belongId: values.level.value,
      belong: values.level.label,
      plotInfo: values.plot,
      // currentSituation: values.currentSituation,
      // currentTrafficAttraction: values.currentTrafficAttraction,
    };
    if (newZonesData[currentRowIndex]?._id) {
      postData._id = newZonesData[currentRowIndex]?._id;
    }
    if (values.code) {
      postData.code = values.code;
    }
    const res = await createZone(postData);
    try {
      if (res.code == 200) {
        message.success('保存成功');
        newZonesData[newZonesData.length - 1]['_id'] = res.data._id;
      } else {
        message.error('保存失败');
      }
    } catch (e) {
      message.error('保存失败');
    }
    form.resetFields();
    setZonesData(newZonesData);
    setRowStyle(currentRowIndex);
    // } else {
    //   message.warning('请先添加新的的小区信息后,进行保存!');
    // }
  };
  //下拉框字典
  const getDictDataAll = () => {
    let type = ['xqfl'];
    getDictData({ typeCode: type.toString() }).then((res) => {
      // console.log(res);
      let newDictData = {};
      type.forEach((str) => {
        newDictData[str] = res.data.filter((item: any) => item.typeCode == str);
        if (str == 'gnhfjzmj') {
          // newDictData[str] = tree(newDictData[str], '0');
          newDictData[str] = newDictData[str].filter((item: any) => item.parentId == '0');
        }
      });
      setDictData(newDictData);
    });
  };
  // 小区分类
  const handleOnVillage = (seleted: any) => {
    // console.log(seleted);
    setVillage(seleted.label);
    form.setFieldsValue({
      plot: undefined,
    });
  };
  return (
    <Card>
      <Card.Grid hoverable={false} style={gridStyleLeft}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>交通小区列表：</div>
          <div>
            {/* <Button type="primary" icon={<PlusOutlined />} onClick={handleOnAdd}>
              新增
            </Button> */}
          </div>
        </div>
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyleRight}>
        <Button type="primary" onClick={hanldeOnSave}>
          保存
        </Button>
        <Button
          type="default"
          style={{ marginLeft: '10px' }}
          onClick={() => {
            if (currentRowIndex != undefined) {
              setRowStyle(currentRowIndex);
            }
            form.resetFields();
            setCurrentRowIndex(undefined);
          }}
        >
          清空
        </Button>
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyleLeft}>
        <Table
          id="zoneLists"
          onRow={(record, index) => {
            return {
              onClick: (event: any) => {
                handleOnTableRow(event, record, index);
              },
            };
          }}
          dataSource={zonesData}
          columns={columns}
          pagination={false}
          scroll={{ y: 700 }}
          bordered
        />
      </Card.Grid>
      <Card.Grid hoverable={false} style={gridStyleRight}>
        <Form
          {...formItemLayout}
          form={form}
          layout="horizontal"
          // className={styles.stepForm}
          initialValues={{
            level: { value: '5ffc247452ca6d956587f3f9', label: '其他' },
          }}
        >
          {/* <Form.Item label="小区Code" name="code" rules={[{ required: false, message: '请输入' }]}>
            <Input placeholder="请输入" />
          </Form.Item> */}
          <Form.Item label="小区名称" name="name" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item label="小区分类" wrapperCol={{ span: 24 }} className={styles.formFieldItem}>
            <Form.Item
              name="level"
              wrapperCol={{ span: 24 }}
              rules={[{ required: true, message: '请选择' }]}
            >
              <Select
                placeholder="请选择"
                labelInValue
                disabled={currentRowIndex == undefined ? false : true}
                style={{ width: '200px' }}
                onChange={handleOnVillage}
              >
                {dictData['xqfl'] &&
                  dictData['xqfl'].map((item: any, index: number) => {
                    return (
                      <Option key={index} value={item._id}>
                        {item.name}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
            {village && village != '其他' && (
              <Form.Item
                label="对应地块"
                name="plot"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select placeholder="请选择" disabled style={{ width: '200px' }}>
                  {village == '周边待建地块' &&
                    nearPlotInfo &&
                    nearPlotInfo.map((plot: any, index: number) => {
                      return (
                        <Option key={index} value={plot._id}>
                          {plot.name}
                        </Option>
                      );
                    })}
                  {village == '基地' &&
                    plotInfo &&
                    plotInfo.map((plot: any, index: number) => {
                      return (
                        <Option key={index} value={plot._id}>
                          {plot.code}
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
            )}
          </Form.Item>

          {/* <Form.Item
            label="产生交通量（单位:pcu/h）"
            name="currentSituation"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item
            label="吸引交通量（单位:pcu/h）"
            name="currentTrafficAttraction"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Input placeholder="请输入" />
          </Form.Item> */}
        </Form>
      </Card.Grid>
    </Card>
  );
};
export default ZonesComp;
