<script lang="ts">
  import { StepsState } from "$lib/stores/steps.state";
  import type { Steps, Step } from "$lib/stores/steps.state";
  import { Modal } from "@dfinity/gix-components";
  import Transition from "$lib/components/ui/Transition.svelte";

  export let steps: Steps;

  let stepState: StepsState;
  $: stepState = new StepsState(steps);

  export let currentStep: Step | undefined;
  $: ({ currentStep } = stepState);

  let transition: { diff: number };
  $: transition = { diff: stepState.diff };

  export const next = () => (stepState = stepState.next());
  export const back = () => (stepState = stepState.back());
  export const set = (step: number) => (stepState = stepState.set(step));

  let presented = false;
</script>

<Modal on:nnsClose on:introend={() => (presented = true)}>
  <slot name="title" slot="title" />

  {#if presented}
    <Transition {transition}>
      <slot />
    </Transition>
  {/if}
</Modal>
