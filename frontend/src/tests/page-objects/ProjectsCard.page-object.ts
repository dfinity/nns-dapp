import { MaturityWithTooltipPo } from "$tests/page-objects/MaturityWithTooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { nonNullish } from "@dfinity/utils";

class ProjectsCardRoPo extends BasePageObject {
  private static readonly TID = "project-card-row";

  static async allUnder(
    element: PageObjectElement
  ): Promise<ProjectsCardRoPo[]> {
    const rows = await element.allByTestId(ProjectsCardRoPo.TID);
    return rows.map((el) => new ProjectsCardRoPo(el));
  }

  getTokenTitle(): Promise<string> {
    return this.getText("project-title");
  }

  async getProjectMaturity(): Promise<string> {
    const maturityWithTooltipPo = MaturityWithTooltipPo.under(this.root);
    const totalMaturity = await maturityWithTooltipPo.getTotalMaturity();

    if (nonNullish(totalMaturity)) return totalMaturity;
    return this.getText("project-maturity");
  }

  getProjectStakeInUsd(): Promise<string> {
    return this.getText("project-staked-usd");
  }

  getProjectStakeInNativeCurrency(): Promise<string> {
    return this.getText("project-staked-native");
  }
}

export class ProjectsCardPo extends BasePageObject {
  private static readonly TID = "projects-card";

  static under(element: PageObjectElement): ProjectsCardPo {
    return new ProjectsCardPo(element.byTestId(ProjectsCardPo.TID));
  }

  async getRows(): Promise<ProjectsCardRoPo[]> {
    return ProjectsCardRoPo.allUnder(this.root);
  }

  getAmount(): Promise<string> {
    return this.getText("amount");
  }

  getInfoRow(): PageObjectElement {
    return this.getElement("info-row");
  }

  async getProjectsTitle(): Promise<string[]> {
    const rowsPos = await this.getRows();
    return Promise.all(rowsPos.map((po) => po.getTokenTitle()));
  }

  async getProjectsMaturity(): Promise<string[]> {
    const rows = await this.getRows();
    return Promise.all(rows.map((row) => row.getProjectMaturity()));
  }

  async getProjectsStakeInUsd(): Promise<string[]> {
    const rows = await this.getRows();
    return Promise.all(rows.map((row) => row.getProjectStakeInUsd()));
  }

  async getProjectsStakeInNativeCurrency(): Promise<string[]> {
    const rows = await this.getRows();
    return Promise.all(
      rows.map((row) => row.getProjectStakeInNativeCurrency())
    );
  }
}
