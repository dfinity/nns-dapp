<script lang="ts">
  import VotingCardNeuronList from "$lib/components/proposal-detail/VotingCard/VotingCardNeuronList.svelte";
  import { SNS_NEURON_ID_DISPLAY_LENGTH } from "$lib/constants/sns-neurons.constants";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToRoundedDuration } from "$lib/utils/date.utils";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type {
    IneligibleNeuronData,
    NeuronIneligibilityReason,
  } from "$lib/utils/neuron.utils";
  import { nonNullish } from "@dfinity/utils";

  export let ineligibleNeurons: IneligibleNeuronData[] = [];
  export let minSnsDissolveDelaySeconds: bigint;

  let visible = false;
  $: visible = ineligibleNeurons.length > 0;

  let reasonShort: string;
  $: reasonShort = replacePlaceholders(
    $i18n.proposal_detail__ineligible.reason_short,
    {
      $minDissolveDelay: secondsToRoundedDuration(minSnsDissolveDelaySeconds),
    }
  );
  const reasonText = ({ reason }: IneligibleNeuronData) =>
    nonNullish(reason)
      ? (
          {
            since: $i18n.proposal_detail__ineligible.reason_since,
            "no-permission":
              $i18n.proposal_detail__ineligible.reason_no_permission,
            short: reasonShort,
          } as Record<NeuronIneligibilityReason, string>
        )[reason]
      : "unknown";
</script>

{#if visible}
  <p class="description" data-tid="ineligible-neurons-description">
    {replacePlaceholders($i18n.proposal_detail__ineligible.text, {
      $minDissolveDelay: secondsToRoundedDuration(minSnsDissolveDelaySeconds),
    })}
  </p>
  <VotingCardNeuronList>
    {#each ineligibleNeurons as neuron}
      <li class="value" title={neuron.neuronIdString}>
        <span class="label">
          {shortenWithMiddleEllipsis(
            neuron.neuronIdString,
            SNS_NEURON_ID_DISPLAY_LENGTH
          )}
        </span>
        <small class="value">{reasonText(neuron)}</small>
      </li>
    {/each}
  </VotingCardNeuronList>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  p {
    margin: var(--padding-2x) 0;

    // fix unexpected scrollbars in voted and ineligible list
    line-height: normal;
  }

  li {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--padding);

    @include media.min-width(small) {
      flex-direction: row;
      align-items: center;
    }

    small {
      font-size: var(--font-size-small);
    }
  }
</style>
