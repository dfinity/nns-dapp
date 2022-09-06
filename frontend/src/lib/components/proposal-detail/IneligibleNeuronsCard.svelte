<script lang="ts">
  import { ineligibleNeurons as filterIneligibleNeurons } from "@dfinity/nns";
  import type { ProposalInfo, NeuronInfo } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import CardInfo from "../ui/CardInfo.svelte";
  import type { SvelteComponent } from "svelte";
  import { VOTING_UI } from "../../constants/environment.constants";
  import ContentCell from "../ui/ContentCell.svelte";

  export let proposalInfo: ProposalInfo;
  export let neurons: NeuronInfo[];

  let ineligibleNeurons: NeuronInfo[];
  let visible: boolean = false;

  $: ineligibleNeurons = filterIneligibleNeurons({
    neurons,
    proposal: proposalInfo,
  });
  $: visible = ineligibleNeurons.length > 0;

  const reason = ({ createdTimestampSeconds }: NeuronInfo): string =>
    createdTimestampSeconds > proposalInfo.proposalTimestampSeconds
      ? $i18n.proposal_detail__ineligible.reason_since
      : $i18n.proposal_detail__ineligible.reason_short;

  // TODO(L2-965): delete legacy component <CardInfo />, inline styles (.content-cell-title and .content-cell-details) and delete ContentCell
  let cmp: typeof SvelteComponent =
    VOTING_UI === "legacy" ? CardInfo : ContentCell;
</script>

{#if visible}
  <svelte:component this={cmp}>
    <h4 slot="start">{$i18n.proposal_detail__ineligible.headline}</h4>
    <p class="description">{$i18n.proposal_detail__ineligible.text}</p>
    <ul>
      {#each ineligibleNeurons as neuron}
        <li class="value">
          {neuron.neuronId}<small>{reason(neuron)}</small>
        </li>
      {/each}
    </ul>
  </svelte:component>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin: var(--padding) 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    @include media.min-width(small) {
      margin: var(--padding-0_5x) 0;
      flex-direction: row;
      align-items: center;
    }

    small {
      font-size: var(--font-size-ultra-small);

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
  }
</style>
