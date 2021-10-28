import React, { useState, useEffect } from 'react';
import { Input, Space, Select, Button, Modal, message, Radio } from 'antd';
const { Search } = Input;
const { Option } = Select;
import styles from './index.less';
import { ParamsComp } from '@/pages/SystemSettings/ParamsManage';
import { FormComp } from '@/pages/SystemSettings/FormManage';
import { EvalTextComp } from '@/pages/SystemSettings/EvalTextManage';
export default (props: any) => {
  const { onAddElement, catalogueKey } = props;
  const elementOptions = ['请选择元件类型', '文本框', '图片', '表单', '下拉选择框', '循环文本'];
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>('1');
  const [uploadType, setUploadType] = useState<string>('1');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedParams, setSelectedParams] = useState<any>(null);
  const [flag, setFlag] = useState<boolean>(false);
  const [compType, setCompType] = useState<string>('');
  const [inputType, setInputType] = useState<any>(1);
  const [radioValue, setRadioValue] = useState<any>(1);
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
    setFlag(false);
    setIsModalVisible(false);
  };
  /**
   * @name: 关闭弹窗
   */
  const handleCancel = () => {
    setFlag(false);
    setIsModalVisible(false);
  };
  const hanldeOnAddElement = (type: string) => {
    if (!Boolean(catalogueKey)) {
      message.warning('请先选择目录后,再进行元件添加!');
      return;
    }
    if (!Boolean(selectedParams)) {
      message.warning('请先选择参数后,再进行元件添加!');
      return;
    }
    let paramId = selectedParams?._id + '';
    if (type == '1') {
      if (inputType == 1) {
        onAddElement(
          `<p><input  class="ant-input" style='width:120px'  placeholder=${selectedParams.name}  name=${selectedParams._id}_${inputType} contentsdata={contentsdata}  handleonsetinput={handleonsetinput} /></p>`,
          paramId,
        );
      } else {
        onAddElement(
          `<p><textarea  class="ant-input"  placeholder=${selectedParams.name}  name=${selectedParams._id}_${inputType} contentsdata={contentsdata}  handleonsetinput={handleonsetinput} /></p>`,
          paramId,
        );
      }

      setSelectedParams(null);
    } else if (type == '2') {
      if (uploadType == '1') {
        message.warning('请选择图片上传方式!');
        return;
      }
      if (uploadType == '2') {
        let str = 'vertical';
        if (radioValue == 1) {
          str = 'vertical';
        } else if (radioValue == 2) {
          str = 'horizontal';
        }
        onAddElement(
          `<div class="imgContainer ${selectedParams._id} add ${str}">
            <div class="imgCompFlex" style="display: flex;">
              <div class="imgInfo">
                <div id=${selectedParams._id} class="ant-image" style="width: 200px; height: 200px;">
                  <img class="ant-image-img" src="/error.png" style="height: 200px;">
                </div>
              </div>
            <div class="uplodContain">
            <span class=""><div class="ant-upload ant-upload-select ant-upload-select-text">
            <span tabindex="0" class="ant-upload" role="button">
            <input type="file" accept="png,jpg,bmp" style="display: none;">
            <button  type="button" class="ant-btn">
            <span role="img" aria-label="upload" class="anticon anticon-upload">
            <svg viewBox="64 64 896 896" focusable="false" data-icon="upload" width="1em" height="1em" fill="currentColor" aria-hidden="true">
            <path d="M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 00-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z">
            </path></svg></span><span>上传文件</span>
            </button></span></div></span>
            <div class="extName" >支持扩展名: png,jpg,bmp</div>
            </div>
            </div>
          </div>
          <p><br></p>`,
          paramId,
        );
      } else if (uploadType == '3') {
        let str = 'vertical';
        if (radioValue == 1) {
          str = 'vertical';
        } else if (radioValue == 2) {
          str = 'horizontal';
        }
        onAddElement(
          `<div class="imgContainer ${selectedParams._id} show ${str}" style='display:flex'>
            <div class="imgCompFlex" style="display: flex;">
              <div class="imgInfo">
                <div id=${selectedParams._id} class="ant-image" style="width: 200px; height: 200px;">
                  <img class="ant-image-img" src="/error.png" style="height: 200px;">
                </div>
              </div>
            </div>
          </div>
          <p><br></p>`,
          paramId,
        );
      }
      setSelectedParams(null);
    } else if (type == '3') {
      console.log(selectedParams);
      let thArr = ``;
      selectedParams.header.forEach((item: any) => {
        thArr += `<th class="ant-table-cell">${item.name}</th>`;
      });
      onAddElement(
        `<div class="tableContainer ${selectedParams._id}" style='display:flex'>
          <div class="ant-table ant-table-empty">
          <div class="ant-table-container">
          <div class="ant-table-content">
          <table style="table-layout: auto;">
          <colgroup></colgroup>
          <thead class="ant-table-thead">
            <tr>
            ${thArr}
            </tr>
          </thead>
          <tbody class="ant-table-tbody">
          <tr class="ant-table-placeholder">
          <td colspan=${selectedParams?.header?.length} class="ant-table-cell">
          <div class="ant-empty ant-empty-normal"><div class="ant-empty-image"><svg class="ant-empty-img-simple" width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 1)" fill="none" fill-rule="evenodd"><ellipse class="ant-empty-img-simple-ellipse" cx="32" cy="33" rx="32" ry="7"></ellipse><g class="ant-empty-img-simple-g" fill-rule="nonzero"><path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path><path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" class="ant-empty-img-simple-path"></path></g></g></svg></div><div class="ant-empty-description">暂无数据</div></div>
          </td></tr></tbody></table></div></div></div>
          </div><br>
          <p><br></p>`,
        paramId,
      );
    }
    if (type == '4') {
      onAddElement(
        `<select placeholder="请选择" style="width: 160px" name=${selectedParams._id} >
        </select>`,
        paramId,
      );
    }
    if (type == '5') {
      onAddElement(
        `<div style="display: inline" class="evalTextContainer ${selectedParams._id}">
          ${selectedParams.htmlContent}
          </div><br>
          <p><br></p>`,
        selectedParams._id,
      );
    }
    setSelectedParams(undefined);
  };
  /**
   * @name: 选择参数
   */
  const handleOnSetParams = (paramsData: any) => {
    console.log('paramsData', paramsData);
    setSelectedParams(paramsData);
  };
  const hanldeOnRadioChange = (e: any) => {
    // console.log('e.target.value------>', e.target.value);
    setRadioValue(e.target.value);
  };
  return (
    <div className={styles.container}>
      <Modal
        className={styles.paramsModal}
        title={
          compType == 'params' ? '选择参数' : compType == 'table' ? '选择表格' : '选择循环文本'
        }
        width={'60%'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {compType == 'params' && flag && <ParamsComp handleOnSetParams={handleOnSetParams} />}
        {compType == 'table' && flag && <FormComp handleOnSetParams={handleOnSetParams} />}
        {compType == 'evalText' && flag && <EvalTextComp handleOnSetParams={handleOnSetParams} />}
      </Modal>
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
            placeholder="请选择元件类型"
            value={selectedValue}
            style={{ width: '100%' }}
            onChange={handleOnSelected}
          >
            {elementOptions.map((item, index) => {
              return (
                <Option key={index} value={index + 1 + ''}>
                  {item}
                </Option>
              );
            })}
          </Select>
        </div>
        {selectedValue == '2' && (
          <div className={styles.selectedContent}>
            <h4>绑定字段:</h4>
            {/* <div>
              <a>四至范围-东临</a>
            </div> */}
            <div className={styles.colGap}>
              <Radio.Group value={inputType} onChange={(e) => setInputType(e.target.value)}>
                <Radio value={1}>单行输入框</Radio>
                <Radio value={2}>多行文本输入框</Radio>
              </Radio.Group>
            </div>
            <div className={styles.colGap}>
              <Button
                style={{ width: '100%' }}
                onClick={() => {
                  setIsModalVisible(true);
                  setTimeout(() => {
                    setFlag(true);
                  }, 100);
                  setCompType('params');
                }}
              >
                {selectedParams ? selectedParams.name : '选择参数'}
              </Button>
            </div>
            <div className={styles.colGap}>
              未找到相关参数? <a href="/systemSettings/paramsManage">新建参数</a>
            </div>
            <div>
              <Button
                type="primary"
                style={{ width: '100%' }}
                onClick={() => hanldeOnAddElement('1')}
              >
                添加
              </Button>
            </div>
          </div>
        )}
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
                <Space direction="vertical">
                  <div>排版方式:</div>
                  <Radio.Group onChange={hanldeOnRadioChange} value={radioValue}>
                    <Radio value={1}>上下(默认)</Radio>
                    <Radio value={2}>左右</Radio>
                  </Radio.Group>
                </Space>
              )}
            </div>
            {/* <span> 名称:</span>
                  <div style={{ marginTop: '15px' }}>
                    <a>近期交通流量（背景）.jpg</a>
                  </div> */}
            <div className={styles.contentItem}>
              <div>
                <Space>
                  <span style={{ color: 'red' }}>*</span>
                  <span> 绑定字段:</span>
                </Space>
              </div>
              <div>
                <Button
                  style={{ width: '100%' }}
                  onClick={() => {
                    setIsModalVisible(true);
                    setTimeout(() => {
                      setFlag(true);
                    }, 100);
                    setCompType('params');
                  }}
                >
                  {selectedParams ? selectedParams.name : '选择参数'}
                </Button>
              </div>
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
              <Button
                type="primary"
                style={{ width: '100%' }}
                onClick={() => hanldeOnAddElement('2')}
              >
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
                    setTimeout(() => {
                      setFlag(true);
                    }, 100);
                    setCompType('table');
                  }}
                >
                  {selectedParams ? selectedParams.name : '请选择表格'}
                </Button>
              </div>
            </div>
            <div className={styles.contentItem}>
              {/* <Button style={{ width: '100%' }}>
                重新获取
              </Button> */}
              <Button
                type="primary"
                style={{ width: '100%' }}
                onClick={() => hanldeOnAddElement('3')}
              >
                添加
              </Button>
            </div>
          </div>
        )}
        {selectedValue == '5' && (
          <div className={styles.selectedContent}>
            <div className={styles.contentItem}>
              <div className={styles.colGap}>
                <Space>
                  <span style={{ color: 'red' }}>*</span>
                  <span> 绑定字段:</span>
                </Space>
              </div>
              <div>
                <Button
                  style={{ width: '100%' }}
                  onClick={() => {
                    setIsModalVisible(true);
                    setTimeout(() => {
                      setFlag(true);
                    }, 100);
                    setCompType('params');
                  }}
                >
                  {selectedParams ? selectedParams.name : '选择参数'}
                </Button>
              </div>
            </div>
            <div className={styles.contentItem}>
              {/* <Button style={{ width: '100%' }}>
                重新获取
              </Button> */}
              <Button
                type="primary"
                style={{ width: '100%' }}
                onClick={() => hanldeOnAddElement('4')}
              >
                添加
              </Button>
            </div>
          </div>
        )}
        {selectedValue == '6' && (
          <div className={styles.selectedContent}>
            <div className={styles.contentItem}>
              <div className={styles.colGap}>
                <Space>
                  <span style={{ color: 'red' }}>*</span>
                  <span> 绑定字段:</span>
                </Space>
              </div>
              <div>
                <Button
                  style={{ width: '100%' }}
                  onClick={() => {
                    setIsModalVisible(true);
                    setTimeout(() => {
                      setFlag(true);
                    }, 100);
                    setCompType('evalText');
                  }}
                >
                  {selectedParams ? selectedParams.name : '选择循环文本'}
                </Button>
              </div>
            </div>
            <div className={styles.contentItem}>
              {/* <Button style={{ width: '100%' }}>
                重新获取
              </Button> */}
              <Button
                type="primary"
                style={{ width: '100%' }}
                onClick={() => hanldeOnAddElement('5')}
              >
                添加
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
