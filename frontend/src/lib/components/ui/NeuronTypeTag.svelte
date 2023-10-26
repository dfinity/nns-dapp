<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { NeuronType } from "@dfinity/nns";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { Tag } from "@dfinity/gix-components";

  export let type: NeuronType;
  export let top = false;

  let label: string;
  $: label =
    $i18n.neuron_types[
      {
        [NeuronType.Seed]: "seed",
        [NeuronType.Ect]: "ect",
      }[type]
    ];

  let description: string;
  $: description =
    $i18n.neuron_types[
      {
        [NeuronType.Seed]: "seedDescription",
        [NeuronType.Ect]: "ectDescription",
      }[type]
    ];

  let intent: string;
  $: intent = {
    [NeuronType.Seed]: "warning",
    [NeuronType.Ect]: "info",
  }[type];
</script>

<TestIdWrapper testId="neuron-type-tag">
  <Tooltip text={description} {top}>
    <Tag {intent}>{label}</Tag>
  </Tooltip>
</TestIdWrapper>
