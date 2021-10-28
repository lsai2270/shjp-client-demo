import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
const { Option } = Select;
interface propsType {
  value?: any;
  pageSize?: number;
  hanldeOnChange: any;
  handleOnGetData: Function;
  // optionData: any[];
  placeholder: string;
}
const ScrollSelect: React.FC<propsType> = (props) => {
  const { hanldeOnChange, handleOnGetData, placeholder, pageSize, value } = props;
  const [pagination, setPagination] = useState<any>({
    current: 1,
    pageSize: pageSize || 10,
    total: 0,
  });
  const [optionData, setoptionData] = useState<any[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<any>(true);
  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    const res = await handleOnGetData(pagination);
    setoptionData(res.data);
    setPagination({
      ...pagination,
      total: res.count,
    });
  };
  const handleOnScrollOptions = async (e: any) => {
    const { clientHeight, scrollHeight, scrollTop } = e.target;
    if (pagination.total > pagination.current * pagination.pageSize) {
      if (scrollHeight < clientHeight + scrollTop + 15) {
        if (loadingStatus) {
          setLoadingStatus(false);
          const params = { ...pagination, current: pagination.current + 1 };
          const data = await handleOnGetData(params);
          setoptionData([...optionData, ...data.data]);
          setPagination(params);
          setTimeout(() => {
            setLoadingStatus(true);
          }, 0);
        }
      }
    }
  };
  return (
    <Select
      placeholder={placeholder}
      labelInValue
      style={{ width: '100%' }}
      value={value}
      onPopupScroll={handleOnScrollOptions}
      onChange={hanldeOnChange}
    >
      {optionData.map((item: any, index: number) => {
        return (
          <Option key={index} value={item._id}>
            {item.name}
          </Option>
        );
      })}
    </Select>
  );
};
export default ScrollSelect;
