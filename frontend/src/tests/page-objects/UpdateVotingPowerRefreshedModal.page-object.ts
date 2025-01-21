import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { TextInputPo } from "$tests/page-objects/TextInput.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class UpdateVotingPowerRefreshedModalPo extends ModalPo {
  private static TID = "update-voting-power-refreshed-modal-component";

  static under(element: PageObjectElement): UpdateVotingPowerRefreshedModalPo {
    return new UpdateVotingPowerRefreshedModalPo(
      element.byTestId(UpdateVotingPowerRefreshedModalPo.TID)
    );
  }

  getTimestampSecondsInputPo(): TextInputPo {
    return TextInputPo.under({
      element: this.root,
      testId: "update-voting-power-refreshed-seconds-input",
    });
  }

  async getTimestampSeconds(): Promise<number> {
    return Number(await this.getTimestampSecondsInputPo().getValue());
  }

  async updateTimestampSeconds(seconds: number): Promise<void> {
    await this.root
      .byTestId("update-voting-power-refreshed-seconds-input")
      .typeText(seconds.toString());
    await this.click("confirm-update-voting-power-refreshed-button");
    await this.waitForClosed();
  }
}
