<script lang="ts">
  import { StepsState } from "../stores/steps.state";
  import type { Steps, Step } from "../stores/steps.state";
  import Modal from "./Modal.svelte";
  import Transition from "../components/ui/Transition.svelte";

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

<Modal
  theme="dark"
  size="big"
  on:nnsClose
  on:introend={() => (presented = true)}
  showBackButton={currentStep?.showBackButton ?? false}
  on:nnsBack={back}
>
  <span slot="title"><slot name="title" /></span>
  <section>
    {#if presented}
      <Transition {transition}>
        <slot />
      </Transition>
    {/if}
  </section>
</Modal>

<style lang="scss">
  @use "../themes/mixins/modal.scss";
  section {
    @include modal.section;
  }
</style>
