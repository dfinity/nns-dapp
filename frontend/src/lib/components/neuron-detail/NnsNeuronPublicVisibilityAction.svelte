<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    isNeuronControllableByUser,
    isNeuronControlledByHardwareWallet,
    isPublicNeuron,
  } from "$lib/utils/neuron.utils";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import CommonItemAction from "../ui/CommonItemAction.svelte";
  import { IconPublicBadge, Tooltip } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsChangeNeuronVisibilityButton from "./actions/NnsChangeNeuronVisibilityButton.svelte";

  export let neuron: NeuronInfo;

  let isPublic: boolean;
  $: isPublic = isPublicNeuron(neuron);

  let isControllable: boolean;
  $: isControllable = isNeuronControllableByUser({
    neuron,
    mainAccount: $icpAccountsStore.main,
  });

  $: isHwNeuron = isNeuronControlledByHardwareWallet({
    neuron,
    accounts: $icpAccountsStore,
  });
</script>

<CommonItemAction testId="nns-neuron-public-visibility-action-component">
  <div slot="icon" class="public-badge-container" class:private={!isPublic}>
    <IconPublicBadge />
  </div>

  <span slot="title" data-tid="neuron-visibility-title">
    {isPublic
      ? $i18n.neurons.public_neuron
      : $i18n.neurons.private_neuron}</span
  >
  <svelte:fragment slot="subtitle">
    <span class="description" data-tid="neuron-visibility-description">
      {isPublic
        ? $i18n.neurons.public_neuron_description
        : $i18n.neurons.private_neuron_description}
      <a
        data-tid="neuron-visibility-learn-more"
        href="https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
        target="_blank">{$i18n.neurons.learn_more}</a
      >
    </span>
  </svelte:fragment>

  {#if isControllable}
    <NnsChangeNeuronVisibilityButton {neuron} />
  {:else if isHwNeuron}
    <Tooltip
      id={"public_visibility_action_hw_tooltip"}
      text={$i18n.neuron_detail.public_visibility_action_hw_tooltip}
    >
      <NnsChangeNeuronVisibilityButton {neuron} disabled={isHwNeuron} />
    </Tooltip>
  {/if}
</CommonItemAction>

<style lang="scss">
  .public-badge-container {
    line-height: 0;
    color: var(--elements-badges);
  }
  .private {
    color: var(--elements-badges-inactive);
  }

  a {
    color: var(--link-color);
  }
</style>
