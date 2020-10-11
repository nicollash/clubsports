export interface IMenuItem {
  title: string;
  icon: string;
  link: string;
  children: string[];
  isAllowEdit?: boolean;
  isCompleted?: boolean;
}
