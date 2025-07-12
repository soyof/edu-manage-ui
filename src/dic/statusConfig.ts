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
const createStatusConfig = (
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
 * 招聘类型定义
 */
export enum RecruitTypeEnum {
  STUDENT = 'student_recruitment',
  STAFF = 'staff_recruitment',
  CONTACT = 'contact_us'
}

/**
 * 招聘类型配置
 */
export const RecruitType = {
  // 列表形式，用于下拉选择
  list: [
    { value: RecruitTypeEnum.STUDENT, label: '博士后及研究生招生' },
    { value: RecruitTypeEnum.STAFF, label: '工作人员' },
    { value: RecruitTypeEnum.CONTACT, label: '联系我们' }
  ],

  // 获取招聘类型标签样式
  getTagType: (type: string): string => {
    switch (type) {
      case RecruitTypeEnum.STUDENT:
        return 'primary'
      case RecruitTypeEnum.STAFF:
        return 'success'
      case RecruitTypeEnum.CONTACT:
        return 'info'
      default:
        return ''
    }
  },

  // 获取招聘类型名称
  getName: (type: string): string => {
    const option = RecruitType.list.find(item => item.value === type)
    return option ? option.label : type
  }
}

// 兼容旧版本的导出，避免代码修改过多
export const noticeStatusList = NoticeStatus.list
export const noticeStatusInfos = NoticeStatus.tags
export const recruitStatusList = RecruitStatus.list
export const recruitStatusInfos = RecruitStatus.tags
export const recruitmentTypeOptions = RecruitType.list
export const getRecruitmentTypeTag = RecruitType.getTagType
export const getRecruitmentTypeName = RecruitType.getName
