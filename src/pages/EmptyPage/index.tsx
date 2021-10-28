import { PageContainer } from '@ant-design/pro-layout';
import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Form } from 'antd';
import { Spin } from 'antd';
import styles from './index.less';
import E from 'wangeditor';
import Upload from '@/components/Upload';
import { exportWord } from 'mhtml-to-word';
const dataSource = [
  {
    key: '1',
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号',
  },
  {
    key: '2',
    name: '胡彦祖',
    age: 42,
    address: '西湖区湖底公园1号',
  },
];

let editor: any = null;
export default () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState('');
  const [reportData, setReportData] = useState<any>({ name: '哈哈哈哈哈' });
  const [dispaly, setDispaly] = useState<boolean>(true);
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    editor = new E('#editorContainer');
    editor.config.uploadImgServer = '/upload-img';
    // editor.config.onchange = (newHtml: string) => {
    //   setContent(newHtml);
    // };
    editor.create();
    // editor.txt.html(` <span><img src="../src/assets/1.jpg" alt="" /></span>`);
    return () => {
      // 组件销毁时销毁编辑器
      editor.destroy();
    };
  }, []);
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: any) => <Input placeholder="请输入" onChange={handleOnChange} />,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '住址',
      dataIndex: 'address',
      key: 'address',
    },
  ];
  const handleOnChange = (e: any) => {
    console.log(e.target.value);
  };
  const hanldeOnAdd = () => {
    let content = editor.txt.html();
    let tableArr = [
      [
        {
          rowSpan: 3,
          colSpan: 1,
          value: 11,
        },
        {
          rowSpan: 1,
          colSpan: 2,
          value: '机动车停车数量',
        },
        {
          rowSpan: 1,
          colSpan: 1,
          value: '376',
        },
        {
          rowSpan: 1,
          colSpan: 1,
          value: '辆',
        },
      ],
      [
        {
          rowSpan: 2,
          colSpan: 1,
          value: '其中',
        },
        {
          rowSpan: 1,
          colSpan: 1,
          value: '机动车车位数(地上)',
        },
        {
          rowSpan: 1,
          colSpan: 1,
          value: '18',
        },
        {
          rowSpan: 1,
          colSpan: 1,
          value: '辆',
        },
      ],
      [
        {
          rowSpan: 1,
          colSpan: 1,
          value: '机动车车位数(地下)',
        },
        {
          rowSpan: 1,
          colSpan: 1,
          value: '358',
        },
        {
          rowSpan: 1,
          colSpan: 1,
          value: '辆',
        },
      ],
    ];
    let trStr = ``;
    tableArr.forEach((row, index) => {
      let tdStr = ``;
      row.forEach((col, index1) => {
        tdStr += `<td rowspan=${col.rowSpan} colSpan=${col.colSpan}>${col.value}</td>`;
      });
      trStr += `<tr>${tdStr}</tr>`;
    });
    // editor.txt.html(`
    //   ${content}
    //   <span>
    //     <table border="1" width="70%" cellpadding="0" cellspacing="0">
    //       <tbody>
    //         ${trStr}
    //       </tbody>
    //     </table>
    //   </span>
    // `);
    editor.txt.html(`
    <h2 id="tszso">1.1 项目背景与概况</h2>
    <h3 id="sgdai">
      <font face="宋体">1.1.1 项目范围</font><br>
    </h3>
    <p style="padding-left:2em;">本次拟建项目为
      <input class="createReport ant-input" style="width: 100px" dataType="input" placeholder="项目名称" name="projectName">
      <input class="createReport ant-input" style="width: 100px" dataType="input" placeholder="地块1" name="plot1">
      <input class="createReport ant-input" style="width: 100px" dataType="input" placeholder="地块2" name="plot2">,
      用地范围东临<input class="createReport ant-input" style="width: 100px" dataType="input"  placeholder="东临" name="east">,
      西至<input class="createReport ant-input" style="width: 100px" dataType="input" placeholder="西临" name="west">,
      南起<input class="createReport ant-input" style="width: 100px" dataType="input" placeholder="南起" name="south">,
      北至<input class="createReport ant-input" style="width: 100px" dataType="input" placeholder="北至" name="north">。
    </p>
    <p>1.&nbsp; &nbsp; 商业工作人员出行方式</p>
    <p>
      本地块总建筑面积为<input class="createReport ant-input" style="width: 120px" dataType="formula" placeholder="商业总建筑面积" name="allArea">平方米。
      按每个岗位的服务面积为<input class="createReport ant-input" style="width: 120px" dataType="formula" placeholder="岗位服务面积" name="postArea">计算,
      到岗率<input class="createReport ant-input" style="width: 100px" dataType="formula" placeholder="到岗率" name="postRate">,
      租售率取<input class="createReport ant-input" style="width: 100px" dataType="formula" placeholder="租售率" name="rentalRate">,
      人均出行次数按<input class="createReport ant-input" style="width: 120px" dataType="formula" placeholder="人均出行次数" name="averageNum">人次/日计算。
    </p>
    <p>
      计算公式: 商业出行人员总人次 = 工作人员岗位数 * 工作人员到岗率 * 人均出行次数
    </p>
    <p>
      则研究年商业工作人员日出行人次为<input class="createReport ant-input" style="width: 150px" dataType="formula" placeholder="商业工作人员日出行量" name="yearNum">
    </p>

    <div class="imgContainer">
      <div style="display: flex;">
      <div class="imgInfo">
      <img src="/error.png" style="width: 200px; height: 200px;">
    <div>1-1 项目范围</div>
    </div>
    <div class="uplodContain">
      <span class="">
        <div class="ant-upload ant-upload-select ant-upload-select-text">
        <span tabindex="0" class="ant-upload" role="button">
          <input type="file" accept="png,jpg,bmp" style="display: none;">
          <button type="button" class="ant-btn uploadBtn"><span role="img" aria-label="upload" class="anticon anticon-upload">
          <svg viewBox="64 64 896 896" focusable="false" data-icon="upload" width="1em" height="1em" fill="currentColor" aria-hidden="true">
            <path d="M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 00-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z">
            </path>
          </svg>
        </span>
        <span>上传文件</span>
        </button>
        </span>
    </div>
    </span>
    <div class="extName">支持扩展名: png,jpg,bmp</div></div></div></div>
  `);
  };
  const hanldeOnExport = () => {
    setDispaly(false);
    setTimeout(() => {
      let html = editor.txt.html();
      console.log(html);
      exportWord({
        mhtml: html, //将转化好的内容放到mhtml这个参数中
        data: { title: 'exportword' },
        filename: 'exportTest',
        // style: 'span{ font-size:20px; }',
      });
    }, 300);
  };
  const handleOnUpload = () => {};
  return (
    <PageContainer className={styles.main} title={false} pageHeaderRender={false}>
      <div className={styles.editor}>
        <Button type="primary">预览</Button>
        <Button type="primary" onClick={hanldeOnAdd}>
          添加
        </Button>
        <Button type="primary" onClick={hanldeOnExport}>
          导出
        </Button>
        <Button
          type="primary"
          onClick={() => {
            console.log(inputValue);
          }}
        >
          测试
        </Button>
        <div id="editorContainer">
          {/* <span> */}
          {/* <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            /> */}
          {/* <span>
              <text>测试的,</text>
              <span>
                {dispaly && <input />}
                {!dispaly && <span>{reportData.name}</span>}
              </span>
            </span> */}
          {/* </span> */}
          {/* <br />
          <span>
            <img src="http://localhost:8000/1.jpg" alt="" width="50%" height="50%" />
          </span> */}
          {/* <Table dataSource={dataSource} columns={columns} pagination={false} /> */}
        </div>
      </div>
    </PageContainer>
  );
};
