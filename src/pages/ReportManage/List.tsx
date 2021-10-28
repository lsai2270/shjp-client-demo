import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Modal, Row, Col, Form, Select, Input, Tag } from 'antd';
const { confirm } = Modal;
const { Option } = Select;
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useState, useRef } from 'react';
import { history, connect, Dispatch } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { getList, deleteProject, batchDeleteProject } from '@/services/projectManage';
import { getList as predictGetList } from '@/services/predictManage';
import {
  createReport,
  reportGetList,
  reportGetGroupList,
  reportDelete,
} from '@/services/reportManage';
import { templateList } from '@/services/systemSetting';
import LoadingComp from '@/components/Loading';
import ScrollSelect from '@/components/ScrollSelect';
import styles from './List.less';

interface ProjectManageProps {
  stepData: any;
  current: any;
  dispatch?: Dispatch;
}
const ProjectManage: React.FC<ProjectManageProps> = (props) => {
  const { dispatch } = props;
  const [form] = Form.useForm();
  const { validateFields } = form;
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [projectLists, setProjectLists] = useState<any[]>([]); // 项目
  const [templateLists, setTemplateLists] = useState<any[]>([]); // 模版
  const [currentPredictLists, setCurrentPredictLists] = useState<any[]>([]); // 近期预测
  const [forcastPredictLists, setForcastPredictLists] = useState<any[]>([]); // 远期预测
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false); // 远期预测

  const columns: ProColumns<any>[] = [
    {
      title: '报告名称',
      key: 'name',
      dataIndex: 'name',
      // sorter: true,
      render: (text: any, record) => {
        if (record.type == 2) {
          return (
            <span>
              {text} <Tag color="#108ee9">正文</Tag>
            </span>
          );
        }
        return <span>{text}</span>;
      },
    },
    {
      title: '所属分类',
      key: 'belong',
      dataIndex: 'belong',
    },
    {
      title: '完成度',
      key: 'finish',
      dataIndex: 'finish',
    },
    {
      title: '设计单位',
      key: 'designCompany',
      dataIndex: 'designCompany',
      search: false,
    },
    {
      title: '最后修订',
      key: 'designAt',
      dataIndex: 'designAt',
      sorter: true,
      search: false,
      valueType: 'date',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
      render: (text, record) => [
        <a key="1" onClick={() => handleOnRemoveRow(record)}>
          删除
        </a>,
        <a key="2" onClick={() => handleOnEditRow(record)}>
          编辑
        </a>,
      ],
    },
  ];
  // 删除行
  const handleOnRemoveRow = (record: any) => {
    confirm({
      title: '您正在删除报告记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>报告记录删除后，相关信息将无法恢复</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        // console.log('OK');
        reportDelete(record._id)
          .then((res) => {
            if (res.code == 200) {
              actionRef.current?.reloadAndRest?.();
              message.success('删除报告成功!');
            } else {
              message.warning('删除报告失败!');
            }
          })
          .catch((err) => {
            message.error(err);
          });
      },
    });
  };
  // 编辑行
  const handleOnEditRow = (record: any) => {
    confirm({
      title: '您正在编辑报告记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>
            要想进行编辑,请先删除本项目对应的流量调查记录和预测记录,项目编辑后再重新调查和预测。
          </span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        history.push({
          pathname: '/reportManage/create',
          query: {
            id: record._id,
            type: record.type,
          },
        });
      },
    });
  };
  const handleOnRouteTo = () => {
    setIsModalVisible(true);
  };
  const handleOnMoreRemove = () => {
    confirm({
      title: '您正在批量删除报告记录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>报告记录删除后，相关信息将无法恢复</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        // console.log('OK');
        console.log('selectedRows', selectedRows);
        let params = {
          ids: selectedRows.map((item: any) => item._id),
        };
        // batchDeleteProject(params).then((res) => {
        //   if (res.code == 200) {
        //     setSelectedRows([]);
        //     message.success('批量删除项目成功!');
        //     actionRef.current?.reloadAndRest?.();
        //   }
        // });
      },
    });
  };
  /**
   * @name: 确认弹窗
   */
  const handleOk = async () => {
    const formData = await validateFields();
    // console.log(formData);
    setLoadingFlag(true);
    createReport({
      name: formData?.project?.label,
      projectId: formData?.project?.value,
      projectName: formData?.project?.label,
      templateId: formData?.template?.value,
      templateName: formData?.template?.label,
      recentForecastId: formData?.recent?.value,
      futureForecastId: formData?.forward?.value,
    })
      .then((res) => {
        // console.log(res);
        if (res.code == 200) {
          setLoadingFlag(false);
          setIsModalVisible(false);
          history.push({
            pathname: '/reportManage/create',
            query: {
              id: res?.data?._id,
              type: res?.data?.type,
            },
          });
          message.success('报告创建成功!');
        } else {
          message.warning(res.msg);
        }
      })
      .catch((err) => {
        message.error('报告接口出错!');
      });
  };
  /**
   * @name: 关闭弹窗
   */
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  // 获取Project
  const handleOnGetProject = async (params: any) => {
    const res = await getList(params);
    try {
      if (res.code == 200) {
        if (res.data.data.length > 0) {
          setProjectLists([...projectLists, ...res.data.data]);
        }
      }
    } catch (e) {
      message.error('获取项目接口出错!');
    }
    return res.data;
  };
  //选择项目
  const hanldeOnProjectChange = (data: any) => {
    // console.log(data);
    form.setFieldsValue({
      project: data,
    });
    predictGetList({
      current: 1,
      pageSize: 100,
      projectId: data.value,
    }).then((res) => {
      if (res.code == 200) {
        let newCurrentLists: any[] = [];
        let newForcastLists: any[] = [];
        res.data.data.forEach((item: any) => {
          if (item.assessType == '近期') {
            newCurrentLists.push(item);
          }
          if (item.assessType == '远期') {
            newForcastLists.push(item);
          }
        });
        setCurrentPredictLists(newCurrentLists);
        setForcastPredictLists(newForcastLists);
      }
    });
  };
  // 获取模版接口
  const handleOnGetTemplate = async (params: any) => {
    const res = await templateList(params);
    try {
      if (res.code == 200) {
        if (res.data.data.length > 0) {
          setTemplateLists([...templateLists, ...res.data.data]);
        }
      }
    } catch (e) {
      message.error('获取模版接口出错!');
    }
    return res.data;
  };
  //选择模版
  const hanldeOnTemplateChange = (data: any) => {
    form.setFieldsValue({
      template: data,
    });
  };
  return (
    <PageContainer>
      <Row className={styles.reportContainer}>
        <Col span={24}>
          <LoadingComp visible={loadingFlag} />
          <ProTable
            actionRef={actionRef}
            rowKey={(record: any) => record._id}
            search={{
              span: 5,
            }}
            options={false}
            toolBarRender={() => [
              <Button type="primary" key="1" icon={<PlusOutlined />} onClick={handleOnRouteTo}>
                新建
              </Button>,
              <Button key="2" onClick={handleOnMoreRemove}>
                批量删除
              </Button>,
            ]}
            pagination={{
              // showQuickJumper: true,
              pageSize: 10,
            }}
            request={async (params, sorter, filter) => {
              const res = await reportGetGroupList({
                ...params,
                sorter,
                filter,
                unsetFields: 'paramInfo,sectionInfo',
              });
              // console.log(res);
              return {
                data: res.data.data,
                success: true,
                total: res.data.count,
              };
            }}
            // dataSource={[]}
            columns={columns}
            rowSelection={{
              onChange: (_, selectedRows) => setSelectedRows(selectedRows),
            }}
          />
          <Modal
            title="新建报告"
            visible={isModalVisible}
            width={'40%'}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Form
              form={form}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              initialValues={{ keyType: '0' }}
            >
              <Form.Item
                label="所属项目"
                name="project"
                rules={[{ required: true, message: '请输入参数名称!' }]}
              >
                <ScrollSelect
                  handleOnGetData={handleOnGetProject}
                  hanldeOnChange={hanldeOnProjectChange}
                  // optionData={projectLists}
                  placeholder="请选择项目"
                />
              </Form.Item>
              {/* <Form.Item
                label="选择类型"
                name="type"
                rules={[{ required: false, message: '请选择!' }]}
              >
                <Select placeholder="请选择类型!" labelInValue style={{ width: '100%' }}>
                  <Option value="1">用户输入</Option>
                </Select>
              </Form.Item> */}
              <Form.Item
                label="选择模版"
                name="template"
                rules={[{ required: true, message: '请选择!' }]}
              >
                <ScrollSelect
                  handleOnGetData={handleOnGetTemplate}
                  hanldeOnChange={hanldeOnTemplateChange}
                  // optionData={templateLists}
                  placeholder="请选择模版"
                />
              </Form.Item>
              <Form.Item label="预测结果">
                <Form.Item
                  label="近期"
                  name="recent"
                  rules={[{ required: true, message: '请选择!' }]}
                >
                  <Select placeholder="请选择!" labelInValue style={{ width: '100%' }}>
                    {currentPredictLists.map((item, index) => {
                      return (
                        <Option key={index} value={item._id}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="远期"
                  name="forward"
                  rules={[{ required: false, message: '请选择!' }]}
                >
                  <Select placeholder="请选择!" labelInValue style={{ width: '100%' }}>
                    {forcastPredictLists.map((item, index) => {
                      return (
                        <Option key={index} value={item._id}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Form.Item>
            </Form>
          </Modal>
        </Col>
      </Row>
    </PageContainer>
  );
};
export default ProjectManage;
