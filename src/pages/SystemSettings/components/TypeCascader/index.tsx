import React, { useEffect, useState } from 'react';
import { Cascader, message } from 'antd';
import { getTreeData } from '@/tools';
import { dicDataAll, dicTypeList } from '@/services/systemSetting';
interface TypeCascaderProps {
  value: any[];
  onChange: any;
}
const TypeCascader: React.FC<TypeCascaderProps> = (props) => {
  const { value, onChange } = props;
  const [options, setOptions] = useState<any[]>([]);
  const [dicTypeLists, setDicTypeLists] = useState<any[]>([]);
  const [dicDataLists, setDicDataLists] = useState<any[]>([]);
  useEffect(() => {
    getCascaderData();
  }, []);
  const getCascaderData = async () => {
    const res = await dicTypeList({
      current: 1,
      pageSize: 50,
    });
    try {
      const res1 = await dicDataAll({});
      if (res.code == 200) {
        if (res1.code == 200) {
          let dicDataTree = getTreeData(res1.data, '0', 'typeCode');
          let newDicTypeLists = res.data.data.map((item: any, index: number) => {
            dicDataTree.forEach((item1: any) => {
              if (item.code == item1.typeCode) {
                item.children = item.children || [];
                item.children.push(item1);
              }
            });
            if (item.children) {
              return {
                title: item.name,
                key: item._id,
                children: item.children,
              };
            }
            return {
              title: item.name,
              key: item._id,
            };
          });
          setOptions(newDicTypeLists);
        }
      }
    } catch (e) {
      message.error('接口报错');
    }
  };
  return (
    <Cascader
      fieldNames={{ label: 'title', value: 'key' }}
      changeOnSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder="请选择"
    />
  );
};
export default TypeCascader;
