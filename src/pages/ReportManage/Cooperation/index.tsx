import { Button, message, Modal, Row, Col, Space, Avatar, Transfer, Tree } from 'antd';
const { confirm } = Modal;
import { ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import React, { useState, useRef, useEffect } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';

import { getTreeData, changeTreeDataToObj, getAllChildrenKeys } from '@/tools';
import { accountSearch } from '@/services/login';
import {
  reportTemplate,
  userSectionCreate,
  userSectionListAll,
  userSectionUpdate,
} from '@/services/reportManage';

const isChecked = (selectedKeys: any[], eventKey: any) => selectedKeys.indexOf(eventKey) !== -1;

const generateTree: any = (treeNodes: any[] = [], checkedKeys: any[] = []) =>
  treeNodes.map(({ children, ...props }) => ({
    ...props,
    disabled: checkedKeys.includes(props.key),
    children: generateTree(children, checkedKeys),
  }));

const TreeTransfer: any = (props: any) => {
  const { dataSource, targetKeys, ...restProps } = props;
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const transferDataSource: any[] = [];
  function flatten(list = []) {
    list.forEach((item: any) => {
      transferDataSource.push(item);
      flatten(item?.children);
    });
  }
  flatten(dataSource);
  useEffect(() => {
    if (dataSource.length > 0) {
      let newExpandedKeys = changeTreeDataToObj(dataSource, '');
      newExpandedKeys = newExpandedKeys.map((item) => item._id);
      setExpandedKeys(newExpandedKeys);
    }
  }, [dataSource]);
  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
  };
  return (
    <Transfer
      {...restProps}
      // showSearch
      targetKeys={targetKeys}
      dataSource={transferDataSource}
      className={styles.transfer}
      operations={['加入右侧', '加入左侧']}
      render={(item) => item.title}
      titles={['待分配章节', '已分配章节']}
      showSelectAll={false}
    >
      {({ direction, onItemSelect, selectedKeys }) => {
        if (direction === 'left') {
          const checkedKeys = [...selectedKeys, ...targetKeys];
          return (
            <Tree
              blockNode
              checkable
              // checkStrictly
              // defaultExpandAll
              height={550}
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={true}
              checkedKeys={checkedKeys}
              treeData={generateTree(dataSource, targetKeys)}
              onCheck={(_, { node }: any) => {
                let allKeys = getAllChildrenKeys(node);
                allKeys.forEach((key: any) => {
                  setTimeout(() => {
                    onItemSelect(key, !isChecked(checkedKeys, key));
                  }, 0);
                });
              }}
              onSelect={(_, { node }: any) => {
                let allKeys = getAllChildrenKeys(node);
                allKeys.forEach((key: any) => {
                  setTimeout(() => {
                    onItemSelect(key, !isChecked(checkedKeys, key));
                  }, 0);
                });
              }}
            />
          );
        }
      }}
    </Transfer>
  );
};
const CooperationManage: any = (props: any) => {
  const { id, type } = history?.location?.query;
  const filterOption = (inputValue: any, option: any) => {
    return option.title.indexOf(inputValue) > -1;
  };
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [targetKeys, setTargetKeys] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<any>(null);
  const [userList, setUserList] = useState<any>([]);
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);
  const [sectionInfo, setSectionInfo] = useState<any>([]);
  const [templateData, setTemplateData] = useState<any>({});
  const [selectedUserSectionInfo, setSelectedUserSectionInfo] = useState<any>([]);
  const [dataSource, setDataSource] = useState<any>([]);
  useEffect(() => {
    accountSearch({
      current: 1,
      pageSize: 20,
    }).then((res) => {
      if (res.code == 200) {
        setUserList(res?.data?.data);
      }
    });
    reportTemplate(id).then((res) => {
      console.log(res);
      if (res.code == 200) {
        setTemplateData(res.data);
        setSectionInfo(res?.data?.sectionInfo);
        setDataSource(getTreeData(res?.data?.sectionInfo, ''));
      }
    });
  }, []);

  const onChange = (keys: any) => {
    setTargetKeys(keys);
  };
  const handleSearch = (dir: any, value: any) => {
    console.log('search:', dir, value);
  };
  //  权限分配
  const hanldleOnSectionEditorChange = (item: any, index: number) => {
    if (currentIndex == index) {
      setCurrentIndex(null);
      setCurrentUserInfo(null);
      setTargetKeys([]);
    } else {
      setCurrentIndex(index);
      setCurrentUserInfo(item);
      handleOnGetUserSectionInfo(item);
    }
  };
  // 获取当前选择人的权限章节
  const handleOnGetUserSectionInfo = (item: any) => {
    userSectionListAll({
      userId: item._id,
      reportId: templateData.reportId,
    }).then((res) => {
      console.log(res);
      if (res.code == 200) {
        if (res.data.length == 0) {
          setSelectedUserSectionInfo([]);
          setTargetKeys([]);
        } else {
          setSelectedUserSectionInfo(res.data);
          let newtargetKeys = res.data[0]?.sectionInfo.map((item: any) => item._id);
          setTargetKeys(newtargetKeys);
        }
      }
    });
  };
  // 确认提交
  const hanldeOnSubmit = () => {
    if (!currentUserInfo?._id) {
      message.warning('请先选择章节权限分配人员!');
      return;
    }
    if (targetKeys.length == 0) {
      message.warning('请选择章节进行分配!');
      return;
    }
    if (selectedUserSectionInfo.length == 0) {
      let newSectionInfo = sectionInfo
        .filter((item: any) => targetKeys.includes(item._id))
        .map((section: any) => {
          return {
            _id: section._id,
            name: section.name,
            parentId: section.parentId,
            paramInfo: section.paramInfo.map((item: any) => item._id || item),
            formulaInfo: section.formulaInfo.map((item: any) => item._id || item),
            tableInfo: section.tableInfo.map((item: any) => item._id || item),
            cycleTextInfo: section.tableInfo.map((item: any) => item._id || item),
            content: section.content,
          };
        });
      userSectionCreate({
        name: templateData.name,
        reportId: templateData.reportId,
        userId: currentUserInfo._id,
        userName: currentUserInfo.userName,
        sectionInfo: newSectionInfo,
      })
        .then((res) => {
          if (res.code == 200) {
            message.success('章节权限分配成功!');
          } else {
            message.warning('章节权限分配失败!');
          }
        })
        .catch((err) => {
          message.error('章节分配接口出错!');
        });
    } else {
      let id = selectedUserSectionInfo[0]?._id;
      let newSectionInfo = sectionInfo
        .filter((item: any) => targetKeys.includes(item._id))
        .map((section: any) => {
          return {
            _id: section._id,
            name: section.name,
            parentId: section.parentId,
            paramInfo: section.paramInfo.map((item: any) => item._id || item),
            formulaInfo: section.formulaInfo.map((item: any) => item._id || item),
            tableInfo: section.tableInfo.map((item: any) => item._id || item),
            cycleTextInfo: section.tableInfo.map((item: any) => item._id || item),
            content: section.content,
          };
        });
      let params = {
        name: templateData.name,
        reportId: templateData.reportId,
        sectionInfo: newSectionInfo,
      };
      userSectionUpdate(id, params)
        .then((res) => {
          if (res.code == 200) {
            message.success('章节权限分配成功!');
          } else {
            message.warning('章节权限分配失败!');
          }
        })
        .catch((err) => {
          message.error('章节分配接口出错!');
        });
    }
  };
  return (
    <PageContainer>
      <Row className={styles.container}>
        <Col span={24}>
          <div className={styles.topBtns}>
            <div></div>
            {/* <Button
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
            </Button> */}
            <Space>
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
                取消
              </Button>
              <Button type="primary" onClick={hanldeOnSubmit}>
                确认
              </Button>
            </Space>
          </div>
          <div className={styles.pageContent}>
            <div style={{ marginBottom: '20px' }}>
              <h3>编写人列表:</h3>
              <div className={styles.editorLists}>
                <ul>
                  {userList.map((item: any, index: number) => {
                    return (
                      <li key={index} onClick={() => hanldleOnSectionEditorChange(item, index)}>
                        <span>
                          <Avatar
                            className={
                              currentIndex == index ? styles.activeItem : styles.customItem
                            }
                            size="large"
                            icon={<UserOutlined />}
                          />
                        </span>
                        <span className={styles.userName}>{item.userName}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div style={{ width: '100%' }}>
              <TreeTransfer
                filterOption={filterOption}
                dataSource={dataSource}
                targetKeys={targetKeys}
                onChange={onChange}
                onSearch={handleSearch}
                render={(item: any) => item.title}
              />
            </div>
          </div>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default CooperationManage;
