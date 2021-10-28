import React, { useState, useEffect } from 'react';
import { connect, Dispatch, history } from 'umi';
import { Row, Col, Tree, Space, Modal, Input, Form, Button, message, Radio } from 'antd';
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons';
const { Search } = Input;
const { confirm } = Modal;
import lodash from 'lodash';
import { getTreeData, changeTreeDataToObj } from '@/tools';
import {
  createSection,
  updateSection,
  deleteSection,
  updateTemplate,
  getTemplate,
} from '@/services/systemSetting';
import styles from './index.less';

export default (props: any) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const { title, id } = history?.location?.query;
  const { sectionInfo, setSectionInfo, hanldeOnSelected, height } = props;
  const [dataList, setDataList] = useState<any[]>([]);
  const [selectedKey, setSelectedKey] = useState<any[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [nodeTreeItem, setNodeTreeItem] = useState<any>(null);
  const [catalogueData, setCatalogueData] = useState<any[]>([]); //目录
  const [isModalVisible, setIsModalVisible] = useState(false); //目录Modal
  const [modalTitle, setModalTitle] = useState('');
  const [selectedKeyObj, setSelectedKeyObj] = useState<any>({});
  useEffect(() => {
    getTemplate(id).then((res) => {
      if (res.code == 200) {
        let newSectionArr = res.data.sectionInfo.map((item: any) => {
          return {
            ...item,
            parentId: item.parentId == '0' ? '' : item.parentId,
          };
        });
        setSectionInfo(newSectionArr);
        setCatalogueData(getTreeData(newSectionArr, ''));
      }
    });
  }, []);
  useEffect(() => {
    if (catalogueData.length > 0) {
      // console.log('catalogueData', catalogueData);
      generateList(catalogueData);
      setSelectedKey([catalogueData[0].key]);
      hanldeOnSelected(catalogueData[0].key);
      // let newExpandedKeys = getExpandedKeys(catalogueData);
      let newExpandedKeys = sectionInfo.map((item: any) => item._id);
      setExpandedKeys(newExpandedKeys);
      setNodeTreeItem({
        pageX: 174,
        pageY: 102,
      });
      // setSectionInfo(changeTreeDataToObj(catalogueData, ''));
    }
  }, [catalogueData]);
  const generateList = (data: any) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { key } = node;
      setDataList([...dataList, { key, title: key }]);
      if (node.children) {
        generateList(node.children);
      }
    }
  };
  const getParentKey: any = (key: string, tree: any) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item: any) => item.key === key)) {
          parentKey = node.key;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };
  const onExpand = (expandedKeys: any[]) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const onChange = (e: any) => {
    const { value } = e.target;
    const expandedKeys = dataList
      .map((item: any) => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, catalogueData);
        }
        return null;
      })
      .filter((item: any, i: number, self: any) => item && self.indexOf(item) === i);
    setSearchValue(value);
    if (!value) {
      setAutoExpandParent(false);
      setExpandedKeys([]);
    } else {
      setAutoExpandParent(true);
      setExpandedKeys(expandedKeys);
    }
  };

  const loop = (data: any) =>
    data.map((item: any) => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title =
        index > -1 ? (
          <>
            <span className={styles.rowEllipsis}>
              {beforeStr}
              <span className={styles.siteTreeSearchValue}>{searchValue}</span>
              {afterStr}
            </span>
          </>
        ) : (
          <span className={styles.rowEllipsis}>{item.title}</span>
        );
      if (item.children) {
        return { title, key: item.key, children: loop(item.children) };
      }
      return {
        title,
        key: item.key,
      };
    });
  const handleOnSeletedKeys = (selectedKeys: any, e: any) => {
    // console.log('selectedKeys', selectedKeys);
    const { nativeEvent } = e;
    let x = nativeEvent.target.parentNode.parentNode.offsetLeft + 150;
    // nativeEvent.target.parentNode.parentNode.clientWidth;
    let y = 102 + nativeEvent.target.parentNode.parentNode.offsetTop;
    if (
      nativeEvent.target.parentNode.parentNode.className.includes('ant-tree-node-content-wrapper')
    ) {
      setNodeTreeItem({
        pageX: x,
        pageY: y,
      });
    }
    setSelectedKey(selectedKeys);
    if (selectedKeys.length > 0) {
      hanldeOnSelected(selectedKeys[0]);
    } else {
      setNodeTreeItem(null);
    }
  };
  const getNodeTreeMenu = () => {
    const { pageX, pageY } = nodeTreeItem;
    const tmpStyle: any = {
      position: 'absolute',
      // maxHeight: 40,
      textAlign: 'center',
      left: `${pageX}px`,
      top: `${pageY}px`,
      display: 'flex',
      flexDirection: 'row',
    };
    const menu = (
      <div className={styles.treeMenu} style={tmpStyle}>
        <ul>
          <li onClick={hanldeOnEditTree}>
            <EditOutlined className={styles.treeIcon} />
            <span style={{ marginLeft: '10px' }}>编辑</span>
          </li>
          <li onClick={hanldeOnAddTree}>
            <PlusCircleOutlined className={styles.treeIcon} />
            <span style={{ marginLeft: '10px' }}>新增</span>
          </li>
          <li onClick={hanldeOnRemoveTree}>
            <MinusCircleOutlined className={styles.treeIcon} />
            <span style={{ marginLeft: '10px' }}>删除</span>
          </li>
        </ul>
        {/* <Space>
          <span>
            <EditOutlined className={styles.treeIcon} onClick={hanldeOnEditTree} />
          </span>
          <span>
            <PlusCircleOutlined className={styles.treeIcon} onClick={hanldeOnAddTree} />
          </span>
          <span>
            <MinusCircleOutlined className={styles.treeIcon} onClick={hanldeOnRemoveTree} />
          </span>
        </Space> */}
      </div>
    );
    return nodeTreeItem == null ? '' : menu;
  };
  /**
   * @name: 修改目录
   */
  const hanldeOnEditTree = () => {
    let currentCatalogue = sectionInfo.filter((item: any) => item._id == selectedKey[0]);
    let parentCatalogue = sectionInfo.filter(
      (item: any) => item._id == currentCatalogue[0].parentId,
    );
    form.setFieldsValue({ name: currentCatalogue[0]?.name, type: currentCatalogue[0]?.type });
    setSelectedKeyObj(parentCatalogue[0]);
    setIsModalVisible(true);
    setModalTitle('修改目录');
  };
  /**
   * @name: 新增目录
   */
  const hanldeOnAddTree = () => {
    let currentCatalogue = sectionInfo.filter((item: any) => item._id == selectedKey[0]);
    setSelectedKeyObj(currentCatalogue[0]);
    setIsModalVisible(true);
    setModalTitle('新增目录');
  };
  /**
   * @name: 删除目录
   */
  const hanldeOnRemoveTree = () => {
    confirm({
      title: '您正在删除目录。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>当前目录及其子目录都将删除，相关信息将无法恢复</span>
          <br />
          <span>您确定要继续吗?</span>
        </span>
      ),
      onOk() {
        deleteSection(selectedKey[0])
          .then((res) => {
            // console.log(res);
            if (res.code == 200) {
              let newCatalogueArr = sectionInfo.filter((item: any) => item._id != selectedKey[0]);
              handleUpdateTemplate(newCatalogueArr);
              setSectionInfo(newCatalogueArr);
              setCatalogueData(getTreeData(newCatalogueArr, ''));
              message.success('删除成功!');
            } else {
              message.warning(res.msg);
            }
          })
          .catch((err) => {
            message.error('删除接口报错!');
          });
      },
    });
  };
  /**
   * @name: 确认弹窗
   */
  const handleOk = async () => {
    const formData = await validateFields();
    setIsModalVisible(false);
    if (modalTitle == '新增目录') {
      let newCatalogueArr = sectionInfo.concat([]);
      let filterCatalogueArr = newCatalogueArr.filter((item: any) => {
        if (selectedKey.length > 0) {
          return item.parentId == selectedKey[0];
        } else {
          return item.parentId == '';
        }
      });
      const res = await createSection({
        name: formData.name,
        type: formData.type,
        parentId: selectedKey.length > 0 ? selectedKey[0] : '',
        sort: filterCatalogueArr.length + 1 + '',
      });
      try {
        if (res.code == 200) {
          if (selectedKey.length > 0) {
            newCatalogueArr.push(res.data);
          } else {
            newCatalogueArr.push({
              ...res.data,
              parentId: '',
            });
          }
          handleUpdateTemplate(newCatalogueArr);
          setSectionInfo(newCatalogueArr);
          setCatalogueData(getTreeData(newCatalogueArr, ''));
          message.success('新增成功!');
        } else {
          message.warning(res.msg);
        }
      } catch (e) {
        message.error('接口出错!');
      }
    }
    if (modalTitle == '修改目录') {
      updateSection(selectedKey[0], {
        name: formData.name,
        type: formData.type,
      })
        .then((res) => {
          console.log(res);
          if (res.code == 200) {
            let newCatalogueArr = sectionInfo.map((item: any) => {
              if (item._id == selectedKey[0]) {
                item.name = formData.name;
              }
              return item;
            });
            setSectionInfo(newCatalogueArr);
            setCatalogueData(getTreeData(newCatalogueArr, ''));
            handleUpdateTemplate(newCatalogueArr);
            message.success('修改成功!');
          } else {
            message.warning(res.msg);
          }
        })
        .catch((err) => {
          message.error('接口出错!');
        });
    }
    form.resetFields();
  };
  /**
   * @name: 关闭弹窗
   */
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  /**
   * @name: 更新模版
   */
  const handleUpdateTemplate = async (sectionInfos: any[]) => {
    let params = {
      name: title,
      sectionInfo: sectionInfos.map((item: any) => item._id),
    };
    const res = await updateTemplate(id, params);
  };
  return (
    <div className={styles.contain} style={{ height: height, minHeight: height }}>
      <h2>目录</h2>
      <div style={{ display: 'flex' }}>
        <Search style={{ marginBottom: 8 }} placeholder="请输入" onChange={onChange} />
        <PlusSquareOutlined className={styles.addIcon} onClick={hanldeOnAddTree} />
      </div>
      <Tree
        showLine={{ showLeafIcon: false }}
        onExpand={onExpand}
        onSelect={handleOnSeletedKeys}
        selectedKeys={selectedKey}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        treeData={loop(catalogueData)}
        height={height == '528px' ? 400 : 761}
      />
      {nodeTreeItem != null ? getNodeTreeMenu() : ''}
      <Modal title={modalTitle} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          initialValues={{ type: '1' }}
        >
          <Form.Item
            label="目录名称"
            name="name"
            rules={[{ required: true, message: '请输入目录名称!' }]}
          >
            <Input placeholder="请输入目录名称!" />
          </Form.Item>
          <Form.Item label="类型" name="type" rules={[{ required: true, message: '请选择类型!' }]}>
            <Radio.Group>
              <Radio value="1">默认</Radio>
              <Radio value="2">参与初始化过滤</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="关联父章节"
            name="parentSection"
            rules={[{ required: false, message: '!' }]}
          >
            {selectedKeyObj?.name}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
