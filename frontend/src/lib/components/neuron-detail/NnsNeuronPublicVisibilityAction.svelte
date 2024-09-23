<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import CommonItemAction from "../ui/CommonItemAction.svelte";
  import { IconPublicBadge, Toggle } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;

  let isPublic: boolean;
  $: isPublic = neuron.visibility === 2 || false;
</script>

<CommonItemAction testId="nns-neuron-public-visibility-action-component">
  <div slot="icon" class="public-badge-container">
    <IconPublicBadge />
  </div>

  <span slot="title" data-tid="neuron-visiblitiy">
    {isPublic
      ? $i18n.neurons.public_neuron
      : $i18n.neurons.private_neuron}</span
  >
  <svelte:fragment slot="subtitle">
    {isPublic
      ? $i18n.neurons.public_neuron_description
      : $i18n.neurons.private_neuron_description}
    <a
      href="https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
      target="_blank">{$i18n.neurons.learn_more}</a
    >
  </svelte:fragment>

  <div class="toggle-container">
    <Toggle ariaLabel="Public Neuron" bind:checked={isPublic} disabled />
  </div>
</CommonItemAction>

<style lang="scss">
  .public-badge-container {
    line-height: 0;
    color: var(--elements-badge);
  }

  a {
    color: var(--link-color);
  }

  .toggle-container {
    --card-background-contrast: var(--primary);
    transform: scale(1.15);
  }
</style>
