<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { accountsStore } from "../../stores/accounts.store";
  import { i18n } from "../../stores/i18n";
  import { isNeuronControllableByUser } from "../../utils/neuron.utils";
  import CardInfo from "../ui/CardInfo.svelte";
  import JoinCommunityFundCheckbox from "./actions/JoinCommunityFundCheckbox.svelte";

  export let neuron: NeuronInfo;

  let isControlledByUser: boolean;
  $: isControlledByUser = isNeuronControllableByUser({
    neuron,
    mainAccount: $accountsStore.main,
  });
</script>

{#if isControlledByUser}
  <CardInfo>
    <h3 slot="start">{$i18n.neuron_detail.community_fund}</h3>
    <div>
      <JoinCommunityFundCheckbox {neuron} />
      <p>
        {@html $i18n.neuron_detail.community_fund_more_info}
      </p>
    </div>
  </CardInfo>
{/if}

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    p {
      margin: var(--padding) 0 0 0;
    }

    // For the link inside "i18n.neuron_detail.community_fund_more_info"
    :global(a) {
      color: var(--primary);
      text-decoration: none;
      font-size: inherit;
    }

    // Changes order of the label of the JoinCommunityFundCheckbox
    :global(label) {
      order: 1;
    }

    // Changes padding of checkbox wrapper
    --select-padding: var(--padding) 0;
  }
</style>
