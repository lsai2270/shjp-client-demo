import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { history } from 'umi';
import { Select } from 'antd';
const { Option } = Select;
import lodash from 'lodash';
import { dicDataAll } from '@/services/systemSetting';
export default (props: any) => {
  // console.log(props);
  const { id, type } = history?.location?.query;
  const { handleonselect, name, contentsdata } = props;
  const [optionsArr, setOptionsArr] = useState<any[]>([]);
  let selectedValue = '';
  if (type == 1) {
    selectedValue = contentsdata[name] ? lodash.get(contentsdata[name], `draftValue[${id}]`) : '';
  } else {
    selectedValue = contentsdata[name] ? contentsdata[name].value : '';
  }
  useEffect(() => {
    if (name) {
      console.log(contentsdata[name]);
      if (lodash.get(contentsdata[name], 'dicDataId')) {
        handleOnGetOptionData(contentsdata[name]?.dicDataId);
      }
    }
  }, []);
  const handleOnGetOptionData = async (id: string) => {
    const res = await dicDataAll({ parentId: id });
    try {
      if (res.code == 200) {
        setOptionsArr(res.data);
      }
    } catch (e) {}
  };
  return (
    <>
      <Select {...props} value={selectedValue} onChange={(value) => handleonselect(value, name)}>
        {optionsArr.map((item: any) => {
          return <Option value={item.name}>{item.name}</Option>;
        })}
      </Select>
    </>
  );
};
