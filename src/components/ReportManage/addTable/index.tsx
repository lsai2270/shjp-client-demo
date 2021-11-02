import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { Table, Button } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import $ from 'jquery';
export default (props: any) => {
  const { tableInfo, id } = props;
  const [tableData, setTableData] = useState<any[]>([]);
  useEffect(() => {
    $(`table`).attr('border', 1).attr('cellpadding', 10).attr('cellspacing', 0);
    if (tableInfo && JSON.stringify(tableInfo) != '{}') {
      // console.log('tableInfo====>', tableInfo[id]);
      if (Array.isArray(tableInfo[id])) {
        setTableData(tableInfo[id]);
      } else {
        setTableData([tableInfo[id]]);
      }
    }
  }, [tableInfo]);
  return (
    <div className={`tableContainer ${id}`}>
      <div className="tableCompFlex">
        {tableData &&
          tableData?.map((item: any) => {
            return (
              <div className="tableInfo">
                <div style={{ marginBottom: '10px' }}>
                  <strong>{item?.name}</strong>
                </div>
                <div>
                  <div>
                    <table
                      className={styles.reportTable}
                      id={id}
                      width="100%"
                      cellPadding="0"
                      cellSpacing="0"
                    >
                      <tbody>
                        {item?.result.map((item: any, index: number) => {
                          let strArr = [];
                          if (index == 0) {
                            strArr = item.map((item1: any, index1: number) => {
                              return <td key={index + index1}>{item1}</td>;
                            });
                          } else {
                            strArr = item.map((item1: any, index1: number) => {
                              return (
                                <td key={index + index1}>
                                  {item1}
                                  {index1 != 0 && id == '60192fc082431ab81e7d8e05' && '%'}
                                </td>
                              );
                            });
                          }
                          return <tr key={index}>{strArr}</tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.addTableContain}></div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
