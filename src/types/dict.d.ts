/**
 * 字典数据类型定义
 */

/**
 * 字典项接口
 */
export interface DictItem {
  dictId: string; // 字典ID
  dictType: string; // 字典类型编码
  dictTypeName: string; // 字典类型名称
  dictCode: string; // 字典编码
  dictValue: string; // 字典值(中文)
  dictValueEn?: string; // 字典值(英文)
  sortOrder?: number; // 排序字段
  remark?: string; // 备注
  status: string; // 状态(1:启用,0:禁用)
  createUserId?: string; // 创建人(用户编号)
  updateUserId?: string; // 更新人(用户编号)
  createUserName?: string; // 创建人姓名
  updateUserName?: string; // 更新人姓名
  createdTimes?: string; // 创建时间
  updatedTimes?: string; // 更新时间
}

/**
 * 字典查询参数
 */
export interface DictQueryParams {
  pageNum: number;
  pageSize: number;
  dictType?: string;
  dictTypeName?: string;
  dictCode?: string;
  dictValue?: string;
  status?: string;
  createdTimesRange?: string[];
}

/**
 * 字典分页结果
 */
export interface DictPageResult {
  total: number;
  list: DictItem[];
  pageNum: number;
  pageSize: number;
  pages: number;
}
