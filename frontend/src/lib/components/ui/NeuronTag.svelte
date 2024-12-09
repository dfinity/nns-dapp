<script lang="ts">
  import type { NeuronTagData } from "$lib/utils/neuron.utils";
  import { Tag } from "@dfinity/gix-components";

  export let tag: NeuronTagData;
  export let size: "medium" | "large" = "medium";

  let intent: "error" | "warning" | "info";
  $: intent =
    tag.status === "danger"
      ? "error"
      : tag.status === "warning"
        ? "warning"
        : "info";
</script>

<Tag testId="neuron-tag-component" {size} {intent}>{tag.text}</Tag>
