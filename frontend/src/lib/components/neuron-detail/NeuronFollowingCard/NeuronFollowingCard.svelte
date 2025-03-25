<script lang="ts">
  import Followee from "$lib/components/neuron-detail/NeuronFollowingCard/Followee.svelte";
  import FollowNeuronsButton from "$lib/components/neuron-detail/actions/FollowNeuronsButton.svelte";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { ENABLE_SNS_TOPICS } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    followeesNeurons,
    isHotKeyControllable,
    isNeuronControllable,
    type FolloweesNeuron,
  } from "$lib/utils/neuron.utils";
  import { IconRight, KeyValuePairInfo } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";
  import { onMount } from "svelte";

  export let neuron: NeuronInfo;
  let isControllable: boolean;
  $: isControllable =
    isNeuronControllable({
      neuron,
      identity: $authStore.identity,
      accounts: $icpAccountsStore,
    }) ||
    isHotKeyControllable({
      neuron,
      identity: $authStore.identity,
    });
  let followees: FolloweesNeuron[];
  $: followees = followeesNeurons(neuron);

  onMount(listKnownNeurons);
</script>

<CardInfo noMargin testId="neuron-following-card-component">
  <KeyValuePairInfo testId="neuron-following">
    <h3 slot="key">{$i18n.neuron_detail.following_title}</h3>
    <svelte:fragment slot="info">
      <div class="key-value-pair-info-wrapper">
        <span>
          {$i18n.neuron_detail.following_description}
        </span>
        {#if $ENABLE_SNS_TOPICS}
          <span class="note">
            {$i18n.neuron_detail.following_note}
          </span>
          <a href="/#" class="link">
            <span>{$i18n.neuron_detail.following_link} </span>
            <IconRight />
          </a>
        {/if}
      </div>
    </svelte:fragment>
  </KeyValuePairInfo>

  {#if followees.length > 0 && nonNullish(neuron)}
    <div data-tid="followees-list" class="frame">
      {#each followees as followee}
        <Followee {followee} {neuron} />
      {/each}
    </div>
  {/if}

  <div class="actions">
    {#if isControllable}
      <FollowNeuronsButton />
    {/if}
  </div>
</CardInfo>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  h3 {
    line-height: var(--line-height-standard);
  }

  .frame {
    padding: var(--padding-2x) 0 var(--padding-0_5x);
  }

  .actions {
    display: flex;
    justify-content: flex-start;
    padding-top: var(--padding);
  }

  .key-value-pair-info-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--padding);

    .note {
      @include fonts.small(true);
    }

    .link {
      display: flex;
      align-items: center;
      justify-content: center;

      color: var(--button-secondary-color);
      font-weight: var(--font-weight-bold);
      text-decoration: none;
    }
  }
</style>
