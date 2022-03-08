<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { NeuronId } from "@dfinity/nns";
  import ProposerModal from "../../modals/proposals/ProposerModal.svelte";
  import { i18n } from "../../stores/i18n";

  export let proposalInfo: ProposalInfo;

  let visible: boolean = false;

  let proposer: NeuronId | undefined;
  $: ({ proposer } = proposalInfo);
</script>

<button class="text" on:click|stopPropagation={() => (visible = true)}
  ><small>{$i18n.neuron_detail.proposer}: {proposer || ""}</small></button
>

<ProposerModal bind:visible {proposalInfo} />

<style lang="scss">
  button {
    padding: 0;
    line-height: var(--line-height-standard);
    margin: 0;
  }
</style>
