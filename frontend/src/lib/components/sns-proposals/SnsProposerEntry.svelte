<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
  import { Html, KeyValuePairInfo } from "@dfinity/gix-components";
  import type { SnsNeuronId } from "@dfinity/sns";
  import Hash from "../ui/Hash.svelte";

  export let proposer: SnsNeuronId;

  let proposerText: string;
  $: proposerText = subaccountToHexString(proposer.id);
</script>

<KeyValuePairInfo testId="proposal-system-info-proposer">
  <svelte:fragment slot="key"
    >{$i18n.proposal_detail.proposer_prefix}</svelte:fragment
  >

  <svelte:fragment slot="value">
    <Hash
      className="value"
      tagName="span"
      text={proposerText}
      id="proposer-id"
    />
  </svelte:fragment>

  <svelte:fragment slot="info">
    <Html text={$i18n.proposal_detail.proposer_description} />
  </svelte:fragment>
</KeyValuePairInfo>
