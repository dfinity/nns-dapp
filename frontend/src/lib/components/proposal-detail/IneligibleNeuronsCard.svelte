<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import ProposalContentCell from "./ProposalContentCell.svelte";
  import type { IneligibleNeuronData } from "$lib/utils/neuron.utils";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { SNS_NEURON_ID_DISPLAY_LENGTH } from "$lib/constants/sns-neurons.constants";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { secondsToDissolveDelayDuration } from "$lib/utils/date.utils";

  export let ineligibleNeurons: IneligibleNeuronData[] = [];
  export let minSnsDissolveDelaySeconds: bigint;

  let visible = false;
  $: visible = ineligibleNeurons.length > 0;

  const reasonSince = $i18n.proposal_detail__ineligible.reason_since;
  let reasonShort: string;
  $: reasonShort = replacePlaceholders(
    $i18n.proposal_detail__ineligible.reason_short,
    {
      $minDissolveDelay: secondsToDissolveDelayDuration(
        minSnsDissolveDelaySeconds
      ),
    }
  );
</script>

{#if visible}
  <ProposalContentCell>
    <h4 slot="start">{$i18n.proposal_detail__ineligible.headline}</h4>
    <p class="description">
      {replacePlaceholders($i18n.proposal_detail__ineligible.text, {
        $minDissolveDelay: secondsToDissolveDelayDuration(
          minSnsDissolveDelaySeconds
        ),
      })}
    </p>
    <ul>
      {#each ineligibleNeurons as neuron}
        <li class="value" title={neuron.neuronIdString}>
          {shortenWithMiddleEllipsis(
            neuron.neuronIdString,
            SNS_NEURON_ID_DISPLAY_LENGTH
          )}<small
            >{neuron.reason === "since" ? reasonSince : reasonShort}</small
          >
        </li>
      {/each}
    </ul>
  </ProposalContentCell>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin: var(--padding-2x) 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    @include media.min-width(small) {
      flex-direction: row;
      align-items: center;
    }

    small {
      font-size: var(--font-size-small);
    }
  }
</style>
