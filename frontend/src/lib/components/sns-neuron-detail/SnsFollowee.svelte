<script lang="ts">
  import { Tag } from "@dfinity/gix-components";
  import type { SnsFolloweesByNeuron } from "$lib/utils/sns-neuron.utils";
  import Hash from "../ui/Hash.svelte";
  import TagsList from "../ui/TagsList.svelte";

  export let followee: SnsFolloweesByNeuron;
</script>

<!-- TODO: Open Voting history modal https://dfinity.atlassian.net/browse/GIX-1156 -->
<TagsList id={followee.neuronIdHex}>
  <Hash
    slot="title"
    text={followee.neuronIdHex}
    id={followee.neuronIdHex}
    tagName="span"
  />

  {#each followee.nsFunctions as nsFunction (nsFunction.id)}
    <Tag tagName="li">{nsFunction.name}</Tag>
  {/each}
</TagsList>
