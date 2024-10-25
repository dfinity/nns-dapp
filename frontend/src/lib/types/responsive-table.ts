import type { ComponentType, SvelteComponent } from "svelte";

export interface ResponsiveTableRowData {
  // Used in forEach for consistent rendering. Must be unique per table.
  domKey: string;
  // If absent, the row will not be clickable.
  rowHref?: string;
}

export type ColumnAlignment = "left" | "right";
export type TemplateItem =
  | "1fr"
  | "max-content"
  | "minmax(max-content, 1fr)"
  | "minmax(min-content, max-content)";

export interface ResponsiveTableColumn<
  RowDataType extends ResponsiveTableRowData,
  IdType = string,
> {
  id?: IdType;
  title: string;
  cellComponent?: ComponentType<SvelteComponent<{ rowData: RowDataType }>>;
  alignment: ColumnAlignment;
  templateColumns: TemplateItem[];
  comparator?: Comparator<RowDataType>;
}

export type Comparator<RowDataType> = (
  a: RowDataType,
  b: RowDataType
) => number;

export type ResponsiveTableOrder<NeuronsTableColumnId = string> = Array<{
  columnId: NeuronsTableColumnId;
  reversed?: boolean;
}>;
