<script lang="ts">
  import { IconExpandCircleDown, Collapsible } from "@dfinity/gix-components";
  import { fade } from "svelte/transition";
  import { i18n } from "$lib/stores/i18n";
  import { goto } from "$app/navigation";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { nnsTokenStore } from "$lib/derived/universes-tokens.derived";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { nonNullish } from "@dfinity/utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  let toggleContent: () => void;
  let expanded: boolean;

  let token: string | undefined;
  $: token = $isNnsUniverseStore
    ? $nnsTokenStore.token.symbol
    : $snsTokenSymbolSelectedStore?.symbol;

  const gotoNeurons = () => goto($neuronsPathStore);
</script>

<TestIdWrapper testId="stake-neuron-to-vote-component">
  {#if nonNullish(token)}
    <div class="container" in:fade>
      <Collapsible
        expandButton={false}
        externalToggle={true}
        bind:toggleContent
        bind:expanded
        wrapHeight
      >
        <div slot="header" class="header" class:expanded>
          <span class="value"
            >{replacePlaceholders($i18n.proposal_detail__vote.no_neurons, {
              $token: token,
            })}</span
          >
          <button
            class="icon"
            class:expanded
            on:click|stopPropagation={toggleContent}
            data-tid="expand-icon"
          >
            <IconExpandCircleDown />
          </button>
        </div>
        <p class="description" data-tid="stake-neuron-description">
          {replacePlaceholders(
            $i18n.proposal_detail__vote.no_neurons_description,
            {
              $token: token,
            }
          )}
        </p>
        <button
          data-tid="stake-neuron-button"
          class="secondary stake-neuron-button"
          type="button"
          on:click|stopPropagation={gotoNeurons}
          >{replacePlaceholders($i18n.proposal_detail__vote.stake_neuron, {
            $token: token,
          })}</button
        >
        <slot />
      </Collapsible>
    </div>
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .container {
    margin-bottom: var(--padding);
  }

  .header {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .icon {
    color: var(--tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    transition: transform ease-in var(--animation-time-normal);

    &.expanded {
      transform: rotate(-180deg);
    }
  }

  .stake-neuron-button {
    margin-top: var(--padding);
  }
</style>
