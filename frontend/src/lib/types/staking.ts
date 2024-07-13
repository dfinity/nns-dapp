import type { ResponsiveTableColumn } from "$lib/types/responsive-table";

export type TableProject = {
  rowHref?: string;
  domKey: string;
  title: string;
  logo: string;
  neuronCount: number;
};

export type ProjectsTableColumn = ResponsiveTableColumn<TableProject>;
