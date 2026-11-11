import { HashPo } from "$tests/page-objects/Hash.page-object";
import { ResponsiveTablePo } from "$tests/page-objects/ResponsiveTable.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export type HotkeyRowData = {
  principal: string;
  projects: string[];
  neuronCount: string;
};

export class HotkeysPo extends BasePageObject {
  private static readonly TID = "hotkeys-content";

  static under(element: PageObjectElement): HotkeysPo {
    return new HotkeysPo(element.byTestId(HotkeysPo.TID));
  }

  getResponsiveTablePo(): ResponsiveTablePo {
    return ResponsiveTablePo.under(this.root);
  }

  hasEmptyState(): Promise<boolean> {
    return this.isPresent("hotkeys-empty");
  }

  async isLoading(): Promise<boolean> {
    return (await this.getResponsiveTablePo().getSkeletonRows()).length > 0;
  }

  async getRowsData(): Promise<HotkeyRowData[]> {
    const rows = await this.root.allByTestId("hotkey-cell");
    const projectCells = await this.root.allByTestId("hotkey-projects-cell");
    const neuronCells = await this.root.allByTestId("hotkey-neurons-cell");

    return Promise.all(
      rows.map(async (row, index) => {
        const projects =
          await projectCells[index].allByTestId("hotkey-project");
        return {
          principal: await HashPo.under(row).getFullText(),
          projects: await Promise.all(
            projects.map(async (project) => {
              const title = await project
                .byTestId("hotkey-project-title")
                .getText();
              const count = await project
                .byTestId("hotkey-project-neuron-count")
                .getText();
              return `${title.trim()}: ${count.trim()}`;
            })
          ),
          neuronCount: (await neuronCells[index].getText()).trim(),
        };
      })
    );
  }
}
