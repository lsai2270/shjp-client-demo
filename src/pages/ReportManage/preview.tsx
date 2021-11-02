import { PageContainer } from '@ant-design/pro-layout';
import { connect, Dispatch, history } from 'umi';
import React, { useState, useEffect } from 'react';
import { exportWord } from 'mhtml-to-word';
import $ from 'jquery';
import {
  Table,
  Button,
  Dropdown,
  Input,
  Form,
  Row,
  Col,
  Divider,
  Spin,
  Menu,
  Progress,
  Checkbox,
  Space,
  Radio,
  message,
} from 'antd';
import { PoweroffOutlined, DownOutlined } from '@ant-design/icons';
import E from 'wangeditor';
import styles from './preview.less';
import { StateType } from './model';
import lodash from 'lodash';
import CatalogueComp from '@/components/ReportManage/catalogueComp';
import FormulaComp from '@/components/ReportManage/formulaComp';
import ElementComp from '@/components/ReportManage/elementComp';
import AdviceComp from '@/components/ReportManage/adviceComp';
import DailyComp from '@/components/ReportManage/dailyComp';
import AddImage from '@/components/ReportManage/addImage/ReturnImg';
import ShowImage from '@/components/ReportManage/addImage/ReturnImg';
import AddTable from '@/components/ReportManage/addTable';
import SelectComp from '@/components/ReportManage/SelectComp/ReturnValue';
import EvalTextComp from '@/components/ReportManage/EvalTextComp';
import Loading from '@/components/Loading';
import JsxParser from 'parser-string-html-jsx';
import { getTreeData, getTreeDataContent } from '@/tools';
import {
  getTemplateById,
  getTableData,
  paramsUpdateData,
  paramsUpdatePatchData,
  reportTemplate,
  getTablebatchGenerateData,
} from '@/services/reportManage';

function getHeadMenu(key: string) {
  switch (key) {
    case '1':
      return '暂存草稿';
    case '2':
      return '暂存退出';
    case '3':
      return '提交正文';
    case '4':
      return '仅推出';
    default:
      break;
  }
}
const InputComp = (props: any) => {
  const { id, type } = history?.location?.query;
  const { name, contentsdata, handleonsetinput } = props;
  let inputValue = '';
  const nameArr = name.split('_');
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
    return <span>{contentsdata[inputKey]}</span>;
  }
  return <span>{inputValue}</span>;
};
const ReportManage = (props: any) => {
  // const { dispatch, contentData } = props;
  let editor: any = null;
  // let contentData = {};
  const [form] = Form.useForm();
  const { id, type } = history?.location?.query;
  const [loading, setLoading] = useState<boolean>(true);
  const [key, setKey] = useState('1');
  const [compArr, setCompArr] = useState([true, true, true, true, true]);
  const compsArr = ['目录', '公式', '元件', '审查', '日志'];
  const [inputValue, setInputValue] = useState('');
  const [content, setContent] = useState('');
  const [contentsData, setContentsData] = useState<any>({});
  const [xmlData, setXmlData] = useState<any>({});
  const [jsxData, setJsxData] = useState<any>(``);
  const [imageData, setImageData] = useState<any>({});
  const [templateData, setTemplateData] = useState<any>({}); //模版
  const [catalogueData, setCatalogueData] = useState<any[]>([]); //目录
  const [paramInfo, setParamInfo] = useState<any>({}); //参数数据
  const [tableInfo, setTableInfo] = useState<any>({}); //表格数据
  const [formulaInfo, setFormulaInfo] = useState<any>([]); //公式数据
  const [cycleTextInfo, setCycleTextInfo] = useState<any>(undefined);
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false);

  useEffect(() => {
    hanldeOnGetTemplate();
  }, []);
  const hanldeOnGetTemplate = () => {
    setLoadingFlag(true);
    reportTemplate(id).then((res) => {
      // console.log(res);
      const { sectionInfo, paramInfo, _id, name } = res.data;
      if (res.code == 200) {
        let newJsxData = ``;
        let newparamInfo = {};
        let newFormulaInfo = formulaInfo.concat([]);
        let tableInfos: any[] = [];
        let newCycleTextInfo = {};
        paramInfo.forEach((params: any) => {
          newparamInfo[params.sourceId] = params;
        });
        let treeData = getTreeData(sectionInfo, '', 'allData');
        newJsxData = getTreeDataContent(treeData);
        sectionInfo.forEach((item: any, index: number) => {
          item.cycleTextInfo.forEach((item: any) => {
            newCycleTextInfo[item._id] = item;
          });
          tableInfos.push(...item.tableInfo);
        });
        handleOnSetTableData(lodash.uniq(tableInfos), res.data);
        setCycleTextInfo(newCycleTextInfo);
        setFormulaInfo(newFormulaInfo);
        setParamInfo(newparamInfo);
        // console.log(newparamInfo);
        // contentData = newparamInfo;
        setContentsData(newparamInfo);
        setJsxData(newJsxData);
        setCatalogueData(getTreeData(sectionInfo, ''));
        setTemplateData(res.data);
      }
    });
  };
  // 获取表格数据
  const handleOnSetTableData = async (tableInfoIds: any, template: any) => {
    // console.log('tableInfoIds------->', tableInfoIds);
    // 批量处理
    // if (tableInfoIds.length > 0) {
    //   const res = await getTablebatchGenerateData({
    //     _id: tableInfoIds,
    //     projectId: template.projectId,
    //     recentForecastId: template.recentForecastId || '',
    //     futureForecastId: template.futureForecastId || '',
    //     reportId: template._id,
    //   });
    //   try {
    //     if (res.code == 200) {
    //       setLoadingFlag(false);
    //       // console.log("newTableInfo",newTableInfo);
    //       setTableInfo(res.data);
    //     }
    //   } catch (e) {
    //     message.error('获取表格出错');
    //   }
    // }
    if (tableInfoIds.length > 0) {
      let promiseArr: any[] = [];
      tableInfoIds.forEach(async (id: any) => {
        let p = new Promise<any>((resolve, reject) => {
          getTableData({
            _id: id,
            projectId: template.projectId,
            recentForecastId: template.recentForecastId || '',
            futureForecastId: template.futureForecastId || '',
            reportId: template._id,
          }).then((res) => {
            resolve(res);
          });
        });
        promiseArr.push(p);
      });
      Promise.all(promiseArr).then((res) => {
        let newTableInfo = Object.assign({}, tableInfo);
        tableInfoIds.forEach((tableId: any, index: any) => {
          newTableInfo[tableId] = res[index].data;
        });
        setLoadingFlag(false);
        // console.log("newTableInfo",newTableInfo);
        setTableInfo(newTableInfo);
      });
    }
  };
  // input组件
  const handleSetInput = (e: any) => {
    let name = e.target.getAttribute('name');
    let newContentsData = Object.assign({}, contentsData);
    newContentsData[name].value = e.target.value;
    setContentsData(newContentsData);
  };

  // 图片
  let imageFlag = true;
  const handleOnSetImages = (id: string, src: string) => {
    if (imageFlag) {
      imageFlag = false;
      console.log(id, src);
      let newParamInfo = Object.assign({}, paramInfo);
      newParamInfo[id] = { ...newParamInfo[id] };
      newParamInfo[id].value = src;
      // 更新
      paramsUpdateData(id, { value: src }).then((res) => {
        console.log(res);
        if (res.code == 200) {
          hanldeOnGetTemplate();
          setTimeout(() => {
            imageFlag = true;
          }, 1000);
        }
      });
    }
  };
  const handleOnBack = () => {
    history.push({
      pathname: '/reportManage/create',
      query: {
        id: id,
        type: type,
      },
    });
  };
  const handleOnExport = () => {
    $('p img').each((index: number, ele: any) => {
      ele.width = 540;
    });
    let html = $('#contentContainer').html();
    // console.log(html);
    exportWord({
      mhtml: html, //将转化好的内容放到mhtml这个参数中
      data: { title: 'exportword' },
      filename: templateData.name,
      // style: 'span{ font-size:20px; }',
    });
  };
  return (
    <PageContainer className={styles.main} pageHeaderRender={false}>
      <Row className={styles.headGap}>
        <Col span={24} className={styles.flexBetween}>
          <div style={{ marginBottom: '10px' }}>
            <Button type="primary" onClick={handleOnBack}>
              返回
            </Button>
            <Button style={{ marginLeft: '10px' }} type="primary" onClick={handleOnExport}>
              导出
            </Button>
            <Button
              style={{ marginLeft: '10px' }}
              type="primary"
              onClick={() => {
                let htmlStr: any = window.document.body.innerHTML;
                let contentHtml: any = document.querySelector('#contentContainer')?.innerHTML;
                window.document.body.innerHTML = contentHtml;
                window.print();
                // window.document.body.innerHTML = htmlStr;
                window.location.reload();
              }}
            >
              打印
            </Button>
          </div>
          <div className={styles.reportTitle}>
            <span style={{ marginRight: '20px' }}>
              <h3>上海智能医疗示范基地一期交通影响评价</h3>
            </span>
            {/* <span> 当前版本: V1.0</span> */}
          </div>
          <div></div>
        </Col>
      </Row>
      <Loading visible={loadingFlag} />
      <Row gutter={10} className={styles.bodyContent}>
        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
          <div className={styles.contentContain}>
            <div id="contentContainer">
              {/* <div id="editorContainer"> */}
              <JsxParser
                bindings={{
                  handleOnSetImage: handleOnSetImages,
                  handleonsetinput: handleSetInput,
                  contentsdata: paramInfo,
                  paramInfo: paramInfo,
                  tableInfo: tableInfo,
                  cycleTextInfo: cycleTextInfo,
                  projectid: templateData.projectId,
                }}
                disableKeyGeneration={true}
                autoCloseVoidElements={true}
                components={{
                  InputComp,
                  AddImage,
                  ShowImage,
                  AddTable,
                  EvalTextComp,
                  SelectComp,
                }}
                jsx={jsxData}
              />
              {/* </div> */}
            </div>
          </div>
        </Col>
      </Row>
    </PageContainer>
  );
};
export default connect(({ reportManage }: { reportManage: StateType }) => ({
  contentData: reportManage.contentsData,
}))(ReportManage);
