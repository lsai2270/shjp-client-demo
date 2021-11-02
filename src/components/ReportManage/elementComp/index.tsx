import React, { useState, useEffect } from 'react';
import { Input, Space, Select, Button, Modal } from 'antd';
const { Search } = Input;
const { Option } = Select;
import styles from './index.less';
import { ParamsComp } from '@/pages/SystemSettings/ParamsManage';
export default (props: any) => {
  const { onAddElement } = props;
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>('1');
  const [uploadType, setUploadType] = useState<string>('1');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOnSelected = (value: string) => {
    // console.log(value);
    setSelectedValue(value);
  };
  const handleOnTypeOfUpload = (value: string) => {
    // console.log(value);
    setUploadType(value);
  };
  /** 确认弹窗
   * @name:
   */
  const handleOk = () => {
    setIsModalVisible(false);
  };
  /**
   * @name: 关闭弹窗
   */
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const hanldeOnAddElement = () => {
    onAddElement(
      '<p class="imgAlign"><img class="imgTemplate" src="" paramsInfo={paramsInfo} /></p></br>',
    );
  };
  return (
    <div className={styles.container}>
      <h2>元件</h2>
      <div>
        <div>
          <Space>
            <span style={{ color: 'red' }}>*</span>
            <span>类型:</span>
          </Space>
        </div>
        <div>
          <Select
            defaultValue="1"
            value={selectedValue}
            style={{ width: '100%' }}
            onChange={handleOnSelected}
          >
            <Option value="1">请选择元件类型</Option>
            <Option value="2">文本框</Option>
            <Option value="3">图片</Option>
            <Option value="4">表单</Option>
          </Select>
        </div>
        {selectedValue == '2' && (
          <div className={styles.selectedContent}>
            <h4>绑定字段:</h4>
            {/* <div>
              <a>四至范围-东临</a>
            </div> */}
            <div className={styles.colGap}>
              <Button
                style={{ width: '100%' }}
                onClick={() => {
                  setIsModalVisible(true);
                }}
              >
                选择参数
              </Button>
            </div>
            <div className={styles.colGap}>
              未找到相关参数? <a>新建参数</a>
            </div>
            <div>
              <Button style={{ width: '100%' }} onClick={hanldeOnAddElement}>
                添加
              </Button>
            </div>
          </div>
        )}
        <Modal
          className={styles.paramsModal}
          title="选择参数"
          width={'60%'}
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <ParamsComp />
        </Modal>
        {selectedValue == '3' && (
          <div className={styles.selectedContent}>
            <div className={styles.contentItem}>
              <Space>
                <span style={{ color: 'red' }}>*</span>
                <span> 名称:</span>
              </Space>
              <div>
                <Input placeholder="请输入图片名称!" />
              </div>
            </div>
            <div className={styles.contentItem}>
              <Space>
                <span style={{ color: 'red' }}>*</span>
                <span> 图片:</span>
              </Space>
              <div>
                <Select
                  defaultValue="1"
                  value={uploadType}
                  style={{ width: '100%' }}
                  onChange={handleOnTypeOfUpload}
                >
                  <Option value="1">请选择图片上传方式</Option>
                  <Option value="2">自定义上传</Option>
                  <Option value="3">关联预测结果</Option>
                </Select>
              </div>
            </div>
            <div className={styles.contentItem}>
              {uploadType != '3' && (
                <Space>
                  <span>排版方式:</span>
                  <span>上下默认</span>
                </Space>
              )}
              {uploadType == '3' && (
                <>
                  {/* <span> 名称:</span>
                  <div style={{ marginTop: '15px' }}>
                    <a>近期交通流量（背景）.jpg</a>
                  </div> */}
                  <div>
                    <div>
                      <h4>选择相关预测:</h4>
                    </div>
                    <div>
                      <Button
                        style={{ width: '100%' }}
                        onClick={() => {
                          setIsModalVisible(true);
                        }}
                      >
                        请选择预测
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* <div className={styles.contentItem}>
              <Button type="default" style={{ width: '100%' }}>
                删除
              </Button>
            </div>
            <div className={styles.contentItem}>
              <Button type="default" style={{ width: '100%' }}>
                重新上传
              </Button>
            </div> */}
            <div className={styles.contentItem}>
              <Button type="default" style={{ width: '100%' }}>
                添加
              </Button>
            </div>
          </div>
        )}
        {selectedValue == '4' && (
          <div className={styles.selectedContent}>
            <div className={styles.contentItem}>
              {/* <Space>
                <span style={{ color: 'red' }}>*</span>
                <span> 表单:</span>
              </Space>
              <div style={{ marginTop: '15px' }}>
                <a>研究区域内现状道路情况一览表</a>
              </div> */}
              <div className={styles.colGap}>
                <Space>
                  <span style={{ color: 'red' }}>*</span>
                  <span> 关联表单:</span>
                </Space>
              </div>
              <div>
                <Button
                  style={{ width: '100%' }}
                  onClick={() => {
                    setIsModalVisible(true);
                  }}
                >
                  请选择表格
                </Button>
              </div>
            </div>
            <div className={styles.contentItem}>
              {/* <Button style={{ width: '100%' }}>
                重新获取
              </Button> */}
              <Button style={{ width: '100%' }}>添加</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
