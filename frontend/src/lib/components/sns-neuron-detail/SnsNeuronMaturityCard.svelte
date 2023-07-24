<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    formattedTotalMaturity,
    formattedStakedMaturity,
    hasPermissionToStakeMaturity,
    hasStakedMaturity,
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
  import { isNullish } from "@dfinity/utils";
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

<CardInfo testId="sns-neuron-maturity-card-component">
  <KeyValuePair testId="maturity">
    <h3 slot="key">{$i18n.neuron_detail.maturity_title}</h3>
    <h3 slot="value">{formattedTotalMaturity(neuron)}</h3>
  </KeyValuePair>

  {#if hasStakedMaturity(neuron)}
    <div class="details">
      <KeyValuePair testId="staked-maturity">
        <svelte:fragment slot="key">{$i18n.neurons.staked}</svelte:fragment>

        <span slot="value">{formattedStakedMaturity(neuron)}</span>
      </KeyValuePair>

      <!-- TODO: Add Last maturity distribution date -->
    </div>
  {/if}

  {#if allowedToStakeMaturity}
    <div class="actions" data-tid="stake-maturity-actions">
      <SnsStakeMaturityButton />
    </div>
  {/if}

  <div class="auto-stake">
    <SnsAutoStakeMaturity />
  </div>
</CardInfo>

<Separator />

<style lang="scss">
  @use "../../themes/mixins/neuron";

  @include neuron.maturity-card-info;

  .auto-stake {
    padding: var(--padding-2x) 0 0;

    --checkbox-padding: var(--padding) 0;
  }
</style>
