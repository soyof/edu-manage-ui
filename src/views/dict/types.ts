// 字典API所需字段接口
export interface DictApiFields {
  dictId?: string; // 字典ID，如果提供则为更新
  dictType: string; // 字典类型编码
  dictTypeName: string; // 字典类型名称
  dictValue: string; // 字典值(中文)
  dictValueEn?: string; // 字典值(英文)
  sortOrder?: number; // 排序
  remark?: string; // 备注
  status?: number; // 状态(1:启用,0:禁用)，默认为1
}

// 字典类型接口定义
export interface DictType {
  id: string;
  dictId: string;
  dictType: string;
  dictTypeName: string;
  dictValue: string;
  dictValueEn?: string;
  sortOrder: number;
  status: number;
  isType: boolean;
  createUserId?: string;
  createdTimes?: string;
  updateUserId?: string;
  updatedTimes?: string;
  [key: string]: any;
}

// 字典项接口定义
export interface DictCode {
  id: string;
  dictId: string;
  dictType: string;
  dictTypeName: string;
  dictValue: string;
  dictValueEn?: string;
  sortOrder: number;
  remark?: string;
  status: number;
  createUserId?: string;
  createdTimes?: string;
  updateUserId?: string;
  updatedTimes?: string;
  isType?: boolean;
  [key: string]: any;
}

// 树形字典数据接口定义
export interface TreeDictItem {
  id: string;
  dictId: string;
  dictType: string;
  dictTypeName: string;
  dictValue?: string;
  dictValueEn?: string;
  sortOrder: number;
  remark?: string;
  status: number;
  createUserId?: string;
  createdTimes?: string;
  updateUserId?: string;
  updatedTimes?: string;
  isType?: boolean;
  children?: TreeDictItem[];
  [key: string]: any;
}
