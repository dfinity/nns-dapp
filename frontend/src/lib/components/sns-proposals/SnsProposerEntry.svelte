<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
  import { Html, KeyValuePairInfo } from "@dfinity/gix-components";
  import type { SnsNeuronId } from "@dfinity/sns";

  export let proposer: SnsNeuronId;

  let proposerText: string;
  $: proposerText = subaccountToHexString(proposer.id);
</script>

<KeyValuePairInfo testId="proposal-system-info-proposer" alignIconRight>
  {#snippet key()}<span class="description"
      >{$i18n.proposal_detail.proposer_prefix}</span
    >{/snippet}

  {#snippet value()}
    <Hash
      className="value"
      tagName="span"
      text={proposerText}
      id="proposer-id"
      showCopy
    />
  {/snippet}

  {#snippet info()}
    <Html text={$i18n.proposal_detail.proposer_description} />
  {/snippet}
</KeyValuePairInfo>
