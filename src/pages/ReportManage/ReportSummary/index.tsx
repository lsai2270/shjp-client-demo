import { PageContainer } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, Children } from 'react';
import { history, withRouter } from 'umi';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { Spin, Row, Col, Input, Button, Divider, Tree, Space, message, Modal } from 'antd';
const { Search } = Input;
import { CarryOutOutlined, FormOutlined } from '@ant-design/icons';
import styles from './index.less';
import { getTreeData, changeTreeDataToObj } from '@/tools';
import { getList, getDetailById, getTreeList } from '@/services/predictManage';
import {
  reportTemplate,
  userSectionCreate,
  userSectionListAll,
  userSectionUpdate,
} from '@/services/reportManage';
export default withRouter((props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRocord, setCurrentRocord] = useState<any>({});
  const [leftTreeData, setLeftTreeData] = useState<any>([]);
  const [expendedKey, setExpendedKey] = useState<React.Key[]>([]);
  const [seletedKey, setSeletedKey] = useState<string[]>([]);
  const [sectionInfo, setSectionInfo] = useState<any>([]);
  const [templateData, setTemplateData] = useState<any>({});
  const [paramsInfo, setParamsInfo] = useState<any>({});
  const [selectedSectionInfo, setSelectedSectionInfo] = useState<any>(undefined);

  const { id, type } = history?.location?.query;
  useEffect(() => {
    if (id) {
      reportTemplate(id).then((res) => {
        // console.log(res);
        if (res.code == 200) {
          setTemplateData(res.data);
          setSectionInfo(res?.data?.sectionInfo);
          setLeftTreeData(getTreeData(res?.data?.sectionInfo, '0'));
          let newExpendedKey = res?.data?.sectionInfo.map((item: any, index: number) => {
            if (index == 0) {
              setSelectedSectionInfo(item);
            }
            return item._id;
          });
          setExpendedKey(newExpendedKey);
          setSeletedKey([newExpendedKey[0]]);
          let newParamsInfo = {};
          res.data.paramInfo.forEach((item: any) => {
            newParamsInfo[item.sourceId] = item;
          });
          setParamsInfo(newParamsInfo);
        }
      });
    }
  }, []);
  const onSearch = (value: any) => console.log(value);
  const onSelect = (selectedKeys: any) => {
    setSeletedKey(selectedKeys);
    if (selectedKeys.length != 0) {
      sectionInfo.forEach((item: any, index: number) => {
        if (item._id == selectedKeys[0]) {
          setSelectedSectionInfo(item);
        }
      });
    } else {
      setSelectedSectionInfo(undefined);
    }
  };

  const handleOnPreview = (record: object) => {
    // console.log(record);
    setCurrentRocord(record);
    setIsModalVisible(true);
  };

  const onExpand = (expandedKeys: React.Key[]) => {
    // console.log('onExpand', expandedKeys);
    setExpendedKey(expandedKeys);
  };
  return (
    <PageContainer pageHeaderRender={false}>
      <Row className={styles.container}>
        <Col span={6} style={{ borderRight: '1px solid rgba(0,0,0,0.2)', paddingRight: '10px' }}>
          <Row style={{ marginBottom: '20px' }}>
            <Col span={24}>
              <Search placeholder="请输入" onSearch={onSearch} style={{ width: '100%' }} />
            </Col>
          </Row>
          {leftTreeData && (
            <Tree
              showLine={{ showLeafIcon: false }}
              showIcon={false}
              // defaultExpandAll
              onExpand={onExpand}
              expandedKeys={expendedKey}
              selectedKeys={seletedKey}
              onSelect={onSelect}
              treeData={leftTreeData}
            />
          )}
        </Col>
        <Col span={18} style={{ padding: ' 0 10px' }}>
          <Row style={{ marginBottom: '20px' }}>
            <Col span={24}>
              {/* <Button type="primary" onClick={hanldeOnMoreRemove}>
                批量删除
              </Button> */}
              <div className={styles.topBtns}>
                <Space>
                  <Button onClick={() => {}}>保存</Button>
                  <Button
                    onClick={() => {
                      history.push({
                        pathname: '/reportManage/create',
                        query: {
                          id: id,
                          type: type,
                        },
                      });
                    }}
                  >
                    返回
                  </Button>
                </Space>
              </div>
              <Divider />
              <div>
                {selectedSectionInfo &&
                  selectedSectionInfo.paramInfo.map((item: any, index: number) => {
                    let newParams = paramsInfo[item];
                    // console.log(newParams);
                    let inputValue =
                      templateData.type == 1 ? newParams?.draftValue[id] : newParams?.value;
                    return (
                      <div key={index}>
                        <span>{newParams?.name}: </span>
                        <span>
                          <Input
                            placeholder="请输入"
                            name={item}
                            value={inputValue}
                            style={{ width: '30%' }}
                            onChange={(e) => {
                              let sourceId = e.target.name;
                              let params = paramsInfo[sourceId];
                              if (templateData.type == 1) {
                                params.draftValue[id] = e.target.value;
                              } else {
                                params.value = e.target.value;
                              }
                              setParamsInfo({
                                ...paramsInfo,
                                [sourceId]: params,
                              });
                            }}
                          />
                        </span>
                      </div>
                    );
                  })}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </PageContainer>
  );
});
