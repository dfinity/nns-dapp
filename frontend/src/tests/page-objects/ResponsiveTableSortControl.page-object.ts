import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { ChipPo } from "$tests/page-objects/Chip.page-object";
import { ChipGroupPo } from "$tests/page-objects/ChipGroup.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ResponsiveTableSortControlPo extends BasePageObject {
  private static TID = "responsive-table-sort-control-component";

  static under(element: PageObjectElement): ResponsiveTableSortControlPo {
    return new ResponsiveTableSortControlPo(
      element.byTestId(ResponsiveTableSortControlPo.TID)
    );
  }

  getSortDirectionButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "sort-direction-button",
    });
  }

  getSortDirectionButtonIconPo(): PageObjectElement {
    return this.getSortDirectionButtonPo().root.querySelector(".icon");
  }

  getSortChipGroup(): ChipGroupPo {
    return ChipGroupPo.under(this.root);
  }

  async isSortDirectionButtonReversed(): Promise<boolean> {
    return (await this.getSortDirectionButtonIconPo().getClasses()).includes(
      "icon-north"
    );
  }

  async getSortChipPos(): Promise<ChipPo[]> {
    return this.getSortChipGroup().getChipPos();
  }

  async getSortChipLabels(): Promise<string[]> {
    const chipPos = await this.getSortChipPos();
    return Promise.all(chipPos.map((chipPo) => chipPo.getText()));
  }

  async clickSortChip(label: string): Promise<void> {
    const chipPo = await this.getSortChipGroup().getChipByLabel(label);
    return chipPo.click();
  }
}
