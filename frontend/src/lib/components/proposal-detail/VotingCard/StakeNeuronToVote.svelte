<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { nnsTokenStore } from "$lib/derived/universes-tokens.derived";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { Collapsible, IconExpandCircleDown } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import { fade } from "svelte/transition";

  let toggleContent: () => void;
  let expanded: boolean;

  let token: string | undefined;
  $: token = $isNnsUniverseStore
    ? $nnsTokenStore.token.symbol
    : $snsProjectSelectedStore?.summary?.token?.symbol;

  let snsName: string | undefined;
  $: snsName = $isNnsUniverseStore
    ? undefined
    : $snsProjectSelectedStore?.summary?.metadata?.name;

  let title: string | undefined;
  $: title = $isNnsUniverseStore
    ? $i18n.proposal_detail__vote.no_nns_neurons
    : snsName &&
      replacePlaceholders($i18n.proposal_detail__vote.no_sns_neurons, {
        $project: snsName,
      });

  let description: string | undefined;
  $: description =
    token &&
    ($isNnsUniverseStore
      ? replacePlaceholders(
          $i18n.proposal_detail__vote.no_nns_neurons_description,
          {
            $token: token,
          }
        )
      : snsName &&
        replacePlaceholders($i18n.sns_neurons.text, {
          $tokenSymbol: token,
          $project: snsName,
        }));
</script>

<TestIdWrapper testId="stake-neuron-to-vote-component">
  {#if nonNullish(token) && nonNullish(title) && nonNullish(description)}
    <div class="container" in:fade>
      <Collapsible
        expandButton={false}
        externalToggle={true}
        bind:toggleContent
        bind:expanded
        wrapHeight
      >
        <div slot="header" class="header" class:expanded>
          <span class="value" data-tid="stake-neuron-title">{title}</span>
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
          {description}
        </p>
        <a
          href={$neuronsPathStore}
          data-tid="stake-neuron-button"
          class="button secondary stake-neuron-button"
        >
          {replacePlaceholders($i18n.proposal_detail__vote.stake_neuron, {
            $token: token,
          })}
        </a>
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
