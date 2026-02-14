export type CrewRole = "摄影" | "灯光" | "美术" | "录音";

export type VisualStyle = "日系" | "赛博" | "胶片" | "纪实" | "复古";

export type Equipment =
  | "Sony FX3"
  | "Sony A7S3"
  | "Blackmagic"
  | "RED"
  | "有车"
  | "无人机"
  | "稳定器";

export interface WorkItem {
  title: string;
  coverImage: string;
  year: number;
  role: string;
}

export interface CrewMember {
  id: string;
  name: string;
  nameReading: string;
  role: CrewRole;
  styles: VisualStyle[];
  equipment: Equipment[];
  tags: string[];
  coverImage: string;
  location: string;
  university: string;
  bio: string;
  showreelUrl?: string;
  works: WorkItem[];
}

export type CompensationType = "有薪" | "包食宿" | "互免" | "可谈";

export type ProjectStatus = "招募中" | "已满员" | "拍摄中";

export interface ProjectPosition {
  title: string;
  count: number;
  filled: number;
}

export interface Project {
  id: string;
  title: string;
  type: string;
  director: string;
  description: string;
  synopsis?: string;
  shootingDateStart: string;
  shootingDateEnd: string;
  location: string;
  positions: ProjectPosition[];
  compensation: CompensationType;
  status: ProjectStatus;
  tags: string[];
  createdAt: string;
}

export interface CrewFilters {
  role: CrewRole | null;
  style: VisualStyle | null;
  equipment: Equipment | null;
}
