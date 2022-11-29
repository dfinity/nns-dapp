<script lang="ts">
  import { Tag } from "@dfinity/gix-components";
  import type { SnsFolloweesByNeuron } from "$lib/utils/sns-neuron.utils";
  import Hash from "../ui/Hash.svelte";

  export let followee: SnsFolloweesByNeuron;
</script>

<!-- TODO: Open Voting history modal https://dfinity.atlassian.net/browse/GIX-1156 -->
<button id={followee.neuronIdHex} class="text">
  <Hash text={followee.neuronIdHex} id={followee.neuronIdHex} tagName="span" />
</button>

<ul aria-labelledby={followee.neuronIdHex}>
  {#each followee.nsFunctions as nsFunction}
    <Tag tagName="li">{nsFunction.name}</Tag>
  {/each}
</ul>

<style lang="scss">
  button {
    margin: 0 0 var(--padding-0_5x);
    font-size: var(--font-size-h5);
  }

  ul {
    display: flex;
    gap: var(--padding-0_5x);
    flex-wrap: wrap;

    list-style: none;

    margin-bottom: var(--padding);
    padding: 0 0 var(--padding-2x);
    border-bottom: 1px solid currentColor;
  }
</style>
