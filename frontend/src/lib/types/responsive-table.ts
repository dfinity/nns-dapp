import type { ComponentType, SvelteComponent } from "svelte";

export interface ResponsiveTableRowData {
  rowHref: string;
}

export interface ResponsiveTableColumn<
  RowDataType extends ResponsiveTableRowData,
> {
  title: string;
  cellComponent: ComponentType<SvelteComponent<{ rowData: RowDataType }>>;
}
