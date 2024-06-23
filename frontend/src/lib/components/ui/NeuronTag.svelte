<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import type { NeuronTagData } from "$lib/utils/neuron.utils";
  import { Tag } from "@dfinity/gix-components";

  export let tag: NeuronTagData;
</script>

<TestIdWrapper testId="neuron-tag">
  <Tag>{tag.text}</Tag>
</TestIdWrapper>
