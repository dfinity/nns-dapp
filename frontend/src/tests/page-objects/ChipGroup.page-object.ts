import { ChipPo } from "$tests/page-objects/Chip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ChipGroupPo extends BasePageObject {
  private static TID = "chip-group-component";

  static under(element: PageObjectElement): ChipGroupPo {
    return new ChipGroupPo(element.byTestId(ChipGroupPo.TID));
  }

  async getChipPos(): Promise<ChipPo[]> {
    return ChipPo.allUnder(this.root);
  }

  async getChipByLabel(label: string): Promise<ChipPo> {
    const chipPos = await this.getChipPos();
    const chipLabels = await Promise.all(
      chipPos.map((chipPo) => chipPo.getText())
    );
    const index = chipLabels.indexOf(label);
    if (index === -1) {
      throw new Error(`Chip with label "${label}" not found`);
    }
    return chipPos[index];
  }
}
