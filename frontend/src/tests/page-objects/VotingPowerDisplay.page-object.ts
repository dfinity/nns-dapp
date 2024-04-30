import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class VotingPowerDisplayPo extends TooltipPo {
  private static readonly VOTING_POWER_DISPLAY_TID =
    "voting-power-display-component";

  static under(element: PageObjectElement): VotingPowerDisplayPo {
    return new VotingPowerDisplayPo(
      element.byTestId(VotingPowerDisplayPo.VOTING_POWER_DISPLAY_TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<VotingPowerDisplayPo[]> {
    return Array.from(
      await element.allByTestId(VotingPowerDisplayPo.VOTING_POWER_DISPLAY_TID)
    ).map((el) => new VotingPowerDisplayPo(el));
  }

  getDisplayedVotingPower(): Promise<string> {
    return this.getDisplayedText();
  }

  getExactVotingPower(): Promise<string> {
    return this.getTooltipText();
  }
}
