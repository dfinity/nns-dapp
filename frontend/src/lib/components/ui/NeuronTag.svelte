<script lang="ts">
  import type { NeuronTagData } from "$lib/utils/neuron.utils";
  import { Tag } from "@dfinity/gix-components";

  export let tag: NeuronTagData;
  export let size: "medium" | "large" = "medium";

  let intent: "error" | "info";
  $: intent = tag.status === "danger" ? "error" : "info";
</script>

<Tag testId="neuron-tag-component" {size} {intent}>{tag.text}</Tag>
