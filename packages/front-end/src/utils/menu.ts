/*
 * @Author: Kanata You 
 * @Date: 2022-06-19 15:45:10 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-06-21 04:20:45
 */

/** 菜品可选设置 */
export interface PlatePreference {
  /** 选项描述文字 */
  labels: string[];
  /** 推荐选择的选项的下标 */
  supposedIdx?: number;
}

/** 一项菜品 */
export interface Plate {
  /** 菜品名称 */
  name: string;
  /** （可选）菜品描述 */
  describe?: string;
  /** 菜品价格，使用整型表示（单位为“分”） */
  price: number;
  /** （可选）菜品图片 data URL */
  pic?: string;
  /** （可选）菜品定制选项 */
  preference?: PlatePreference;
  /** （可选）推荐搭配菜品 */
  recommendations?: Plate[];
}

/** 一类菜品 */
export interface PlateGroup {
  /** 类别名称 */
  label: string;
  /** 包含菜品 */
  plates: Plate[];
}

/** 菜单内容 */
export default interface Menu {
  /** 头图 data URL */
  headerPic: string;
  /** 分类集合 */
  groups: PlateGroup[];
}
