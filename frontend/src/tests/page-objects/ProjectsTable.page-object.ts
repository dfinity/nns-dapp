import { ProjectsTableRowPo } from "$tests/page-objects/ProjectsTableRow.page-object";
import { ResponsiveTablePo } from "$tests/page-objects/ResponsiveTable.page-object";
import { UsdValueBannerPo } from "$tests/page-objects/UsdValueBanner.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectsTablePo extends ResponsiveTablePo {
  private static readonly TID = "projects-table-component";

  static under(element: PageObjectElement): ProjectsTablePo {
    return new ProjectsTablePo(element.byTestId(ProjectsTablePo.TID));
  }

  getUsdValueBannerPo(): UsdValueBannerPo {
    return UsdValueBannerPo.under(this.root);
  }

  getProjectsTableRowPos(): Promise<ProjectsTableRowPo[]> {
    return ProjectsTableRowPo.allUnder(this.root);
  }

  async getRowByTitle(title: string): Promise<ProjectsTableRowPo> {
    const rows = await this.getProjectsTableRowPos();
    const titles = await Promise.all(rows.map((row) => row.getProjectTitle()));
    const index = titles.indexOf(title);
    if (index === -1) {
      throw new Error(
        `Project with title ${title} not found. Available titles: ${titles.join(
          ", "
        )}`
      );
    }
    return rows[index];
  }
}
