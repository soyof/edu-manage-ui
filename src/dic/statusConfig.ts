/**
 * 状态定义类型接口
 */
interface StatusItem {
  dictId: string
  dictValue: string
}

/**
 * 状态标签配置接口
 */
interface StatusTagInfo {
  type: string
  label: string
}

/**
 * 状态配置接口
 */
interface StatusConfig {
  list: StatusItem[]
  tags: Record<string, StatusTagInfo>
  getTagType: (status: string) => string
  getName: (status: string) => string
}

/**
 * 公共状态枚举值
 */
export enum StatusEnum {
  PENDING = '0', // 待发布/未发布
  ACTIVE = '1', // 已发布/生效中
  ARCHIVED = '2' // 已存档/已下线
}

/**
 * 创建状态配置的工厂函数
 * @param pendingLabel 待发布状态的标签文本
 * @param activeLabel 活动状态的标签文本
 * @param archivedLabel 存档状态的标签文本
 * @returns 状态配置对象
 */
export const createStatusConfig = (
  pendingLabel: string = '待发布',
  activeLabel: string = '已发布',
  archivedLabel: string = '已存档'
): StatusConfig => {
  const list = [
    { dictId: StatusEnum.PENDING, dictValue: pendingLabel },
    { dictId: StatusEnum.ACTIVE, dictValue: activeLabel },
    { dictId: StatusEnum.ARCHIVED, dictValue: archivedLabel }
  ]

  const tags: Record<string, StatusTagInfo> = {
    [StatusEnum.PENDING]: {
      type: 'info',
      label: pendingLabel
    },
    [StatusEnum.ACTIVE]: {
      type: 'success',
      label: activeLabel
    },
    [StatusEnum.ARCHIVED]: {
      type: 'warning',
      label: archivedLabel
    }
  }

  return {
    // 列表形式，用于下拉选择
    list,
    // 对象形式，用于标签显示
    tags,
    // 获取状态标签类型
    getTagType: (status: string): string => {
      return tags[status]?.type || ''
    },
    // 获取状态名称
    getName: (status: string): string => {
      const option = list.find(item => item.dictId === status)
      return option ? option.dictValue : status
    }
  }
}

/**
 * 通知状态定义
 */
export const NoticeStatus = createStatusConfig('待发布', '已发布', '已下线')

/**
 * 招聘信息状态定义
 */
export const RecruitStatus = createStatusConfig('待发布', '生效中', '已存档')

/**
 * 简介状态定义
 */
export const ProfileStatus = createStatusConfig('待发布', '生效中', '已存档')

/**
 * 动态信息状态定义
 */
export const DynamicStatus = createStatusConfig('待发布', '已发布', '已存档')

/**
 * 论文管理状态定义
 */
export const PaperStatus = createStatusConfig('待发布', '已发布', '已存档')

/**
 * 专利管理状态定义
 */
export const PatentStatus = createStatusConfig('待发布', '已发布', '已存档')
