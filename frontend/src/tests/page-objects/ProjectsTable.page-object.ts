import { ProjectsTableRowPo } from "$tests/page-objects/ProjectsTableRow.page-object";
import { ResponsiveTablePo } from "$tests/page-objects/ResponsiveTable.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectsTablePo extends ResponsiveTablePo {
  private static readonly TID = "projects-table-component";

  static under(element: PageObjectElement): ProjectsTablePo {
    return new ProjectsTablePo(element.byTestId(ProjectsTablePo.TID));
  }

  getProjectsTableRowPos(): Promise<ProjectsTableRowPo[]> {
    return ProjectsTableRowPo.allUnder(this.root);
  }
}
