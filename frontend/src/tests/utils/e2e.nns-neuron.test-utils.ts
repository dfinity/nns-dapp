import type { AppPo } from "$tests/page-objects/App.page-object";

/** Works only from the /neurons page. */
export const getNnsNeuronCardsIds = async (appPo: AppPo) =>
  await appPo.getNeuronsPo().getNnsNeuronsPo().getNeuronIds();
