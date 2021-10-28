import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { connect, history, Dispatch } from 'umi';
import { Select } from 'antd';
const { Option } = Select;
import lodash from 'lodash';
import JsxParser from 'parser-string-html-jsx';
import SelectComp from '@/components/ReportManage/SelectComp';
import InputComp from '@/components/ReportManage/InputComp';
import ShowImage from '@/components/ReportManage/addImage/ReturnImg';
import AddTable from '@/components/ReportManage/addTable';
import { getTableData, reportTemplate } from '@/services/reportManage';
export default (props: any) => {
  const { id, type } = history?.location?.query;
  const { cycleTextInfo, contentsdata, name, projectid, handleonselect, handleonsetinput } = props;
  const [commonParams, setCommonParams] = useState<any[]>([]);
  const [conditionParams, setConditionParams] = useState<any[]>([]);
  const [jsxData, setJsxData] = useState<any>('');
  const [commonParamsKeys, setCommonParamsKeys] = useState<any>({});
  const [tableInfo, setTableInfo] = useState<any>({});
  useEffect(() => {
    if (cycleTextInfo[name]?.tableInfo?.length > 0) {
      getTemplateData();
    }
  }, []);
  const getTemplateData = async () => {
    const res = await reportTemplate(id);
    try {
      if (res.code == 200) {
        let arr = cycleTextInfo[name]?.tableInfo.map((item: any) => {
          return new Promise<void>((resolve, reject) => {
            getTableData({
              _id: item,
              projectId: projectid,
              recentForecastId: res.data.recentForecastId,
              futureForecastId: res.data.futureForecastId,
              reportId: id,
            }).then((res) => {
              // console.log(res);
              if (res.code == 200) {
                resolve(res.data);
              }
            });
          });
        });
        Promise.all(arr).then((res) => {
          let newTableInfo = Object.assign({}, tableInfo);
          res.forEach((item: any, index: number) => {
            item.forEach((tableItem: any) => {
              newTableInfo[`${cycleTextInfo[name]?.tableInfo[index]}_${tableItem._id}`] = tableItem;
            });
          });
          console.log('newTableInfo', newTableInfo);
          setTableInfo(newTableInfo);
        });
      }
    } catch (e) {}
  };
  useEffect(() => {
    if (contentsdata && projectid) {
      if (cycleTextInfo[name]) {
        // 获取表格数据
        // console.log('cycleTextInfo----->', cycleTextInfo[name]);
        // 形式参数用于显示
        let newCommonParams: any = [];
        // 条件参数用于map
        let newConditionParams: any = [];
        let newJsxData = `<div style="display: inline" class="evalTextContainer ${name}">`;
        cycleTextInfo[name]?.params.forEach((item: any) => {
          if (item.type == '1') {
            newCommonParams.push(item);
          }
          if (item.type == '2') {
            newConditionParams.push(item);
          }
        });
        // 获取条件参数的值
        const conditionData = contentsdata[newConditionParams[0].paramsId];
        let evalTextArr: any;
        if (type == '1') {
          evalTextArr = conditionData?.draftValue ? conditionData?.draftValue[id] : [];
        } else {
          evalTextArr = conditionData?.value || [];
        }
        // console.log('evalTextArr', evalTextArr);
        if (evalTextArr) {
          // 循环过滤条件
          if (cycleTextInfo[name]?.filter.length > 1) {
            evalTextArr = evalTextArr?.filter((item: any) => {
              let str = ``;
              cycleTextInfo[name].filter.forEach((element: any, index: number) => {
                if (index > 0) {
                  str += `&&`;
                }
                str += `"${item[element.params]}"${element.operator}"${element.value}"`;
              });
              return eval(str);
            });
          } else if (cycleTextInfo[name].filter.length == 1) {
            let filterCondition = cycleTextInfo[name].filter[0];
            //   console.log("filterCondition--->",filterCondition);
            //  console.log('evalTextArr', evalTextArr);
            evalTextArr = evalTextArr?.filter((item: any) =>
              eval(
                `"${item[filterCondition.params]}"${filterCondition.operator}"${
                  filterCondition.value
                }"`,
              ),
            );
          }
          // console.log('evalTextArr', evalTextArr);
          // console.log('newCommonParams', newCommonParams);
          // 循环文本
          let newCommonParamsKeys: any = {};
          evalTextArr?.forEach((item: any, index: number) => {
            let content = cycleTextInfo[name].content;
            // console.log('content===>', content);
            newCommonParams.forEach((paramItem: any) => {
              if (item[paramItem.params]) {
                // console.log('item[paramItem.params]', item[paramItem.params]);
                // content = content.replace(eval(`/#{${paramItem.params}}#/g`),item[paramItem.params]);
                content = content.replace(
                  eval(`/${paramItem.paramsId}/g`),
                  `${paramItem.params}${index}`,
                );
                if (type == 1) {
                  newCommonParamsKeys[`${paramItem.params}${index}`] = {
                    draftValue: { [id]: item[paramItem.params] },
                  };
                } else {
                  newCommonParamsKeys[`${paramItem.params}${index}`] = {
                    value: item[paramItem.params],
                  };
                }
              } else {
                // 参数
                for (const key in contentsdata) {
                  if (Object.prototype.hasOwnProperty.call(contentsdata, key)) {
                    const element: any = contentsdata[key];
                    let keys = `${paramItem.params}_${projectid}_${item.code}`;
                    if (keys == element.code) {
                      // console.log("element",element);
                      content = content.replace(paramItem.paramsId, element.sourceId);
                    }
                  }
                }
              }
            });
            // 表格
            if (cycleTextInfo[name]?.tableInfo?.length > 0) {
              cycleTextInfo[name]?.tableInfo.forEach((tableId: string) => {
                content = content.replace(eval(`/${tableId}/g`), `${tableId}_${item._id}`);
              });
            }
            newJsxData += content;
          });
          newJsxData += `</div>`;
          setJsxData(newJsxData);
          setCommonParams(newCommonParams);
          setConditionParams(newConditionParams);
          setCommonParamsKeys(newCommonParamsKeys);
        }
      }
    }
  }, [contentsdata, projectid]);
  return (
    <JsxParser
      bindings={{
        handleonsetinput: handleonsetinput,
        handleonselect: handleonselect,
        contentsdata: { ...contentsdata, ...commonParamsKeys },
        paramInfo: { ...contentsdata, ...commonParamsKeys },
        tableInfo: tableInfo,
      }}
      disableKeyGeneration={true}
      autoCloseVoidElements={true}
      renderInWrapper={false}
      components={{
        InputComp,
        SelectComp,
        ShowImage,
        AddTable,
      }}
      jsx={jsxData}
    />
  );
};
