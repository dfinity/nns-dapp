<script lang="ts">
  import { Vote } from "@dfinity/nns";
  import IconThumbDown from "../../icons/IconThumbDown.svelte";
  import IconThumbUp from "../../icons/IconThumbUp.svelte";
  import { i18n } from "../../stores/i18n";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatVotingPower } from "../../utils/neuron.utils";
  import ConfirmationModal from "../ConfirmationModal.svelte";

  export let voteType: Vote;
  export let votingPower: bigint;
</script>

<ConfirmationModal on:nnsClose on:nnsConfirm>
  <div>
    {#if voteType === Vote.YES}
      <IconThumbUp />
      <h4>{$i18n.proposal_detail__vote.confirm_adopt_headline}</h4>
      <p>
        {replacePlaceholders($i18n.proposal_detail__vote.confirm_adopt_text, {
          $votingPower: formatVotingPower(votingPower),
        })}
      </p>
    {:else}
      <IconThumbDown />
      <h4>{$i18n.proposal_detail__vote.confirm_reject_headline}</h4>
      <p>
        {replacePlaceholders($i18n.proposal_detail__vote.confirm_reject_text, {
          $votingPower: formatVotingPower(votingPower),
        })}
      </p>
    {/if}
  </div>
</ConfirmationModal>

<style lang="scss">
  @use "../../themes/mixins/media";
  @use "../../themes/mixins/text";

  div {
    padding: var(--padding-2x) 0;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--padding-1_5x);

    color: var(--background-contrast);

    :global(svg) {
      width: var(--padding-6x);
      height: var(--padding-6x);
    }
  }

  h4 {
    margin: 0;
    font-size: var(--font-size-h3);
  }

  p {
    margin: 0;

    font-size: var(--font-size-h4);
    text-align: center;
  }
</style>
