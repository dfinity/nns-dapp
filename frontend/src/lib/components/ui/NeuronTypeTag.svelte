<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { NeuronType } from "@dfinity/nns";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { Tag } from "@dfinity/gix-components";

  type NeuronIntent = "warning" | "info";
  const toLabelKey = (type: NeuronType) => {
    if (type === NeuronType.Seed) {
      return "seed";
    }
    if (type === NeuronType.Ect) {
      return "ect";
    }
  };

  const toDescriptionKey = (type: NeuronType) => {
    if (type === NeuronType.Seed) {
      return "seedDescription";
    }
    if (type === NeuronType.Ect) {
      return "ectDescription";
    }
  };

  export let type: NeuronType;
  export let top = false;

  let label: string;
  $: label = $i18n.neuron_types[toLabelKey(type)];

  let description: string;
  $: description = $i18n.neuron_types[toDescriptionKey(type)];

  let intent: NeuronIntent;
  $: intent = ({
    [NeuronType.Seed]: "warning",
    [NeuronType.Ect]: "info",
  }[type] ?? "info") as NeuronIntent;
</script>

<TestIdWrapper testId="neuron-type-tag">
  <Tooltip id="neuron-type-tag-tooltip" text={description} {top}>
    <Tag {intent}>{label}</Tag>
  </Tooltip>
</TestIdWrapper>
