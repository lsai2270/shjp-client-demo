import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { history } from 'umi';
import { Image, Upload, message, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import lodash from 'lodash';
export default (props: any) => {
  const { id: templateId, type } = history?.location?.query;
  const { wraptype, imgData, id, handlensetimage } = props;
  const [imgSrc, setImgSrc] = useState([]);
  const [token, setToken] = useState<any>('');
  const [fileList, setFileList] = useState([]);
  useEffect(() => {
    // console.log('--->wraptype', wraptype);
    // const tokenArr = document.cookie.split('=');
    const newToken = localStorage.getItem('Authorization');
    setToken(newToken);
  }, []);
  useEffect(() => {
    // console.log(imgData[id]);
    if (type == '1') {
      let newImgData = lodash.get(imgData[id], `draftValue[${templateId}]`) || [];
      // console.log('newImgData--->',newImgData);
      setImgSrc(newImgData);
    } else {
      let newImgData = lodash.get(imgData[id], 'value') || [];
      setImgSrc(newImgData);
    }
  }, [imgData]);
  const handleOnChange = (info: any) => {
    setFileList(info.fileList);
    let i = 0;
    const imgData = info.fileList.map((item: any) => {
      if (item.status === 'done') {
        i++;
      }
      return item?.response?.data;
    });
    if (info.file.status === 'error') {
      message.error('上传失败!');
    }
    if (i == info.fileList.length) {
      handlensetimage(id, imgData);
      setFileList([]);
      message.success('上传成功!');
    }
  };

  // const debounce =(func:any, time = 300) =>{
  //   let timerId:any;
  //   // eslint-disable-next-line func-names
  //   return function() {
  //     const context = this;
  //     clearTimeout(timerId);
  //     // eslint-disable-next-line prefer-rest-params
  //     const lastArguments = arguments;
  //     timerId = setTimeout(() => {
  //       func.apply(context, lastArguments);
  //     }, time);
  //     return false;
  //   };
  // }
  // let timerId = 0;
  // const handleOnBeforeUpload: any = (file: any, fileList: any[]) => {
  //   // console.log('file----->', file);
  //   // console.log('fileList----->', fileList);
  //   if (fileList.length > 1) {
  //     timerId++;
  //     // console.log("timerId",timerId);
  //     if (timerId == fileList.length) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return true;
  //   }
  // };
  return (
    <div className={`imgContainer ${id} add ${wraptype == 'undefined' ? 'vertical' : wraptype}`}>
      {wraptype && wraptype == 'horizontal' && (
        <div className="imgCompFlex">
          <div>
            <ul>
              {imgSrc && imgSrc.length == 0 && (
                <li>
                  <Image
                    id={id}
                    preview={false}
                    width={200}
                    height={200}
                    src="/error.png"
                    fallback="/error.png"
                  />
                </li>
              )}
              {imgSrc &&
                imgSrc.length > 0 &&
                imgSrc.map((item: any, index: number) => {
                  return (
                    <li key={index}>
                      <img
                        id={id}
                        src={`${REACT_APP_ENV && REACT_APP_ENV != 'dev' ? SHJPSERVER : ''}${
                          item.path
                        }`}
                        style={{ width: '65%' }}
                      />
                    </li>
                  );
                })}
            </ul>
            <br></br>
            <div style={{ textAlign: 'center' }}>
              <b>{lodash.get(imgData[id], 'name')}</b>
            </div>
          </div>
          <div className="uplodContain">
            <Upload
              name="file"
              action="/api/v1/file/upload"
              accept="image/png,image/jpeg,image/bmp"
              fileList={fileList}
              // beforeUpload={handleOnBeforeUpload}
              headers={{ Authorization: token }}
              showUploadList={false}
              multiple
              maxCount={6}
              onChange={handleOnChange}
            >
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
            <div className="extName">支持扩展名: png,jpg,bmp</div>
          </div>
        </div>
      )}
      {((wraptype && wraptype == 'vertical') || !wraptype || wraptype == 'undefined') && (
        <div className="imgCompFlex">
          <div className="imgInfo">
            {imgSrc && imgSrc.length == 0 && (
              <Image
                id={id}
                preview={false}
                width={200}
                height={200}
                src="/error.png"
                fallback="/error.png"
              />
            )}
            {imgSrc &&
              imgSrc.length > 0 &&
              imgSrc.map((item: any, index: number) => {
                return (
                  <div key={index}>
                    <img
                      id={id}
                      src={`${REACT_APP_ENV && REACT_APP_ENV != 'dev' ? SHJPSERVER : ''}${
                        item.path
                      }`}
                      style={{ width: '65%' }}
                    />
                  </div>
                );
              })}
            <br></br>
            <div style={{ textAlign: 'center' }}>
              <b>{lodash.get(imgData[id], 'name')}</b>
            </div>
          </div>
          <div className="uplodContain">
            <Upload
              name="file"
              action="/api/v1/file/upload"
              accept="image/png,image/jpeg,image/bmp"
              fileList={fileList}
              // beforeUpload={handleOnBeforeUpload}
              headers={{ Authorization: token }}
              showUploadList={false}
              multiple
              maxCount={6}
              onChange={handleOnChange}
            >
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
            <div className="extName">支持扩展名: png,jpg,bmp</div>
          </div>
        </div>
      )}
    </div>
  );
};
