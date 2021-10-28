import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { history } from 'umi';
import { Image, Upload, message, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import lodash from 'lodash';
export default (props: any) => {
  const { id: templateId, type } = history?.location?.query;
  const { wraptype, imgData, id, handlensetimage } = props;
  const [imgSrc, setImgSrc] = useState<any[]>([]);

  useEffect(() => {
    // console.log("imgData[id]",imgData[id]);
    if (type == '1') {
      let imgs: any = lodash.get(imgData[id], `draftValue[${templateId}]`);
      if (Array.isArray(imgs)) {
        setImgSrc(imgs);
      } else {
        if (imgs == '') {
          setImgSrc([]);
        } else {
          setImgSrc([{ path: imgs }]);
        }
      }
    } else {
      let imgs: any = lodash.get(imgData[id], 'value');
      if (Array.isArray(imgs)) {
        setImgSrc(imgs);
      } else {
        if (imgs == '') {
          setImgSrc([]);
        } else {
          setImgSrc([{ path: imgs }]);
        }
      }
    }
  }, [imgData]);
  return (
    <div className={`imgContainer ${id} show ${wraptype == 'undefined' ? 'vertical' : wraptype}`}>
      {wraptype && wraptype == 'horizontal' && (
        <div className="imgCompFlex">
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
                      src={`${
                        REACT_APP_ENV && REACT_APP_ENV != 'dev'
                          ? SHJPSERVER
                          : 'http://192.168.0.2:7001'
                      }${item.path}`}
                      width={540}
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
      )}
      {((wraptype && wraptype == 'vertical') || !wraptype || wraptype == 'undefined') && (
        <>
          {imgSrc && imgSrc.length == 0 && (
            <div style={{ display: 'flex' }} className="imgCompFlex">
              <div className="imgInfo">
                <Image
                  id={id}
                  preview={false}
                  width={200}
                  height={200}
                  src="/error.png"
                  fallback="/error.png"
                />
              </div>
            </div>
          )}
          {imgSrc.map((item: any, index: number) => {
            return (
              <div key={index} style={{ display: 'flex' }} className="imgCompFlex">
                <div className="imgInfo">
                  <img
                    id={id}
                    src={`${
                      REACT_APP_ENV && REACT_APP_ENV != 'dev'
                        ? SHJPSERVER
                        : 'http://192.168.0.2:7001'
                    }${item.path}`}
                    width={540}
                    style={{ width: '65%' }}
                  />
                  {/* <Image
                    preview={false}
                    id={id}
                    width={'50%'}
                    height={'50%'}
                    src={`${
                      REACT_APP_ENV && REACT_APP_ENV != 'dev'
                        ? SHJPSERVER
                        : 'http://192.168.0.2:7001'
                    }${item.path}`}
                    fallback="/error.png"
                  /> */}
                </div>
              </div>
            );
          })}
          <br></br>
          <div style={{ textAlign: 'center' }}>
            <b>{lodash.get(imgData[id], 'name')}</b>
          </div>
        </>
      )}
    </div>
  );
};
