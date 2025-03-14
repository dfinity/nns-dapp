<script lang="ts">
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { IconThumbDown, IconThumbUp } from "@dfinity/gix-components";
  import { Vote } from "@dfinity/nns";

  export let voteType: Vote;
  export let votingPower: bigint;
</script>

<ConfirmationModal on:nnsClose on:nnsConfirm>
  <div class="wrapper">
    {#if voteType === Vote.Yes}
      <span class="icon-wrapper yes" aria-hidden="true">
        <IconThumbUp />
      </span>
      <h4>{$i18n.proposal_detail__vote.confirm_adopt_headline}</h4>
      <p>
        {replacePlaceholders($i18n.proposal_detail__vote.confirm_adopt_text, {
          $votingPower: formatVotingPower(votingPower),
        })}
      </p>
    {:else}
      <span class="icon-wrapper no" aria-hidden="true">
        <IconThumbDown />
      </span>
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
  @use "../../themes/mixins/confirmation-modal";

  .wrapper {
    @include confirmation-modal.wrapper;

    :global(svg) {
      width: var(--padding-4x);
      height: var(--padding-4x);
    }

    .icon-wrapper {
      width: var(--padding-6x);
      height: var(--padding-6x);
      margin-bottom: var(--padding);

      border-radius: 50%;

      display: flex;
      align-items: center;
      justify-content: center;

      &.yes {
        color: var(--positive-emphasis);
        background-color: var(--positive-emphasis-light);
      }

      &.no {
        color: var(--negative-emphasis);
        background-color: var(--negative-emphasis-light);
      }
    }
  }

  h4 {
    @include confirmation-modal.title;
  }

  p {
    @include confirmation-modal.text;
  }
</style>
