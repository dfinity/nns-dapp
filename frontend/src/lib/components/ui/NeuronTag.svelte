<script lang="ts">
  import type { NeuronTagData } from "$lib/utils/neuron.utils";
  import { Tag } from "@dfinity/gix-components";

  export let tag: NeuronTagData;
  export let size: "medium" | "large" | undefined = undefined;
</script>

<Tag testId="neuron-tag-component" {size}>{tag.text}</Tag>
