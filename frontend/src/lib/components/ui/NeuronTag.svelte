<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import type { NeuronTagData } from "$lib/utils/neuron.utils";
  import { Tag } from "@dfinity/gix-components";

  export let tag: NeuronTagData;
  export let size: "medium" | "large" = "medium";

  let intent: "error" | "info";
  $: intent = tag.status === "danger" ? "error" : "info";
</script>

<TestIdWrapper testId="neuron-tag">
  <Tag {size} {intent}>{tag.text}</Tag>
</TestIdWrapper>
