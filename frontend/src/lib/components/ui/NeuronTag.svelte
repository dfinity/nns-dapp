<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { Tag } from "@dfinity/gix-components";
  import type { NeuronTagData } from "$lib/utils/neuron.utils";

  export let tag: NeuronTagData;
</script>

<TestIdWrapper testId="neuron-tag">
  <Tag>{tag.text}</Tag>
</TestIdWrapper>
