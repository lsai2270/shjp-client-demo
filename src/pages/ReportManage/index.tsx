import { PageContainer } from '@ant-design/pro-layout';
import { connect, Dispatch, history } from 'umi';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import htmlFormat from 'html-formatter';
import JsxParser from 'parser-string-html-jsx';
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
  Modal,
  Select,
  Tooltip,
} from 'antd';
const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;
import { PoweroffOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import lodash from 'lodash';
import $ from 'jquery';
import E from 'wangeditor';
import moment from 'moment';
import styles from './index.less';
import { StateType } from './model';
import CatalogueComp from './components/catalogueComp';
import FormulaComp from '@/components/ReportManage/formulaComp';
import ElementComp from '@/components/ReportManage/elementComp';
import AdviceComp from '@/components/ReportManage/adviceComp';
import DailyComp from '@/components/ReportManage/dailyComp';
import AddImage from '@/components/ReportManage/addImage';
import ShowImage from '@/components/ReportManage/addImage/ReturnImg';
import AddTable from '@/components/ReportManage/addTable';
import Loading from '@/components/Loading';
import SelectComp from '@/components/ReportManage/SelectComp';
import EvalTextComp from '@/components/ReportManage/EvalTextComp';
import InputComp from '@/components/ReportManage/InputComp';
import ScrollSelect from '@/components/ScrollSelect';
import { getTreeData, hanldeOnResolveHtml } from '@/tools';
import {
  getTableData,
  paramsUpdateData,
  paramsUpdatePatchData,
  initDbTypeParam,
  reportTemplate,
  reportParamsUpdate,
  reportRefresh,
  reportGetLatest,
  reportUpdateParam,
} from '@/services/reportManage';

import { getList } from '@/services/projectManage';
import { getList as predictGetList } from '@/services/predictManage';
import { reportDraft, reportSubmit } from '@/services/reportManage';
const { REACT_APP_ENV } = process.env;
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

const ReportManage = (props: any) => {
  const { dispatch, contentsData } = props;
  let editor: any = null;
  let timerFlag = true;
  const { id, type, update } = history?.location?.query;
  const [form] = Form.useForm();
  const [predictForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [editorObj, setEditorObj] = useState<any>(undefined); //editor实例
  const [key, setKey] = useState('1');
  const [compArr, setCompArr] = useState([true, true, true]);
  const compsArr = ['目录', '公式', '日志'];
  const [inputValue, setInputValue] = useState('');
  const [content, setContent] = useState('');
  const [xmlData, setXmlData] = useState<any>({});
  const [jsxData, setJsxData] = useState<any>(``);
  const [imageData, setImageData] = useState<any>({});
  const [templateData, setTemplateData] = useState<any>({}); //模版
  const [catalogueData, setCatalogueData] = useState<any[]>([]); //目录
  const [catalogueKey, setCatalogueKey] = useState<string>(''); //当前目录key
  const [sectionInfo, setSectionInfo] = useState<any[]>([]); //当前章节
  // const [paramInfo, setParamInfo] = useState<any>({}); //参数数据
  const [tableInfo, setTableInfo] = useState<any>({}); //表格数据
  // const [formulaInfo, setFormulaInfo] = useState<any>([]); //公式数据
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [projectLists, setProjectLists] = useState<any[]>([]);
  const [seletedProject, setSeletedProject] = useState<any>(undefined);
  const [predictList, setPredictList] = useState([]);
  // 循环参数
  const [cycleTextInfo, setCycleTextInfo] = useState<any>(undefined);
  const [seletedPredict, setSeletedPredict] = useState<any>(undefined);
  // 章节相关
  const [sectionParams, setSectionParams] = useState<any>([]);
  const [sectionFormulas, setSectionFormulas] = useState<any>([]);
  // 传送门Element
  const [nodeEle, setNodeEle] = useState<any>(null);
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false);
  // 提交flag
  const [submitFlag, setSubmitFlag] = useState<boolean>(false);
  // 当前章节进度
  const [progress, setProgress] = useState<any>('0');
  // 刷新日志
  const [reflashDaily, setReflashDaily] = useState<any>(0);
  const [codeFlag, setCodeFlag] = useState<boolean>(false);

  const [currentPredictLists, setCurrentPredictLists] = useState<any[]>([]); // 近期预测
  const [forcastPredictLists, setForcastPredictLists] = useState<any[]>([]); // 远期预测
  // 已点击章节
  const [autoCatalogue, setAutoCatalogue] = useState<any[]>([]); // 远期预测

  const showModal = () => {
    setIsModalVisible(true);
    // getList({ current: 1, pageSize: 20 }).then((res) => {
    //   // console.log(res);
    //   if (res.code == 200) {
    //     setProjectList(res.data.data);
    //   }
    // });
  };

  const handleOk = async () => {
    const values = await predictForm.validateFields();
    // console.log("values===>",values);
    setIsModalVisible(false);
    reportUpdateParam(id, {
      projectId: values?.project?.value,
      recentForecastId: values?.recent?.value,
      futureForecastId: values?.forward?.value,
    }).then((res) => {
      // console.log(res);
      if (res.code == 200) {
        message.success('更换预测,数据更新成功!');
        hanldeOnGetTemplate('init', id);
      }
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  useEffect(() => {
    editor = new E('#editorContainer');
    editor.config.uploadImgHeaders = {
      Authorization: localStorage.getItem('Authorization'),
    };
    editor.config.uploadImgServer = '/api/v1/file/upload';
    editor.config.uploadImgHooks = {
      customInsert: function (insertImgFn: any, result: any) {
        console.log('customInsert', result);
        insertImgFn('http://dev-shjp.citybit.cn' + result.data.path); // 只插入一个图片，多了忽略
      },
    };
    editor.config.zIndex = 1;
    editor.config.onchange = (newHtml: string) => {
      setContent(newHtml);
    };
    editor.config.menus = [
      'head',
      'bold',
      'fontSize',
      'fontName',
      'italic',
      'underline',
      'strikeThrough',
      'indent',
      'lineHeight',
      'foreColor',
      'backColor',
      'link',
      'list',
      'todo',
      'justify',
      'quote',
      'emoticon',
      'image',
      'table',
      'splitLine',
      'undo',
      'redo',
    ];
    // editor.config.onblur = function () {
    //   console.log('onblur')
    // }
    // editor.config.onfocus = function () {
    //     console.log('onfocus')
    // }
    // console.log(editor);
    setEditorObj(editor);
    editor.create();
    let nodeEle = document.querySelector('.w-e-text');
    setNodeEle(nodeEle);
    hanldeOnGetTemplate('init', id);
    return () => {
      // 组件销毁时销毁编辑器
      editor.destroy();
    };
  }, []);
  useEffect(() => {
    let timer: any;
    if (REACT_APP_ENV) {
      if (timerFlag && templateData && Object.keys(templateData).length > 0) {
        // 定时保存
        setTimeout(() => {
          timer = setInterval(() => {
            handleAutoSaveDraft();
          }, 180000);
        }, 180000);
        timerFlag = false;
      }
    }
    return () => {
      clearInterval(timer);
    };
  }, [templateData]);
  // useEffect(() => {
  //   if (id) {
  //     if (templateData._id!=id&&id) {
  //       hanldeOnGetTemplate('update', id);
  //     } else {
  //       hanldeOnGetTemplate('init', id);
  //     }
  //   }
  // }, [id]);
  const hanldeOnGetTemplate = (type: any, reportId: string) => {
    reportTemplate(reportId).then((res) => {
      // console.log(res);
      if (res.code == 200) {
        if (sectionInfo) {
          const { sectionInfo, paramInfo } = res.data;
          let newJsxData = ``;
          let newContentsData = {};
          let newCycleTextInfo = {};
          // let newFormulaInfo = formulaInfo.concat([]);
          let newSectionInfo: any;
          let newProgress = {};
          sectionInfo.forEach((sec: any) => {
            newProgress[sec._id] = sec.progress;
            if (sec._id == catalogueKey) {
              newSectionInfo = sec;
            }
          });
          // let newSectionInfo: any = sectionInfo?.filter((item: any) => item._id == catalogueKey);
          newSectionInfo = type != 'init' ? newSectionInfo : sectionInfo[0];
          newJsxData = newSectionInfo?.content;
          // newFormulaInfo.push(...newSectionInfo.formulaInfo);
          newSectionInfo?.cycleTextInfo.forEach((item: any) => {
            newCycleTextInfo[item._id] = item;
          });

          paramInfo?.forEach((params: any) => {
            newContentsData[params.sourceId] = params;
          });
          // // console.log("newparamInfo",newparamInfo);
          // setParamInfo(newparamInfo);
          setProgress(newProgress);
          setCycleTextInfo(newCycleTextInfo);
          setJsxData(newJsxData);
          setSectionInfo(sectionInfo);
          setSectionFormulas(newSectionInfo?.formulaInfo);
          setSectionParams(newSectionInfo?.paramInfo);
          // handleOnSetTableData();
          // setFormulaInfo(newFormulaInfo);
          if (dispatch) {
            dispatch({
              type: 'reportManage/setContentsData',
              payload: newContentsData,
            });
            dispatch({
              type: 'reportManage/setReportId',
              payload: res?.data?.reportId,
            });
          }
          setTemplateData(res?.data);
          if (type == 'init') {
            setCatalogueData(getTreeData(sectionInfo, ''));
            setCatalogueKey(sectionInfo[0]._id);
            setAutoCatalogue([sectionInfo[0]._id]);
            let pArr = $('.w-e-text > p').get();
            pArr.forEach((ele: any) => {
              ele.remove();
            });
          } else {
            setCatalogueKey(catalogueKey);
          }
        }
      }
    });
  };
  // 目录切换
  const hanldeOnSelected = (key: string) => {
    // let pArr =  $('.w-e-text > p').get();
    // pArr.forEach((ele:any) => {
    //   if(ele.innerHTML!="<br>"){
    //     ele.remove()
    //   }
    // });

    let preContenHtml = hanldeOnResolveHtml(editorObj.txt.html());
    let newSectionInfo: any = sectionInfo.concat([]);
    newSectionInfo.forEach((item: any, index: number) => {
      // 切换目录保存上个
      if (item._id == catalogueKey) {
        item.content = preContenHtml;
      }
      if (item._id == key) {
        console.log('item', item);
        if (item.belongType == '1') {
          setSubmitFlag(true);
        } else if (item.belongType == '2') {
          setSubmitFlag(false);
        }
        let newCycleTextInfo = {};
        // console.log('item.cycleTextInfo', item.cycleTextInfo);
        item.cycleTextInfo.forEach((item1: any) => {
          newCycleTextInfo[item1._id] = item1;
        });
        // console.log('item?.formulaInfo', item?.formulaInfo);
        setCycleTextInfo(newCycleTextInfo);
        setSectionFormulas(item?.formulaInfo);
        setSectionParams(item?.paramInfo);
        // editorObj.txt.clear();
        handleOnSetTableData(item.tableInfo);
        // console.log(item);
        setJsxData(item?.content);
        setCatalogueKey(key);
        setAutoCatalogue(lodash.uniq([...autoCatalogue, key]));
      }
    });
    // console.log(newSectionInfo);
    let newNodeEle = nodeEle;
    setNodeEle(null);
    setSectionInfo(newSectionInfo);
    setTimeout(() => {
      setNodeEle(newNodeEle);
    }, 0);
  };
  // 获取表格数据
  const handleOnSetTableData = (tableInfoIds: any) => {
    // console.log('tableInfoIds------->', tableInfoIds);
    if (tableInfoIds.length > 0) {
      let promiseArr: any[] = [];
      tableInfoIds.forEach(async (id: any) => {
        let p = new Promise<any>((resolve, reject) => {
          getTableData({
            _id: id,
            projectId: templateData.projectId,
            recentForecastId: templateData.recentForecastId || '',
            futureForecastId: templateData.futureForecastId || '',
            reportId: templateData._id,
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
        // console.log("newTableInfo",newTableInfo);
        setTableInfo(newTableInfo);
      });
    }
  };
  // input - change
  const handleSetInput = (e: any) => {
    let name = e.target.getAttribute('name');
    let inputId = name.split('_')[0];
    let newContentsData = Object.assign({}, contentsData);
    newContentsData[inputId] = { ...newContentsData[inputId] };
    if (templateData.type == '1') {
      //草稿
      // console.log(newContentsData[inputId]);
      newContentsData[inputId].draftValue = { [templateData._id]: '' };
      newContentsData[inputId].draftValue[templateData._id] = e.target.value;
    } else {
      newContentsData[inputId].value = e.target.value;
    }
    // console.log('newContentsData', newContentsData);
    if (dispatch) {
      dispatch({
        type: 'reportManage/setContentsData',
        payload: newContentsData,
      });
    }
  };
  // 下拉框事件响应
  const handleOnSelect = (value: any, name: string) => {
    console.log(name, '-----', value);
    let newContentsData = Object.assign({}, contentsData);
    if (type == 1) {
      newContentsData[name].draftValue[id] = value;
    } else {
      newContentsData[name].value = value;
    }
    if (dispatch) {
      dispatch({
        type: 'reportManage/setContentsData',
        payload: newContentsData,
      });
    }
  };
  // 图片
  const handleOnSetImages = (id: string, data: string) => {
    let newContentsData = Object.assign({}, contentsData);
    newContentsData[id] = { ...newContentsData[id] };
    if (templateData.type == '1') {
      newContentsData[id].draftValue = { ...newContentsData[id]?.draftValue };
      newContentsData[id].draftValue[templateData._id] = data;
    } else {
      newContentsData[id].value = data;
    }
    // console.log(newContentsData[id]);
    // setParamInfo(newParamInfo);
    if (dispatch) {
      dispatch({
        type: 'reportManage/setContentsData',
        payload: newContentsData,
      });
    }
  };

  // 切换保存
  const handleMenuChange = (menu: any) => {
    // console.log(menu);
    setKey(menu.key);
  };
  // const hanldeOnResolveHtml = () => {
  //   let str = editorObj.txt.html();
  //   // console.log("str",str);
  //   // let str =  $('.jsx-parser').html();
  //   let astr = str
  //     .replace(/data-inspector-line="(?:[^"\\]|\\.)*"/g, '')
  //     .replace(/data-inspector-column="(?:[^"\\]|\\.)*"/g, '')
  //     .replace(/data-inspector-relative-path="(?:[^"\\]|\\.)*"/g, '')
  //     .replace(/<!--(?:[^"\\]|\\.)*-->/g, '');
  //   // console.log(astr);
  //   let astr1 = $(astr).get();
  //   astr1.forEach((ele: any, index: number) => {
  //     if (index != 0) {
  //       astr1[0].appendChild(ele);
  //     }
  //   });
  //   astr1 = astr1[0];
  //   if (astr1 == undefined) {
  //     return;
  //   }
  //   let deleteImgDomArr = astr1.querySelectorAll('.imgCompFlex');
  //   let deleteTableDomArr = astr1.querySelectorAll('.tableCompFlex');
  //   deleteImgDomArr.forEach((imgDom: any) => {
  //     imgDom.remove();
  //   });
  //   deleteTableDomArr.forEach((tableDom: any) => {
  //     tableDom.remove();
  //   });
  //   let imgContainerArr = astr1.querySelectorAll('.imgContainer');
  //   imgContainerArr.forEach((ele: any) => {
  //     let className = ele.className.split(' ');
  //     if (className[2] == 'add') {
  //       $(ele).replaceWith(
  //         `<AddImage  id=${className[1]} imgData={paramInfo} handlensetimage={handleOnSetImage} ></AddImage>`,
  //       );
  //     } else {
  //       $(ele).replaceWith(
  //         `<ShowImage   id=${className[1]}  imgData={paramInfo} handlensetimage={handleOnSetImage}></ShowImage>`,
  //       );
  //     }
  //   });
  //   let tableContainerArr = astr1.querySelectorAll('.tableContainer');
  //   tableContainerArr.forEach((ele: any) => {
  //     let className = ele.className.split(' ');
  //     $(ele).replaceWith(`<AddTable  id=${className[1]} tableInfo={tableInfo} ></AddTable>`);
  //   });
  //   let inputArr = astr1.querySelectorAll('.ant-input');
  //   inputArr.forEach((ele: any) => {
  //     let name = ele.name;
  //     // console.log('name', name);
  //     let placeholder = ele.placeholder;
  //     let styleWidth = ele.style.width;
  //     $(ele).replaceWith(
  //       `<InputComp placeholder=${placeholder}  name=${name} contentsdata={contentsdata} style='width: ${styleWidth}' handleonsetinput={handleonsetinput} />`,
  //     );
  //   });
  //   //  console.log(astr1);
  //   let htmlStr = $(astr1).html();
  //   let imgStr = htmlStr
  //     .replace(/addimage/g, 'AddImage')
  //     .replace(/showimage/g, 'ShowImage')
  //     .replace(/imgdata="(?:[^"\\]|\\.)*"/g, 'imgData={paramInfo}')
  //     .replace(/handlensetimage="(?:[^"\\]|\\.)*"/g, 'handlensetimage={handleOnSetImage}');
  //   let tableStr = imgStr
  //     .replace(/addtable/g, 'AddTable')
  //     .replace(/tableinfo="(?:[^"\\]|\\.)*"/g, 'tableInfo={tableInfo}');
  //   let inputStr = tableStr
  //     .replace(/inputcomp/g, 'InputComp')
  //     .replace(/contentsdata="(?:[^"\\]|\\.)*"/g, 'contentsdata={contentsdata}')
  //     .replace(/handleonsetinput="(?:[^"\\]|\\.)*"/g, 'handleonsetinput={handleonsetinput}');
  //   if (inputStr.includes('<p><br></p>')) {
  //   } else {
  //     inputStr += `<p><br></p>`;
  //   }

  //   // console.log(inputStr);
  //   return inputStr;
  // };
  // 自动保存
  const handleAutoSaveDraft = () => {
    let htmlStr: any;
    if (editor) {
      htmlStr = hanldeOnResolveHtml(editor?.txt?.html());
    } else if (editorObj) {
      htmlStr = hanldeOnResolveHtml(editorObj?.txt?.html());
    }
    let newContentsData: any[] = [];
    for (const key in contentsData) {
      if (Object.prototype.hasOwnProperty.call(contentsData, key)) {
        const element = contentsData[key];
        if (element._id) {
          newContentsData.push({
            _id: element._id,
            value: element.draftValue ? element?.draftValue[templateData._id] : '',
          });
        }
      }
    }
    let params = {
      _id: templateData._id,
      paramInfo: newContentsData,
      reportId: templateData.reportId,
      name: templateData.name,
      projectId: templateData.projectId,
      projectName: templateData.projectName,
      templateId: templateData.templateId,
      templateName: templateData.templateName,
      sectionInfo: sectionInfo
        .filter((item1: any) => item1.belongType == '1' && autoCatalogue.includes(item1._id))
        .map((item: any) => {
          return {
            ...item,
            // _id: item._id,
            // tableInfo: item.tableInfo,
            formulaInfo: item.formulaInfo.map((formula: any) => formula._id),
            // paramInfo: item.paramInfo,
            // parentId: item.parentId,
            // name: item.name,
            content: item._id == catalogueKey ? htmlStr : item.content,
          };
        }),
    };
    if (autoCatalogue.length == 0) return;
    reportDraft(params)
      .then((res) => {
        // console.log(res);
        let date = moment().format('YYYY-MM-DD hh:mm:ss');
        if (res.code == 200) {
          message.success(`报告于${date}保存成功`);
          if (key == '1') {
            history.push({
              pathname: '/reportManage/create',
              query: {
                id: res?.data?._id,
                type: res?.data?.type,
              },
            });
            // hanldeOnGetTemplate('update', res?.data?._id);
            setAutoCatalogue([]);
          }
        } else {
          message.warning(`报告于${date}保存失败`);
        }
      })
      .catch((err) => {
        message.error(err);
      });
  };
  const hanldeOnMenuClick = () => {
    if (key == '1' || key == '2') {
      confirm({
        title: '您正在创建新的草稿。',
        icon: <ExclamationCircleOutlined />,
        content: (
          <span>
            <span style={{ color: 'red' }}>如果你是想保存当前草稿,请点击刷新!</span>
            <br />
            <span>您确定要继续吗?</span>
          </span>
        ),
        onOk() {
          setLoadingFlag(true);
          const htmlStr = hanldeOnResolveHtml(editorObj.txt.html());
          let newContentsData: any[] = [];
          for (const key in contentsData) {
            if (Object.prototype.hasOwnProperty.call(contentsData, key)) {
              const element = contentsData[key];
              if (element._id) {
                newContentsData.push({
                  _id: element._id,
                  value: element.draftValue ? element?.draftValue[templateData._id] : '',
                });
              }
            }
          }
          let params = {
            _id: templateData._id,
            paramInfo: newContentsData,
            reportId: templateData.reportId,
            name: templateData.name,
            projectId: templateData.projectId,
            projectName: templateData.projectName,
            templateId: templateData.templateId,
            templateName: templateData.templateName,
            sectionInfo: sectionInfo
              .filter((item1: any) => item1.belongType == '1' && autoCatalogue.includes(item1._id))
              .map((item: any) => {
                // if (item._id == catalogueKey) {
                //   console.log('htmlStr===>', htmlStr);
                // }
                return {
                  ...item,
                  // _id: item._id,
                  // tableInfo: item.tableInfo,
                  formulaInfo: item.formulaInfo.map((formula: any) => formula._id),
                  cycleTextInfo: item.cycleTextInfo.map((cycleItem: any) => cycleItem._id),
                  // paramInfo: item.paramInfo,
                  // parentId: item.parentId,
                  // name: item.name,
                  content: item._id == catalogueKey ? htmlStr : item.content,
                };
              }),
          };
          console.log(params);
          reportDraft(params)
            .then((res) => {
              // console.log(res);
              setLoadingFlag(false);
              if (res.code == 200) {
                message.success('暂存成功!');
                if (key == '1') {
                  history.push({
                    pathname: '/reportManage/create',
                    query: {
                      id: res?.data?._id,
                      type: res?.data?.type,
                    },
                  });
                  setReflashDaily(reflashDaily + 1);
                  // hanldeOnGetTemplate('update', res?.data?._id);
                  setAutoCatalogue([]);
                }
                if (key == '2') {
                  history.push('/reportManage');
                }
              } else {
                message.warning('暂存失败');
              }
            })
            .catch((err) => {
              setLoadingFlag(false);
              message.error(err);
            });
        },
      });
    } else if (key == '3') {
      setLoadingFlag(true);
      const htmlStr = hanldeOnResolveHtml(editorObj.txt.html(), 'report');
      let newContentsData: any[] = [];
      let sectionInfoContent = {};
      // for (const key in contentsData) {
      //   if (Object.prototype.hasOwnProperty.call(contentsData, key)) {
      //     const element = contentsData[key];
      //     if(element._id){
      //       newContentsData.push({
      //         _id: element._id,
      //         value: element.draftValue ? element?.draftValue[templateData._id] : '',
      //       });
      //     }
      //   }
      // }
      sectionInfo.forEach((item: any) => {
        if (item._id == catalogueKey) {
          sectionInfoContent = {
            _id: item._id,
            name: item.name,
            content: htmlStr,
          };
        }
      });
      let params = {
        paramInfo: sectionParams.map((item: any) => {
          let paramData = contentsData[item];
          return {
            _id: paramData._id,
            value:
              templateData.type == '1' ? paramData.draftValue[templateData._id] : paramData.value,
          };
        }),
        reportId: templateData.reportId,
        sectionInfo: sectionInfoContent,
      };
      reportSubmit(params)
        .then((res) => {
          // console.log(res);
          setLoadingFlag(false);
          if (res.code == 200) {
            setReflashDaily(reflashDaily + 1);
            message.success('正文提交成功!');
          } else {
            message.warning('正文提交失败!');
          }
        })
        .catch((err) => {
          setLoadingFlag(false);
          message.error('正文提交错误!');
        });
    } else if (key == '4') {
      history.push('/reportManage');
    }
  };
  const handleCompSelected = (menu: any) => {
    // console.log(menu);
    let newCompArr = compArr.concat([]);
    if (newCompArr[menu.key]) {
      newCompArr[menu.key] = false;
    } else {
      newCompArr[menu.key] = true;
    }
    setCompArr(newCompArr);
  };
  // 刷新
  const hanldeOnReFresh = () => {
    setLoadingFlag(true);
    reportRefresh(templateData._id).then((res) => {
      setLoadingFlag(false);
      if (res.code == 200) {
        hanldeOnGetTemplate('update', id);
        message.success('数据获取成功!');
      } else {
        message.warning('数据获取失败!');
      }
    });
    // const params = {
    //   reportId: templateData._id,
    //   paramInfo: sectionParams.map((item: any) => {
    //     let paramData = paramInfo[item];
    //     console.log(paramData);
    //     return {
    //       _id: paramData._id,
    //       value:
    //         templateData.type == '1' ? paramData.draftValue[templateData._id] : paramData.value,
    //     };
    //   }),
    // };
    // // console.log("params",params);
    // reportParamsUpdate(params)
    //   .then((res) => {
    //     console.log(res);
    //     if (res.code == 200) {
    //       message.success('数据保存成功!');
    //     } else {
    //       message.warning(res.msg);
    //     }
    //   })
    //   .catch((error) => {
    //     message.error('请求接口错误!');
    //   });
  };
  // 草稿/正文切换
  const handleChangeReportStatus = () => {
    if (type == '1') {
      history.push({
        pathname: '/reportManage/create',
        query: {
          id: templateData.reportId,
          type: 2,
        },
      });
      hanldeOnGetTemplate('init', id);
    } else {
      reportGetLatest({
        reportId: id,
      }).then((res) => {
        // console.log(res);
        if (res.code == 200) {
          history.push({
            pathname: '/reportManage/create',
            query: {
              id: res?.data?._id,
              type: 1,
            },
          });
          hanldeOnGetTemplate('init', res?.data?._id);
        }
      });
    }
  };
  const handleOnShowCode = () => {
    if (codeFlag) {
      let html = $('.w-e-text').text();
      let newSectionInfo: any = sectionInfo.concat([]);
      newSectionInfo.forEach((item: any, index: number) => {
        if (item._id == catalogueKey) {
          if (html) {
            setJsxData(hanldeOnResolveHtml(html));
          } else {
            setJsxData(item?.content);
          }
        }
      });
      let newNodeEle = nodeEle;
      setNodeEle(null);
      setCatalogueKey(catalogueKey);
      setSectionInfo(newSectionInfo);
      setTimeout(() => {
        setNodeEle(newNodeEle);
      }, 100);
      setCodeFlag(false);
    } else {
      const html: any = editorObj.txt.html();
      const parserHtml = $(html).html();
      let result = htmlFormat.render(parserHtml);
      // editorObj.txt.text(`
      //   <pre type="html">
      //     <code>${result}</code>
      //   </pre>
      // `)
      const str = `<pre><script type='text/html' style='display:block'>${result}</script></pre>`;
      // editorObj.txt.text(str);
      // console.log('result', result);
      $('.w-e-text .jsx-parser').html(str);
      setCodeFlag(true);
    }
  };
  // 获取Project
  const handleOnGetProject = async (params: any) => {
    const res = await getList(params);
    try {
      if (res.code == 200) {
        if (res.data.data.length > 0) {
          setProjectLists([...projectLists, ...res.data.data]);
        }
      }
    } catch (e) {
      message.error('获取项目接口出错!');
    }
    return res.data;
  };
  const handleOnProjectChange = (data: any) => {
    predictForm.setFieldsValue({
      project: data,
    });
    predictGetList({
      current: 1,
      pageSize: 100,
      projectId: data.value,
    }).then((res) => {
      if (res.code == 200) {
        let newCurrentLists: any[] = [];
        let newForcastLists: any[] = [];
        res.data.data.forEach((item: any) => {
          if (item.assessType == '近期') {
            newCurrentLists.push(item);
          }
          if (item.assessType == '远期') {
            newForcastLists.push(item);
          }
        });
        setCurrentPredictLists(newCurrentLists);
        setForcastPredictLists(newForcastLists);
      }
    });
  };
  return (
    <PageContainer className={styles.main} pageHeaderRender={false}>
      <Row className={styles.headGap}>
        <Col span={24} className={styles.flexBetween}>
          <Loading visible={loadingFlag} />
          <Modal title="更换预测" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <Form form={predictForm} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
              <Form.Item
                label="所属项目"
                name="project"
                rules={[{ required: true, message: '请输入参数名称!' }]}
              >
                <ScrollSelect
                  handleOnGetData={handleOnGetProject}
                  hanldeOnChange={handleOnProjectChange}
                  // optionData={projectLists}
                  placeholder="请选择项目"
                />
              </Form.Item>
              {/* <Form.Item
                label="选择类型"
                name="type"
                rules={[{ required: false, message: '请选择!' }]}
              >
                <Select placeholder="请选择类型!" labelInValue style={{ width: '100%' }}>
                  <Option value="1">用户输入</Option>
                </Select>
              </Form.Item> */}
              <Form.Item
                label="近期"
                name="recent"
                rules={[{ required: true, message: '请选择!' }]}
              >
                <Select placeholder="请选择!" labelInValue style={{ width: '100%' }}>
                  {currentPredictLists.map((item, index) => {
                    return (
                      <Option key={index} value={item._id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                label="远期"
                name="forward"
                rules={[{ required: false, message: '请选择!' }]}
              >
                <Select placeholder="请选择!" labelInValue style={{ width: '100%' }}>
                  {forcastPredictLists.map((item, index) => {
                    return (
                      <Option key={index} value={item._id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Form>
            {/* <Row>
              <Col span={4} offset={2} style={{ lineHeight: '30px' }}>
                选择项目:
              </Col>
              <Col span={16}>
                <Select
                  placeholder="请选择项目"
                  style={{ width: '100%' }}
                  value={seletedProject}
                  onChange={handleOnProjectChange}
                >
                  {projectLists.map((item: any, index) => {
                    return (
                      <Option key={index} value={item._id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Col>
            </Row>
            <Row style={{ marginTop: '10px' }}>
              <Col span={4} offset={2} style={{ lineHeight: '30px' }}>
                近期预测:
              </Col>
              <Col span={16}>
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  value={seletedPredict}
                  onChange={(value) => {
                    setSeletedPredict(value);
                  }}
                >
                  {predictList.map((item: any, index) => {
                    return (
                      <Option key={index} value={item._id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Col>
            </Row>
            <Row style={{ marginTop: '10px' }}>
              <Col span={4} offset={2} style={{ lineHeight: '30px' }}>
                远期预测:
              </Col>
              <Col span={16}>
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  value={seletedPredict}
                  onChange={(value) => {
                    setSeletedPredict(value);
                  }}
                >
                  {predictList.map((item: any, index) => {
                    return (
                      <Option key={index} value={item._id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Col>
            </Row> */}
          </Modal>
          <div>
            <Space>
              <Button
                onClick={() => {
                  history.push({
                    pathname: '/reportManage/preview',
                    query: {
                      id: id,
                      type: type,
                    },
                  });
                }}
              >
                报告预览
              </Button>
              {/* <Button
                onClick={() => {
                  history.push({
                    pathname: '/reportManage/summary',
                    query: {
                      id: id,
                      type: type,
                    },
                  });
                }}
              >
                报告摘要
              </Button> */}
              <Button
                onClick={() => {
                  history.push({
                    pathname: '/reportManage/cooperation',
                    query: {
                      id: id,
                      type: type,
                    },
                  });
                }}
              >
                多人协作
              </Button>
              <Button onClick={showModal}>更换预测</Button>
            </Space>
          </div>
          <div>
            <Space>
              <Button type="primary" loading={false} onClick={hanldeOnReFresh}>
                刷新
              </Button>
              <Dropdown.Button
                // disabled={key == '3' && submitFlag ? true : false}
                type="primary"
                overlay={
                  <Menu onClick={handleMenuChange}>
                    <Menu.Item key="1">暂存草稿</Menu.Item>
                    <Menu.Item key="2">暂存退出</Menu.Item>
                    <Menu.Item key="3">提交正文</Menu.Item>
                    <Menu.Item key="4">仅退出</Menu.Item>
                  </Menu>
                }
                buttonsRender={([leftButton, rightButton]: any) => [
                  React.cloneElement(leftButton, { loading: false }),
                  rightButton,
                ]}
                onClick={hanldeOnMenuClick}
              >
                {getHeadMenu(key)}
              </Dropdown.Button>
            </Space>
          </div>
        </Col>
        <Divider />
        <Col span={24} className={styles.flexBetween}>
          <div>
            <span> 总进度: </span>
            <span>
              <Progress
                percent={Number(templateData?.progress?.replace('%', ''))}
                style={{ width: '260px' }}
              />
            </span>
          </div>
          <div className={styles.reportTitle}>
            <span style={{ marginRight: '20px' }}>
              <h3>
                {templateData?.projectName}{' '}
                <span className={styles.reportStatus} onClick={handleChangeReportStatus}>
                  (<a>{type == '2' ? '正文' : '草稿'}</a>)
                </span>
              </h3>
            </span>
            {/* <span> 当前版本: V1.0</span> */}
          </div>
          <div>
            <span> 显示组件: </span>
            <span>
              <Dropdown
                overlay={
                  <Menu onClick={handleCompSelected}>
                    {compsArr.map((item: string, index: number) => {
                      return (
                        <Menu.Item key={`${index}`}>
                          <Checkbox checked={compArr[`${index}`]}>{item}</Checkbox>
                        </Menu.Item>
                      );
                    })}
                  </Menu>
                }
              >
                <a>
                  可见操作 <DownOutlined />
                </a>
              </Dropdown>
            </span>
          </div>
        </Col>
      </Row>
      <Row gutter={10} className={styles.bodyContent}>
        <Col span={5}>
          {/* 目录 */}
          <div className={styles.catalogueContain}>
            {compArr[0] ? (
              <CatalogueComp
                progress={progress}
                catalogueData={catalogueData}
                hanldeOnSelected={hanldeOnSelected}
              />
            ) : (
              <div style={{ height: '528px', minHeight: '528px' }}></div>
            )}
          </div>
          {/* 公式 */}
          <div className={styles.formulaContain}>
            {compArr[1] && (
              <FormulaComp
                // formulaInfo={sectionFormulas}
                contentsData={contentsData}
                sectionInfo={sectionInfo}
                setSectionInfo={setSectionInfo}
                catalogueKey={catalogueKey}
                projectId={templateData?.projectId}
              />
            )}
          </div>
        </Col>
        <Col span={14}>
          <div className={styles.contentContain}>
            <div id="contentContainer">
              {nodeEle &&
                createPortal(
                  <JsxParser
                    bindings={{
                      handleOnSetImage: handleOnSetImages,
                      handleonsetinput: handleSetInput,
                      handleonselect: handleOnSelect,
                      contentsdata: contentsData,
                      paramInfo: contentsData,
                      tableInfo: tableInfo,
                      cycleTextInfo: cycleTextInfo,
                      projectid: templateData.projectId,
                    }}
                    disableKeyGeneration={true}
                    autoCloseVoidElements={true}
                    renderInWrapper={true}
                    components={{
                      InputComp,
                      AddImage,
                      ShowImage,
                      AddTable,
                      SelectComp,
                      EvalTextComp,
                    }}
                    jsx={jsxData}
                  />,
                  nodeEle,
                )}
              <div className={styles.tools_code}>
                <Button type="primary" onClick={handleOnShowCode}>
                  {codeFlag ? '预览' : '源码'}
                </Button>
              </div>
              <div id="editorContainer"></div>
            </div>
          </div>
        </Col>
        <Col span={5}>
          {/* 元件 */}
          <div className={styles.elementContain}>
            {/* <ElementComp /> */}
            {compArr[2] && (
              <DailyComp
                projectId={templateData.projectId}
                reflashDaily={reflashDaily}
                hanldeOnGetTemplate={hanldeOnGetTemplate}
              />
            )}
          </div>
          {/* 审查意见 */}
          {/* <div className={styles.adviceContain}>
            <AdviceComp />
          </div> */}
        </Col>
      </Row>
    </PageContainer>
  );
};
export default connect(({ reportManage }: { reportManage: StateType }) => ({
  contentsData: reportManage.contentsData,
}))(ReportManage);
