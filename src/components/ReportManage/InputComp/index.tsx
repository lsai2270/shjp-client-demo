import React from 'react';
import lodash from 'lodash';
import { connect, Dispatch, history } from 'umi';
import { Input, Tooltip } from 'antd';
const { TextArea } = Input;
// input组件
const InputComp = (props: any) => {
  const { id, type } = history?.location?.query;
  const { name, contentsdata, handleonsetinput } = props;
  let inputValue = '';
  const nameArr = name?.split('_');
  let inputType = 1;
  let inputKey = nameArr[0];
  if (nameArr.length > 1) {
    inputType = nameArr[1];
  }
  if (contentsdata) {
    if (type == 1) {
      //草稿
      inputValue = contentsdata[inputKey]
        ? lodash.get(contentsdata[inputKey], `draftValue[${id}]`)
        : '';
    } else {
      inputValue = contentsdata[inputKey] ? contentsdata[inputKey].value : '';
    }
  }
  // 循环文本type==2
  if (nameArr.length > 2) {
    let width = inputValue ? (inputValue.length * 17 < 120 ? 120 : inputValue.length * 17) : 160;
    if (history.location.pathname.includes('reportManage/create')) {
      return <Input value={inputValue} disabled name={name} style={{ width: width + 'px' }} />;
    } else {
      return <span>{inputValue == 'undefined' ? '' : inputValue}</span>;
    }
  }
  if (type == '2') {
    return <span>{inputValue == 'undefined' ? '' : inputValue}</span>;
  }
  if (inputType == 2) {
    return <TextArea {...props} value={inputValue} onChange={handleonsetinput} />;
  } else {
    let width = inputValue ? (inputValue.length * 17 < 120 ? 120 : inputValue.length * 17) : 160;
    return (
      <Tooltip title={inputValue}>
        <Input
          {...props}
          disabled={contentsdata[inputKey]?.type != '1' ? true : false}
          value={inputValue}
          style={{ width: width + 'px' }}
          onChange={handleonsetinput}
        />
      </Tooltip>
    );
  }
};
export default InputComp;
