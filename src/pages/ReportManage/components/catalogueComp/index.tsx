import React, { useState, useEffect } from 'react';
import { Tree, Space, Modal, Input, Form, Button, Progress, Tooltip } from 'antd';
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons';
const { Search } = Input;
const { confirm } = Modal;
import styles from './index.less';
import { getTreeData, changeTreeDataToObj } from '@/tools';

export default (props: any) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const { catalogueData, progress, hanldeOnSelected } = props;
  const [dataList, setDataList] = useState<any[]>([]);
  const [selectedKey, setSelectedKey] = useState<any[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [nodeTreeItem, setNodeTreeItem] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); //目录Modal
  const [modalTitle, setModalTitle] = useState(''); //目录Modal
  useEffect(() => {
    if (catalogueData.length > 0) {
      // console.log('catalogueData', catalogueData);
      generateList(catalogueData);
      setSelectedKey([catalogueData[0].key]);
      let newSectionInfo = changeTreeDataToObj(catalogueData, '');
      let newExpandedKeys = newSectionInfo.map((item: any) => item._id);
      setExpandedKeys(newExpandedKeys);
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
    // console.log("selectedKeys--->",selectedKeys);
    setSelectedKey(selectedKeys);
    if (selectedKeys.length > 0) {
      hanldeOnSelected(selectedKeys[0]);
    } else {
      setNodeTreeItem(null);
    }
  };
  return (
    <div className={styles.contain}>
      <h2>目录</h2>
      <div style={{ display: 'flex' }}>
        <Search style={{ marginBottom: 8 }} placeholder="请输入" onChange={onChange} />
      </div>
      <Tree
        showLine={{ showLeafIcon: false }}
        onExpand={onExpand}
        onSelect={handleOnSeletedKeys}
        selectedKeys={selectedKey}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        treeData={loop(catalogueData)}
        titleRender={(nodeData) => {
          return (
            <div style={{ display: 'flex', overflow: 'auto' }}>
              {nodeData.key == selectedKey[0] ? (
                <span className={styles.nodeBgColor}>{nodeData.title}</span>
              ) : (
                <Tooltip placement="rightTop" title={`进度: ${progress[nodeData?.key]}`}>
                  <span style={{ padding: '0 5px' }}>{nodeData.title}</span>
                </Tooltip>
              )}
              {nodeData.key == selectedKey[0] && (
                <span className={styles.progress}>({progress[selectedKey[0]]})</span>
              )}
            </div>
          );
        }}
        height={400}
      />
    </div>
  );
};
