import type { ComponentType, SvelteComponent } from "svelte";

export interface ResponsiveTableRowData {
  // Used in forEach for consistent rendering. Must be unique per table.
  domKey: string;
  // If absent, the row will not be clickable.
  rowHref?: string;
}

export type ColumnAlignment = "left" | "right";
export type TemplateItem = "max-content" | "1fr" | "minmax(max-content, 1fr)";

export interface ResponsiveTableColumn<
  RowDataType extends ResponsiveTableRowData,
> {
  title: string;
  cellComponent?: ComponentType<SvelteComponent<{ rowData: RowDataType }>>;
  alignment: ColumnAlignment;
  templateColumns: TemplateItem[];
}
