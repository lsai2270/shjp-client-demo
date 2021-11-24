// import request from '@/utils/request';
import axios from 'axios';

// 合围范围
export async function getMapSurround(data: any): Promise<any> {
  return axios.post(`http://dev-traffic-base.citybit.cn/api/v2/base/surround`, data);
}
// 合围范围
export async function getRoads(data: any): Promise<any> {
  return axios.get(`http://dev-traffic-base.citybit.cn/api/v2/road`, { params: data });
}
// 合围范围
export async function getAllRoads(data?: any): Promise<any> {
  return axios.get(`http://dev-traffic-base.citybit.cn/api/v2/road/all`, { params: data });
}
export async function getLinkSaturation(data?: any): Promise<any> {
  return axios.post(`http://dev-traffic-base.citybit.cn/api/v2/amap/link/saturation`, data);
}
export async function getLinkRids(id?: any): Promise<any> {
  return axios.get(`http://dev-traffic-base.citybit.cn/api/v2/amap/link/${id}`);
}
