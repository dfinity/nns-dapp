<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { accountsStore } from "$lib/stores/accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import { isNeuronControllableByUser } from "$lib/utils/neuron.utils";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import JoinCommunityFundCheckbox from "./actions/JoinCommunityFundCheckbox.svelte";
  import KeyValuePairInfo from "$lib/components/ui/KeyValuePairInfo.svelte";

  export let neuron: NeuronInfo;

  let isControlledByUser: boolean;
  $: isControlledByUser = isNeuronControllableByUser({
    neuron,
    mainAccount: $accountsStore.main,
  });
</script>

{#if isControlledByUser}
  <CardInfo>
    <KeyValuePairInfo testId="join-community-fund">
      <h3 slot="key">{$i18n.neuron_detail.community_fund}</h3>

      <svelte:fragment slot="info"
        ><div class="info">
          {@html $i18n.neuron_detail.community_fund_more_info}
        </div></svelte:fragment
      >
    </KeyValuePairInfo>

    <div class="join">
      <JoinCommunityFundCheckbox {neuron} />
    </div>
  </CardInfo>
{/if}

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  .join {
    --select-label-order: 1;
    --select-padding: var(--padding) 0;
  }

  .info {
    // For the link inside "i18n.neuron_detail.community_fund_more_info"
    :global(a) {
      color: var(--primary);
      text-decoration: none;
      font-size: inherit;
      line-height: inherit;
    }
  }
</style>
