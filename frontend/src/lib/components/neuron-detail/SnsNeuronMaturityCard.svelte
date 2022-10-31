<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import KeyValuePairInfo from "$lib/components/ui/KeyValuePairInfo.svelte";
  import type {SnsNeuron} from "@dfinity/sns";
  import {formattedSnsMaturity} from "$lib/utils/sns-neuron.utils.js";
  import {replacePlaceholders} from "$lib/utils/i18n.utils.js";
  import {ICPToken} from "@dfinity/nns";
  import {snsTokenSymbolSelectedStore} from "$lib/derived/sns/sns-token-symbol-selected.store";
  import {isNnsProjectStore} from "$lib/derived/selected-project.derived";
  import {SELECTED_SNS_NEURON_CONTEXT_KEY, SelectedSnsNeuronContext} from "$lib/types/sns-neuron-detail.context";
  import {getContext} from "svelte";

  const { store }: SelectedSnsNeuronContext =
          getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  let token: string;
  $: token = $isNnsProjectStore ? ICPToken.symbol : $snsTokenSymbolSelectedStore?.symbol ?? $i18n.core.token;
</script>

<CardInfo>
  <KeyValuePairInfo testId="maturity">
    <h3 slot="key">{ $i18n.neuron_detail.maturity_title}</h3>
    <svelte:fragment slot="info"
      >{replacePlaceholders($i18n.neuron_detail.stake_maturity_tooltip, {$token: token})}</svelte:fragment
    >
    <h3 slot="value">{formattedSnsMaturity(neuron)}</h3>
  </KeyValuePairInfo>
</CardInfo>

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }
</style>
