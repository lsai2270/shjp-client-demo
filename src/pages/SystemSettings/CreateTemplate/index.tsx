import { PageContainer } from '@ant-design/pro-layout';
import { connect, Dispatch, history } from 'umi';
import React, { useState, useEffect } from 'react';
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
} from 'antd';
const { confirm } = Modal;
const { Option } = Select;
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import $ from 'jquery';
import E from 'wangeditor';
import styles from './index.less';
import { hanldeOnResolveHtml } from '@/tools';
import { StateType } from './model';
import CatalogueComp from '@/components/ReportManage/catalogueComp';
import FormulaComp from '@/components/ReportManage/formulaComp';
import ElementComp from './components/elementComp';
import AdviceComp from '@/components/ReportManage/adviceComp';
import DailyComp from '@/components/ReportManage/dailyComp';
import { updateTemplate, updatePatchSection } from '@/services/systemSetting';
import htmlFormat from 'html-formatter';
const ReportManage = (props: any) => {
  // const { } = props;
  let editor: any = null;
  const { title, id } = history?.location?.query;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [key, setKey] = useState('1');
  const [compArr, setCompArr] = useState([true, true, true]);
  const compsArr = ['目录', '公式', '元件'];

  const [content, setContent] = useState(''); //wangEditor实例
  const [templateData, setTemplateData] = useState<any>({}); //模版
  const [catalogueKey, setCatalogueKey] = useState<string>(''); //当前目录key
  const [sectionInfo, setSectionInfo] = useState<any[]>([]); //章节

  const [paramInfo, setParamInfo] = useState<any>({}); //参数数据
  const [tableInfo, setTableInfo] = useState<any>({}); //表格数据
  const [formulaInfo, setFormulaInfo] = useState<any>([]); //公式数据

  const [editorObj, setEditorObj] = useState<any>(undefined);
  const [saveLoading, setSaveLoading] = useState<any>(false);
  const [codeFlag, setCodeFlag] = useState<boolean>(false);
  const [titleType, setTitleType] = useState<any>('模版');
  useEffect(() => {
    editor = new E('#editorContainer');
    editor.config.uploadImgHeaders = {
      Authorization: localStorage.getItem('Authorization'),
    };
    editor.config.uploadImgServer = '/api/v1/file/upload';
    editor.config.uploadImgHooks = {
      customInsert: function (insertImgFn: any, result: any) {
        // console.log('customInsert', result);
        insertImgFn('http://dev-shjp.citybit.cn' + result.data.path); // 只插入一个图片，多了忽略
      },
    };
    editor.config.focus = true;
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
    // editor.txt.eventHooks.enterUpEvents.push(()=>{
    //   editor.cmd.do(
    //     'insertHTML',
    //     `<p><br></p>
    //     `,
    //   );
    // })
    editor.create();
    setEditorObj(editor);
    // hanldeOnGetTemplate('init');
    return () => {
      // 组件销毁时销毁编辑器
      editor.destroy();
    };
  }, []);
  // 目录切换
  const hanldeOnSelected = (key: string) => {
    // console.log(key);
    // console.log(editorObj);
    if (editorObj) {
      let sectionHtml = editorObj.txt.html();
      editorObj.txt.clear();
      let newSectionInfo: any = sectionInfo.map((item) => {
        // 加载当前的content
        if (item._id == key) {
          editorObj.txt.html(item.htmlContent);
        }
        // 保存上一次的content
        if (item._id == catalogueKey) {
          item.htmlContent = sectionHtml;
        }
        return item;
      });

      setSectionInfo(newSectionInfo);
    }
    setCatalogueKey(key);
  };
  // 组件选择
  const handleCompSelected = (menu: any) => {
    console.log(menu);
    let newCompArr = compArr.concat([]);
    if (newCompArr[menu.key]) {
      newCompArr[menu.key] = false;
    } else {
      newCompArr[menu.key] = true;
    }
    setCompArr(newCompArr);
  };
  // 添加元件
  const handleOnAddElement = (eleStr: string, paramsId: any) => {
    console.log('paramsId', paramsId);
    // console.log("eleStr",eleStr);
    if (eleStr.includes('imgContainer')) {
      editorObj.txt.append(eleStr);
    } else if (eleStr.includes('evalTextContainer')) {
      editorObj.cmd.do('insertHTML', eleStr);
    } else {
      editorObj.cmd.do('insertHTML', eleStr);
    }
    let newsectionInfo = sectionInfo.map((item) => {
      if (eleStr.includes('evalTextContainer')) {
        if (item._id == catalogueKey) {
          if (item.cycleTextInfo.indexOf(paramsId) == -1) {
            item?.cycleTextInfo?.push(paramsId);
          }
        }
      } else if (eleStr.includes('tableContainer')) {
        if (item._id == catalogueKey) {
          if (item.tableInfo.indexOf(paramsId) == -1) {
            item?.tableInfo?.push(paramsId);
          }
        }
      } else {
        if (item._id == catalogueKey) {
          if (item.paramInfo.indexOf(paramsId) == -1) {
            item.paramInfo?.push(paramsId);
          }
        }
      }
      return item;
    });
    setSectionInfo(newsectionInfo);
  };
  // 保存
  const handleOnSave = () => {
    console.log('sectionInfo', sectionInfo);
    setSaveLoading(true);
    let newsectionInfo = sectionInfo.map((item) => {
      if (item._id == catalogueKey) {
        let htmlstr = editorObj.txt.html();
        if (Boolean(htmlstr)) {
          item.content = hanldeOnResolveHtml(htmlstr);
          // console.log('item.content', item.content);
          item.htmlContent = htmlstr;
          // console.log('htmlstr', htmlstr);
        }
      }
      //  else {
      //   if (Boolean(item?.content)) {
      //     // item.content = hanldeOnResolveHtml(item.htmlContent)
      //   }
      // }
      item.paramInfo.forEach((param: any, paramIndex: number) => {
        if (Boolean(param?._id)) {
          if (item?.content?.indexOf(param?._id) == -1) {
            item.paramInfo.splice(paramIndex, 1);
          }
        } else {
          if (item?.content?.indexOf(param) == -1) {
            item.paramInfo.splice(paramIndex, 1);
          }
        }
      });
      item.tableInfo.forEach((param: any, paramIndex: number) => {
        if (Boolean(param?._id)) {
          if (item?.content?.indexOf(param?._id) == -1) {
            item.tableInfo.splice(paramIndex, 1);
          }
        } else {
          if (item?.content?.indexOf(param) == -1) {
            item.tableInfo.splice(paramIndex, 1);
          }
        }
      });
      item.cycleTextInfo.forEach((param: any, paramIndex: number) => {
        if (Boolean(param?._id)) {
          if (item?.content?.indexOf(param?._id) == -1) {
            item.cycleTextInfo.splice(paramIndex, 1);
          }
        } else {
          if (item?.content?.indexOf(param) == -1) {
            item.cycleTextInfo.splice(paramIndex, 1);
          }
        }
      });
      // console.log('item', item);
      let paramInfo = item.paramInfo.map((item: any) => {
        if (Boolean(item._id)) {
          return item._id;
        }
        return item;
      });
      let tableInfo = item.tableInfo.map((item: any) => {
        if (Boolean(item._id)) {
          return item._id;
        }
        return item;
      });
      // console.log("tableInfo","------>",tableInfo);
      let cycleTextInfo = item.cycleTextInfo.map((item: any) => {
        if (Boolean(item._id)) {
          return item._id;
        }
        return item;
      });
      return {
        _id: item._id,
        content: item.content || '',
        htmlContent: item.htmlContent || '',
        formulaInfo: item.formulaInfo.map((item: any) => item._id),
        paramInfo: Array.from(new Set(paramInfo)),
        tableInfo: Array.from(new Set(tableInfo)),
        cycleTextInfo: Array.from(new Set(cycleTextInfo)),
      };
    });
    // console.log("newsectionInfo",newsectionInfo);
    updatePatchSection({
      paramInfo: newsectionInfo,
    })
      .then((res) => {
        // console.log(res);
        if (res.code == 200) {
          message.success('保存成功!');
        } else {
          message.warning(res.msg);
        }
        setSaveLoading(false);
      })
      .catch((err) => {
        setSaveLoading(false);
        message.error('保存接口出错!');
      });
  };
  const hanldeOnSetAbstract = () => {
    confirm({
      title: '您正在切换摘要模版。',
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          <span style={{ color: 'red' }}>请确认是否切换成“摘要模版”进行编辑？。</span>
          <br />
        </span>
      ),
      onOk() {
        history.push({
          pathname: '/createTemplate/abstractSetting',
          query: {
            id: id,
            title: title,
          },
        });
      },
    });
  };
  const handleOnShowCode = () => {
    if (codeFlag) {
      let text = $('.w-e-text').text();
      editorObj.txt.html(text);
      setCodeFlag(false);
    } else {
      const html: any = editorObj.txt.html();
      // console.log("html",`{${html}}`);
      let result = htmlFormat.render(html);
      // editorObj.txt.text(`
      //   <pre type="html">
      //     <code>${result}</code>
      //   </pre>
      // `)
      const str = `<pre><script type='text/html' style='display:block'>${result}</script></pre>`;
      // $('.w-e-text').text(html);
      editorObj.txt.text(str);
      setCodeFlag(true);
    }
  };
  return (
    <PageContainer className={styles.container} pageHeaderRender={false}>
      <Row className={styles.headGap}>
        <Col span={24} className={styles.flexBetween}>
          <div>
            <Space>
              {/* <Button
                type="primary"
                loading={false}
                onClick={() => {
                  history.push('/systemSettings/template');
                }}
              >
                返回
              </Button> */}
              {/* <Button
                onClick={() => {
                  history.push('/systemSettings/template/initSetting');
                }}
              >
                初始化配置
              </Button> */}
              {/* <Button onClick={hanldeOnSetAbstract}>摘要配置</Button> */}
            </Space>
          </div>
          <div>
            <Space>
              <Button
                type="primary"
                loading={false}
                onClick={() => {
                  history.push('/systemSettings/template');
                }}
              >
                取消
              </Button>
              <Button type="primary" loading={saveLoading} onClick={handleOnSave}>
                保存
              </Button>
            </Space>
          </div>
        </Col>
        <Divider />
        <Col span={24} className={styles.flexCenter}>
          <div className={styles.reportTitle}>
            <span style={{ marginRight: '20px' }}>
              <h3>
                {title} (<a>{titleType}</a>)
              </h3>
            </span>
            {/* <span> 当前版本: V1.0</span> */}
          </div>
          <div className={styles.comps}>
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
                height="528px"
                sectionInfo={sectionInfo}
                setSectionInfo={setSectionInfo}
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
                sectionInfo={sectionInfo}
                setSectionInfo={setSectionInfo}
                catalogueKey={catalogueKey}
              />
            )}
          </div>
        </Col>
        <Col span={14}>
          <div className={styles.contentContain}>
            <div id="contentContainer">
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
            {compArr[2] && (
              <ElementComp onAddElement={handleOnAddElement} catalogueKey={catalogueKey} />
            )}
            {/* <DailyComp /> */}
          </div>
          {/* 审查意见 */}
          <div className={styles.adviceContain}>
            {/* <AdviceComp /> */}
            {/* <DailyComp /> */}
          </div>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default connect(({ createTemplate }: { createTemplate: StateType }) => ({
  contentsData: createTemplate.contentsData,
}))(ReportManage);
