import { ProjectMaturityCellPo } from "$tests/page-objects/ProjectMaturityCell.page-object";
import { ProjectNeuronsCellPo } from "$tests/page-objects/ProjectNeuronsCell.page-object";
import { ProjectStakeCellPo } from "$tests/page-objects/ProjectStakeCell.page-object";
import { ProjectTitleCellPo } from "$tests/page-objects/ProjectTitleCell.page-object";
import { ResponsiveTableRowPo } from "$tests/page-objects/ResponsiveTableRow.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectsTableRowPo extends ResponsiveTableRowPo {
  static under(element: PageObjectElement): ProjectsTableRowPo {
    return new ProjectsTableRowPo(element.byTestId(ResponsiveTableRowPo.TID));
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<ProjectsTableRowPo[]> {
    return Array.from(await element.allByTestId(ResponsiveTableRowPo.TID)).map(
      (el) => new ProjectsTableRowPo(el)
    );
  }

  getProjectTitleCellPo(): ProjectTitleCellPo {
    return ProjectTitleCellPo.under(this.root);
  }

  getProjectStakeCellPo(): ProjectStakeCellPo {
    return ProjectStakeCellPo.under(this.root);
  }

  getProjectMaturityCellPo(): ProjectMaturityCellPo {
    return ProjectMaturityCellPo.under(this.root);
  }

  getProjectNeuronsCellPo(): ProjectNeuronsCellPo {
    return ProjectNeuronsCellPo.under(this.root);
  }

  getProjectTitle(): Promise<string> {
    return this.getProjectTitleCellPo().getProjectTitle();
  }

  getStake(): Promise<string> {
    return this.getProjectStakeCellPo().getStake();
  }

  getNeuronCount(): Promise<string> {
    return this.getProjectNeuronsCellPo().getNeuronCount();
  }

  hasGoToNeuronsTableAction(): Promise<boolean> {
    return this.isPresent("go-to-neurons-table-action");
  }
}
