<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    formattedTotalMaturity,
    formattedStakedMaturity,
    hasEnoughMaturityToStake,
    hasPermissionToStakeMaturity,
  } from "$lib/utils/sns-neuron.utils";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import { KeyValuePair } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";
  import SnsStakeMaturityButton from "$lib/components/sns-neuron-detail/actions/SnsStakeMaturityButton.svelte";
  import SnsAutoStakeMaturity from "$lib/components/sns-neuron-detail/actions/SnsAutoStakeMaturity.svelte";
  import { isNullish } from "$lib/utils/utils";
  import { authStore } from "$lib/stores/auth.store";

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

  let allowedToStakeMaturity: boolean;
  $: allowedToStakeMaturity = isNullish(neuron)
    ? false
    : hasPermissionToStakeMaturity({
        neuron,
        identity: $authStore.identity,
      });
</script>

<CardInfo>
  <KeyValuePair testId="maturity">
    <h3 slot="key">{$i18n.neuron_detail.maturity_title}</h3>
    <h3 slot="value">{formattedTotalMaturity(neuron)}</h3>
  </KeyValuePair>

  {#if hasEnoughMaturityToStake(neuron)}
    <KeyValuePair testId="staked-maturity">
      <svelte:fragment slot="key">{$i18n.neurons.staked}</svelte:fragment>

      <span slot="value" class="staked-maturity"
        >{formattedStakedMaturity(neuron)}</span
      >
    </KeyValuePair>
  {/if}

  {#if allowedToStakeMaturity}
    <div class="actions" data-tid="stake-maturity-actions">
      <SnsStakeMaturityButton />
    </div>

    <SnsAutoStakeMaturity />
  {/if}
</CardInfo>

<Separator />

<style lang="scss">
  @use "../../themes/mixins/neuron";

  @include neuron.maturity-card-info;
</style>
