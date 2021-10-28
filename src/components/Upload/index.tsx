import React, { useState, useEffect } from 'react';
import { Upload, message, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface UploadProps {
  name: string;
  accept: string;
  // setUploads: any;
  handleOnUpload: Function;
  uploads: Array<any>;
  url?: string;
}

function UploadComp(props: UploadProps) {
  const { name, accept, url, handleOnUpload, uploads } = props;
  const [token, setToken] = useState<any>('');
  useEffect(() => {
    // const tokenArr = document.cookie.split('=');
    const newToken = localStorage.getItem('Authorization');
    setToken(newToken);
  }, []);
  const handleOnChange = (info: any) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    console.log(fileList);
    if (fileList.length > 0) {
      if (fileList[0].status === 'done') {
        message.success('上传成功!');
      }
      if (fileList[0].status === 'error') {
        message.error('上传失败!');
        return;
      }
    }
    handleOnUpload(fileList);
  };
  return (
    <Upload
      name="file"
      headers={{ Authorization: token }}
      action={url}
      accept={accept}
      fileList={uploads}
      onChange={handleOnChange}
    >
      <Button icon={<UploadOutlined />}>{name}</Button>
    </Upload>
  );
}
export default UploadComp;
