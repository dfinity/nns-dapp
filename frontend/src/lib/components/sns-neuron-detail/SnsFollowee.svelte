<script lang="ts">
  import type { SnsFolloweesByNeuron } from "$lib/utils/sns-neuron.utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Hash from "$lib/components/ui/Hash.svelte";
  import TagsList from "$lib/components/ui/TagsList.svelte";
  import { Tag } from "@dfinity/gix-components";

  export let followee: SnsFolloweesByNeuron;
</script>

<!-- TODO: Open Voting history modal https://dfinity.atlassian.net/browse/GIX-1156 -->
<TestIdWrapper testId="sns-followee-component">
  <TagsList id={followee.neuronIdHex}>
    <Hash
      text={followee.neuronIdHex}
      id={followee.neuronIdHex}
      tagName="h5"
      slot="title"
      showCopy
    />

    {#each followee.nsFunctions as nsFunction (nsFunction.id)}
      <Tag tagName="li">{nsFunction.name}</Tag>
    {/each}
  </TagsList>
</TestIdWrapper>
