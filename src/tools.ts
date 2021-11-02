import { Children } from 'react';
// import math from 'mathjs';

import { create, all } from 'mathjs';
import $ from 'jquery';
import _ from 'lodash';

const config = {};
const math = create(all, config);

function tree(data: any, root: string) {
  return data
    .filter((item: any) => item.parentId === root)
    .map((item: any) => ({
      ...item,
      children: tree(data, item._id),
    }));
}
function getTreeData(data: any, root: string, type?: string) {
  //type==typeCode返回typeCode字段,allData返回所有数据字段
  let arr: any[] = [];
  let keyArr: any[] = [];
  let filterArr = data.filter((item: any) => {
    if (item.parentId === root) {
      keyArr.push(item._id);
      if (type == 'typeCode') {
        arr.push({
          title: item.name,
          key: item._id,
          typeCode: item.typeCode,
        });
      } else if (type == 'allData') {
        arr.push({
          ...item,
          // // value: `${item._id}_${item.code}`,
          // value: item.value,
          defaultValue: item.value,
          value: `${item._id}`,
          title: item.name,
        });
      } else {
        arr.push({
          title: item.name,
          key: item._id,
        });
      }
    }
    return item.parentId !== root;
  });
  for (let i = 0; i < filterArr.length; i++) {
    const element = filterArr[i];
    if (keyArr.includes(element.parentId)) {
      let index = keyArr.indexOf(element.parentId);
      if (type == 'typeCode') {
        arr.splice(index, 1, {
          ...arr[index],
          children: getTreeData(filterArr, element.parentId, 'typeCode'),
        });
      } else if (type == 'allData') {
        arr.splice(index, 1, {
          ...arr[index],
          children: getTreeData(filterArr, element.parentId, 'allData'),
        });
      } else {
        arr.splice(index, 1, {
          ...arr[index],
          children: getTreeData(filterArr, element.parentId),
        });
      }
    }
  }
  return arr;
}

function changeTreeDataToObj(treeData: any[], parent: string) {
  let objArr = [];
  for (let i = 0; i < treeData.length; i++) {
    const element = treeData[i];
    if (Boolean(parent)) {
      objArr.push({
        parentId: parent,
        _id: element.key,
        name: element.title,
      });
    } else {
      objArr.push({
        parentId: '',
        _id: element.key,
        name: element.title,
      });
    }
    if (element.children) {
      let childrenObj: any = changeTreeDataToObj(element.children, element.key);
      objArr.push(...childrenObj);
    }
  }
  return objArr;
}
function getTreeDataContent(treeData: any[]) {
  let content = ``;
  for (let i = 0; i < treeData.length; i++) {
    const element = treeData[i];
    content += element.content;
    if (element.children) {
      let childrenObj: any = getTreeDataContent(element.children);
      content += childrenObj;
    }
  }
  return content;
}
// export default {
function queryBuilder() {
  console.log('queryBuilder', 'queryBuilder');
}

/**
 *  生成矩阵
 * @param n 矩阵
 * @param p Production
 * @param a Atrraction
 */
// function generateMatrix(p: number[], a: number[]) {
//   // const n = 2;
//   console.log('p', p);

//   if (p.length != a.length) {
//     // throw new SystemError(2000);
//     throw new Error();
//   }
//   const n = p.length;
//   const m = math.zeros(n, n);

//   const total = a.reduce((total, currentValue, currentIndex, arr) => {
//     return total + currentValue;
//   }, 0);

//   m.forEach((value: any, index: any, matrix: any) => {
//     // console.log('value:', value, 'index:', index)

//     if (index[0] !== index[1]) {
//       const v = ((p[index[0]] * a[index[1]]) / (total - a[index[0]])).toFixed(2);
//       // console.log('v', v)
//       m.subset(math.index(index[0], index[1]), parseFloat(v));
//     }
//   });

//   return m;
// }

/**
 * 生成转向数据
 *
 */
function generateTurns(data: any) {
  const { nodes, links } = data;

  const set = new Set();
  _.forEach(nodes, (nvalue) => {
    _.forEach(links, (lvalue) => {
      _.forEach(lvalue.nodes, (v, i) => {
        if (_.eq(nvalue.bId, v.bId)) {
          const linkId = lvalue.bId;
          const bId = lvalue.nodes[1 - Number(i)].bId;
          const num = lvalue.nodes[1 - Number(i)].num;
          // 第一类
          set.add({
            fromNodeNum: nvalue.num,
            viaNodeNum: num,
            toNodeNum: nvalue.num,
          });

          //  第二类
          _.forEach(links, (llvalue) => {
            _.forEach(llvalue.nodes, (vv, ii) => {
              if (_.eq(bId, vv.bId)) {
                if (linkId !== llvalue.bId) {
                  set.add({
                    fromNodeNum: nvalue.num,
                    viaNodeNum: num,
                    toNodeNum: llvalue.nodes[1 - Number(ii)].num,
                  });
                }
              }
            });
          });
        }
      });
    });
  });

  return Array.from(set);
}

/**
 * generateDMDMatrix
 * @param arr  [1,2,3,4]
 *
 */
function generateDMDMatrix(arr: Number[]) {
  const set = new Set();
  _.forEach(arr, (item) => {
    _.forEach(arr, (element) => {
      if (item !== element) {
        set.add({
          matrixNum: 1,
          fromNum: item,
          toNum: element,
          value: 100,
        });
      }
    });
  });

  // console.log('generateDMDMatrix', set);

  return Array.from(set);
}
/**
 *
 * @param p  现状p
 * @param a  现状a
 * @param zoneP 近期 远期 地块 p
 * @param zoneA 近期 远期 地块 a
 * @param rate  增长率 0.1
 * @param pow  次方
 * @param baseP  评估年基地高峰小时交通产生量（
 * @param baseA  评估年基地高峰小时交通吸引量
 *
 */

// function generateFutureMatrix(
//   p: number[],
//   a: number[],
//   zoneP: number[],
//   zoneA: number[],
//   rate: number,
//   pow: number,
//   baseP: number,
//   baseA: number,
// ) {
//   // 背景OD矩阵
//   // 现状 * 增长率
//   const pr = p.map((item) => {
//     // console.log('item', item)
//     // console.log('math.pow((1 + rate), pow)', math.pow((1 + rate), pow))
//     return item * math.pow(1 + rate, pow);
//   });

//   // console.log('pr', pr)
//   const ar = a.map((item) => {
//     return item * math.pow(1 + rate, pow);
//   });
//   // console.log('ar', ar)

//   const pz = _.concat(pr, zoneP);
//   console.log('pz', pz);
//   const az = _.concat(ar, zoneA);
//   console.log('az', az);

//   const background = generateMatrix(pz, az);

//   console.log('background', background.toString());

//   // 叠加OD矩阵：

//   const np = _.concat(pz, baseP);
//   // console.log('np', np);
//   const na = _.concat(az, baseA);
//   // console.log('na', na);

//   const superposition = generateMatrix(np, na);
//   console.log('superposition', superposition.toString());

//   return {
//     background,
//     superposition,
//   };
// }
function calculateTotal(
  OD: number[][],
  p: number[], // 新拼接的p
) {
  const totalA = _.reduce(
    p,
    (sum, n) => {
      return sum + n;
    },
    0,
  );
  const totalP = OD.reduce(function (total, value, index, arr) {
    return [total[0] + value[0]];
  });

  return {
    totalA,
    totalP: totalP[0],
  };
}
function generateMatrix(
  OD: any[],
  a: number[],
  p: number[],
  rate: number,
  pow: number,
  total: any,
) {
  const olength = OD[0].length;
  const n = olength + p.length;
  const m = math.zeros(n, n);
  for (let i = 1; i < OD.length; i++) {
    const element = OD[i];
    for (let j = 1; j < element.length; j++) {
      const jitem = element[j];
      m.subset(math.index(i, j), Math.ceil(jitem * math.pow(rate, pow)));
      for (let l = 0; l < a.length; l++) {
        const litem = a[l];
        if (math.subset(m, math.index(i, l + olength))) continue;
        m.subset(math.index(i, l + olength), Math.ceil(litem * (element[0] / total.totalP)));
      }
      for (let k = 0; k < p.length; k++) {
        const kitem = p[k];
        if (math.subset(m, math.index(olength + k, j))) continue;
        // m.subset(math.index(olength + k, j), Math.ceil(kitem * (OD[0][j] / (total.totalA - a[k]))));
        m.subset(math.index(olength + k, j), Math.ceil(kitem * (OD[0][j] / total.totalA)));
      }
    }
  }

  return m;
}
function generateTotalOD(OD: any[][]) {
  const n = OD[0].length + 1;
  const m = math.zeros(n, n);
  m.forEach((value: any, index: number) => {
    // console.log('value:', value, 'index:', index);
    // console.log('OD', OD[0][0]);
    if (index[0] < n - 1 && index[1] < n - 1) {
      // console.log('OD', OD[index[0]][index[1]]);
      m.subset(math.index(index[0] + 1, index[1] + 1), OD[index[0]][index[1]]);
    }
    // 0 , 1
    if (index[0] === 0) {
      if (index[1] > 0) {
        let totalA = 0;
        for (let i = 0; i < OD.length; i++) {
          const row = OD[i];
          totalA += row[index[1] - 1];
        }
        m.subset(math.index(index[0], index[1]), totalA);
      }
    }
    // 1 0
    if (index[1] === 0) {
      if (index[0] > 0) {
        let totalP = 0;
        for (let j = 0; j < OD[index[0] - 1].length; j++) {
          const column = OD[index[0] - 1][j];
          totalP += column;
        }
        m.subset(math.index(index[0], index[1]), totalP);
      }
    }
  });
  return m._data;
}
// 未来od矩阵
function generateFutureMatrix(
  OD: number[][],
  zoneA: number[],
  zoneP: number[],
  rate: number,
  pow: number,
  baseA: number[],
  baseP: number[],
) {
  const totalOD = generateTotalOD(OD);
  //  const background = new Array();
  const backgroungAArr = _.concat(totalOD[0], zoneA);
  const backgroungTotal = calculateTotal(totalOD, backgroungAArr);

  // console.log("backgroungTotal", backgroungTotal);
  const background = generateMatrix(totalOD, zoneA, zoneP, rate, pow, backgroungTotal);

  const superpositionAArr = _.concat(totalOD[0], zoneA, baseA);
  const superpositionTotal = calculateTotal(totalOD, superpositionAArr);
  const superposition = generateMatrix(
    totalOD,
    _.concat(zoneA, baseA),
    _.concat(zoneP, baseP),
    rate,
    pow,
    superpositionTotal,
  );

  // 去掉第一行第列
  const backgroundResult = [];
  for (let index = 1; index < background._data.length; index++) {
    const element = background._data[index];

    const tem = [];
    for (let j = 1; j < element.length; j++) {
      // const data = element[j];
      tem.push(element[j]);
    }
    backgroundResult.push(tem);
  }

  const superpositionResult = [];
  for (let index = 1; index < superposition._data.length; index++) {
    const element = superposition._data[index];
    const tem = [];
    for (let j = 1; j < element.length; j++) {
      // const data = element[j];
      tem.push(element[j]);
    }
    superpositionResult.push(tem);
  }
  // console.log('backgroundResult', backgroundResult);
  // console.log('superpositionResult', superpositionResult);
  return {
    backgroundResult,
    superpositionResult,
  };
}
/**
 * 生成 p a
 * @param m
 *
 */
function generagePA(m: number[][]) {
  // p:[每一行相加,,,]

  // a:【每一列相加 】
  const p: any[] = []; //产生量
  const a: any = []; //吸引量
  _.forEach(m, (item) => {
    a.push(
      _.reduce(
        item,
        function (sum, n) {
          return sum + n;
        },
        0,
      ),
    );
    // _.forEach(item, element => {
    // })
  });

  const length = m.length;
  // console.log('length',length)

  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (let j = 0; j < length; j++) {
      // const item = m[j];
      // console.log('m[j][i]',m[j][i])
      sum = sum + m[j][i];
    }
    // console.log('sum',sum)
    p.push(sum);
    // const element = m[i];

    // for (let j = 0; j < element.length; j++) {
    //  // const item = m[j];
    // }
  }

  return {
    p,
    a,
  };
}
// od矩阵转dmd
function changeOdToDmdMatrix(arr: any[], zoneNumArr: any[]) {
  let result: any[] = [];
  // console.log('zoneNumArr', zoneNumArr);
  // console.log('arr', arr);
  // console.log('---------------');
  zoneNumArr.forEach((num, index) => {
    zoneNumArr.forEach((num1, index1) => {
      result.push({
        matrixNum: 1,
        fromNum: num,
        toNum: num1,
        value: arr[index][index1],
      });
    });
  });
  return result;
}
// 获取通行能力
function getCapprt(num: any, obj: object) {
  if (num == 1) {
    return obj['expresswayCapacity'];
  } else if (num == 2) {
    return obj['quicklywayCapacity'];
  } else if (num == 3) {
    return obj['mainRoadCapacity'];
  } else if (num == 4) {
    return obj['subRoadCapacity'];
  } else if (num == 5) {
    return obj['accessRoadCapacity'];
  }
}
function setCookie(cname: string, cvalue: string, exdays: number) {
  var d: any = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toGMTString();
  document.cookie = cname + '=' + cvalue + '; ' + expires;
}
// 相位设置
function getComparisonIndex(num: number) {
  let arr = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (num > 10) {
    let a = Math.floor(num / 10);
    let b = num % 10;
    if (a == 1) {
      return `十` + arr[b - 1];
    }
    return arr[a - 1] + `十` + arr[b - 1];
  } else {
    return arr[num - 1];
  }
}
// link-node的方向
function getTwoPointDirection(A: any, B: any, type?: string) {
  var angle: any = Math.atan2(B.y - A.y, B.x - A.x); //弧度 -0.6435011087932844, 即 2*Math.PI - 0.6435011087932844
  var theta: any = angle * (180 / Math.PI);
  if (theta < 0) {
    theta = theta + 360;
  }
  // console.log('A', A);
  // console.log('B', B);
  // console.log('theta', theta);
  // console.log('------------------');

  if (type == 'entrance') {
    if ((315 <= theta && theta < 360) || (0 <= theta && theta < 45)) {
      return '东进口';
    }
    if (45 <= theta && theta < 135) {
      return '北进口';
    }
    if (135 <= theta && theta < 225) {
      return '西进口';
    }
    if (225 <= theta && theta < 315) {
      return '南进口';
    }
  }
  if (type == 'entranceObj') {
    if ((315 <= theta && theta < 360) || (0 <= theta && theta < 45)) {
      if (315 <= theta && theta < 360) {
        theta = theta - 360;
      }
      return { name: '东进口', theta, positionB: B };
    }
    if (45 <= theta && theta < 135) {
      return { name: '北进口', theta };
    }
    if (135 <= theta && theta < 225) {
      return { name: '西进口', theta };
    }
    if (225 <= theta && theta < 315) {
      return { name: '南进口', theta };
    }
  }
  if (type == 'degree') {
    return theta;
  }
  if (0 <= theta && theta < 22.5) {
    // console.log("方向","西-东");
    return {
      start: {
        label: '西',
        value: 'W',
      },
      end: {
        label: '东',
        value: 'E',
      },
    };
  }
  if (337.5 <= theta && theta <= 360) {
    // console.log("方向","西-东");
    return {
      start: {
        label: '西',
        value: 'W',
      },
      end: {
        label: '东',
        value: 'E',
      },
    };
  }
  if (22.5 <= theta && theta < 67.5) {
    // console.log("方向","西南-东北");
    return {
      start: {
        label: '西南',
        value: 'SW',
      },
      end: {
        label: '东北',
        value: 'NE',
      },
    };
  }
  if (67.5 <= theta && theta < 112.5) {
    // console.log("方向","南-北");
    return {
      start: {
        label: '南',
        value: 'S',
      },
      end: {
        label: '北',
        value: 'N',
      },
    };
  }
  if (112.5 <= theta && theta < 157.5) {
    // console.log("方向","东南-西北");
    return {
      start: {
        label: '东南',
        value: 'SE',
      },
      end: {
        label: '西北',
        value: 'NW',
      },
    };
  }
  if (157.5 <= theta && theta < 202.5) {
    // console.log("方向","东-西");
    return {
      start: {
        label: '东',
        value: 'E',
      },
      end: {
        label: '西',
        value: 'W',
      },
    };
  }
  if (202.5 <= theta && theta < 247.5) {
    // console.log("方向","东北-西南");
    return {
      start: {
        label: '东北',
        value: 'NE',
      },
      end: {
        label: '西南',
        value: 'SW',
      },
    };
  }
  if (247.5 <= theta && theta < 292.5) {
    // console.log("方向","北-南");
    return {
      start: {
        label: '北',
        value: 'N',
      },
      end: {
        label: '南',
        value: 'S',
      },
    };
  }
  if (292.5 <= theta && theta < 337.5) {
    // console.log("方向","西北-东南");
    return {
      start: {
        label: '西北',
        value: 'NW',
      },
      end: {
        label: '东南',
        value: 'SE',
      },
    };
  }
}
function getReverseDirection(direction: string) {
  if (direction == '东') {
    return {
      label: '西',
      value: 'W',
    };
  }
  if (direction == '东北') {
    return {
      label: '西南',
      value: 'SW',
    };
  }
  if (direction == '北') {
    return {
      label: '南',
      value: 'S',
    };
  }
  if (direction == '西北') {
    return {
      label: '东南',
      value: 'SE',
    };
  }
  if (direction == '西') {
    return {
      label: '东',
      value: 'E',
    };
  }
  if (direction == '西南') {
    return {
      label: '东北',
      value: 'NE',
    };
  }
  if (direction == '南') {
    return {
      label: '北',
      value: 'N',
    };
  }
  if (direction == '东南') {
    return {
      label: '西北',
      value: 'NW',
    };
  }
}
// 服务水平
function getServiceLevel(value: any) {
  if (0 <= value && value < 0.35) {
    return 'A';
  }
  if (0.35 <= value && value < 0.55) {
    return 'B';
  }
  if (0.55 <= value && value < 0.75) {
    return 'C';
  }
  if (0.75 <= value && value < 0.9) {
    return 'D';
  }
  if (0.9 <= value && value < 1) {
    return 'E';
  }
  if (1 <= value) {
    return 'F';
  }
}
// 处理html为自定义组件
const hanldeOnResolveHtml = (contentHtmlStr: string, type?: string) => {
  let astr = contentHtmlStr
    .replace(/data-inspector-line="(?:[^"\\]|\\.)*"/g, '')
    .replace(/data-inspector-column="(?:[^"\\]|\\.)*"/g, '')
    .replace(/data-inspector-relative-path="(?:[^"\\]|\\.)*"/g, '')
    .replace(/<!--(?:[^"\\]|\\.)*-->/g, '');
  // console.log(astr);
  let odiv = document.createElement('div');
  let astr1 = $(astr).get();
  astr1.forEach((ele: any) => {
    odiv.appendChild(ele);
  });
  astr1 = odiv;
  let deleteImgDomArr = astr1.querySelectorAll('.imgCompFlex');
  let deleteTableDomArr = astr1.querySelectorAll('.tableCompFlex');
  deleteImgDomArr.forEach((imgDom: any) => {
    imgDom.remove();
  });
  deleteTableDomArr.forEach((tableDom: any) => {
    tableDom.remove();
  });
  let imgContainerArr = astr1.querySelectorAll('.imgContainer');
  imgContainerArr.forEach((ele: any) => {
    let className = ele.className.split(' ');
    if (className[2] == 'add' && !type) {
      $(ele).replaceWith(
        `<AddImage  id=${className[1]} wraptype=${className[3]} imgData={paramInfo} handlensetimage={handleOnSetImage} ></AddImage>`,
      );
    } else {
      $(ele).replaceWith(
        `<ShowImage   id=${className[1]} wraptype=${className[3]}  imgData={paramInfo} handlensetimage={handleOnSetImage}></ShowImage>`,
      );
    }
  });
  let tableContainerArr = astr1.querySelectorAll('.tableContainer');
  tableContainerArr.forEach((ele: any) => {
    let className = ele.className.split(' ');
    $(ele).replaceWith(`<AddTable  id=${className[1]} tableInfo={tableInfo} ></AddTable>`);
  });
  let inputArr = astr1.querySelectorAll('.ant-input');
  inputArr.forEach((ele: any) => {
    let name = ele.name;
    // console.log('name', name);
    let placeholder = ele.placeholder;
    let styleWidth = ele.style.width;
    let value = ele.value;
    if (type == 'report') {
      $(ele).replaceWith(`<span>${value}</span>`);
    } else {
      $(ele).replaceWith(
        `<InputComp placeholder=${placeholder}  name=${name} contentsdata={contentsdata} style='width: ${styleWidth}' handleonsetinput={handleonsetinput} />`,
      );
    }
  });
  // 下拉框
  let selectArr = astr1.querySelectorAll('select');
  selectArr.forEach((ele: any) => {
    // console.log(ele.attributes);
    let name = ele.name;
    // console.log('name', name);
    let placeholder = ele.attributes['placeholder'].value;
    let styleWidth = ele.style.width;
    let value = ele.value;
    if (type == 'report') {
      $(ele).replaceWith(`<span>${value}</span>`);
    } else {
      $(ele).replaceWith(
        `<SelectComp placeholder=${placeholder}  name=${name}   style='width: ${styleWidth}' contentsdata={contentsdata} handleonselect={handleonselect} />`,
      );
    }
  });
  // 循环文本
  let evalTextArr = astr1.querySelectorAll('.evalTextContainer');
  evalTextArr.forEach((ele: any) => {
    let className = ele.className.split(' ');
    $(ele).replaceWith(
      `<EvalTextComp  name=${className[1]} projectid={projectid} cycleTextInfo={cycleTextInfo} contentsdata={contentsdata} handleonselect={handleonselect} handleonsetinput={handleonsetinput}></EvalTextComp>`,
    );
  });
  //  console.log(astr1);
  let htmlStr = $(astr1).html();
  let selectStr = htmlStr
    .replace(/selectcomp/g, 'SelectComp')
    .replace(/contentsdata="(?:[^"\\]|\\.)*"/g, 'contentsdata={contentsdata}')
    .replace(/handleonselect="(?:[^"\\]|\\.)*"/g, 'handleonselect={handleonselect}');
  let imgStr = selectStr
    .replace(/addimage/g, 'AddImage')
    .replace(/showimage/g, 'ShowImage')
    .replace(/imgdata="(?:[^"\\]|\\.)*"/g, 'imgData={paramInfo}')
    .replace(/handlensetimage="(?:[^"\\]|\\.)*"/g, 'handlensetimage={handleOnSetImage}');
  let tableStr = imgStr
    .replace(/addtable/g, 'AddTable')
    .replace(/tableinfo="(?:[^"\\]|\\.)*"/g, 'tableInfo={tableInfo}');
  let evalTextStr = tableStr
    .replace(/evaltextcomp/g, 'EvalTextComp')
    .replace(/contentsdata="(?:[^"\\]|\\.)*"/g, 'contentsdata={contentsdata}')
    .replace(/projectid="(?:[^"\\]|\\.)*"/g, 'projectid={projectid}')
    .replace(/handleonsetinput="(?:[^"\\]|\\.)*"/g, 'handleonsetinput={handleonsetinput}')
    .replace(/handleonselect="(?:[^"\\]|\\.)*"/g, 'handleonselect={handleonselect}')
    .replace(/cycletextinfo="(?:[^"\\]|\\.)*"/g, 'cycleTextInfo={cycleTextInfo}');
  let inputStr = evalTextStr
    .replace(/inputcomp/g, 'InputComp')
    .replace(/contentsdata="(?:[^"\\]|\\.)*"/g, 'contentsdata={contentsdata}')
    .replace(/handleonsetinput="(?:[^"\\]|\\.)*"/g, 'handleonsetinput={handleonsetinput}');
  // if (inputStr.includes('<p><br></p>')) {
  // } else {
  //   inputStr += `<p><br></p>`;
  // }
  // console.log(inputStr);
  return inputStr;
};
// 获取所有树形结构的key
function getAllChildrenKeys(node: any) {
  let keys = [];
  keys.push(node.key);
  if (node.children.length > 0) {
    node.children.forEach((item: any) => {
      let childrenKeys = getAllChildrenKeys(item);
      keys.push(...childrenKeys);
    });
  }
  return keys;
}
// 路段通行能力修正系数
function getRoadCapRatio(num: any) {
  let ratio = 1;
  if (num == '1') {
    ratio = 1;
  }
  if (num == '2') {
    ratio = 1.85;
  }
  if (num == '3') {
    ratio = 2.6;
  }
  if (num == '4') {
    ratio = 3.2;
  }
  if (num >= '5') {
    ratio = 3.7;
  }
  return ratio;
}
export {
  tree,
  getTreeData,
  generateMatrix,
  generateTurns,
  generateDMDMatrix,
  generateFutureMatrix,
  generagePA,
  changeOdToDmdMatrix,
  getCapprt,
  changeTreeDataToObj,
  setCookie,
  getComparisonIndex,
  getTwoPointDirection,
  getServiceLevel,
  getTreeDataContent,
  hanldeOnResolveHtml,
  getAllChildrenKeys,
  getRoadCapRatio,
  getReverseDirection,
};
