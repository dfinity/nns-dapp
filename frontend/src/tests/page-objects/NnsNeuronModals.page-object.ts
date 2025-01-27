import { AddHotkeyModalPo } from "$tests/page-objects/AddHotkeyModal.page-object";
import { DisburseNnsNeuronModalPo } from "$tests/page-objects/DisburseNnsNeuronModal.page-object";
import { DissolveActionButtonModalPo } from "$tests/page-objects/DissolveActionButtonModal.page-object";
import { IncreaseNeuronStakeModalPo } from "$tests/page-objects/IncreaseNeuronStakeModal.page-object";
import { JoinCommunityFundModalPo } from "$tests/page-objects/JoinCommunityFundModal.page-object";
import { LosingRewardNeuronsModalPo } from "$tests/page-objects/LosingRewardNeuronsModal.page-object";
import { NnsAddMaturityModalPo } from "$tests/page-objects/NnsAddMaturityModal.page-object";
import { SpawnNeuronModalPo } from "$tests/page-objects/SpawnNeuronModal.page-object";
import { UpdateVotingPowerRefreshedModalPo } from "$tests/page-objects/UpdateVotingPowerRefreshedModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronModalsPo extends BasePageObject {
  private static readonly TID = "nns-neuron-modals-component";

  static under(element: PageObjectElement): NnsNeuronModalsPo {
    return new NnsNeuronModalsPo(element.byTestId(NnsNeuronModalsPo.TID));
  }

  getDisburseNnsNeuronModalPo(): DisburseNnsNeuronModalPo {
    return DisburseNnsNeuronModalPo.under(this.root);
  }

  getIncreaseNeuronStakeModalPo(): IncreaseNeuronStakeModalPo {
    return IncreaseNeuronStakeModalPo.under(this.root);
  }

  getDissolveActionButtonModalPo(): DissolveActionButtonModalPo {
    return DissolveActionButtonModalPo.under(this.root);
  }

  getAddHotkeyModalPo(): AddHotkeyModalPo {
    return AddHotkeyModalPo.under(this.root);
  }

  getJoinCommunityFundModalPo(): JoinCommunityFundModalPo {
    return JoinCommunityFundModalPo.under(this.root);
  }

  getNnsAddMaturityModalPo(): NnsAddMaturityModalPo {
    return NnsAddMaturityModalPo.under(this.root);
  }

  getUpdateVotingPowerRefreshedModalPo(): UpdateVotingPowerRefreshedModalPo {
    return UpdateVotingPowerRefreshedModalPo.under(this.root);
  }

  getSpawnNeuronModalPo(): SpawnNeuronModalPo {
    return SpawnNeuronModalPo.under(this.root);
  }

  getLosingRewardNeuronsModalPo(): LosingRewardNeuronsModalPo {
    return LosingRewardNeuronsModalPo.under(this.root);
  }
}
