<script lang="ts">
  import {StepsState} from "../stores/steps.state";
  import type {Step} from "../stores/steps.state";
  import Modal from "./Modal.svelte";
  import Transition from "../components/ui/Transition.svelte";

  export let steps: Step[];

  let stepState: StepsState;
  $: stepState = new StepsState(steps);

  export let currentStepIndex: number;
  let diff: number;
  let currentStep: Step | undefined;
  $: ({ currentStepIndex, diff, currentStep } = stepState);

  export const next = () => (stepState = stepState.next());
  export const back = () => (stepState = stepState.back());
  export const set = (step: number) => (stepState = stepState.set(step));
</script>

<Modal
  theme="dark"
  size="medium"
  on:nnsClose
  showBackButton={currentStep?.showBackButton ?? false}
  on:nnsBack={back}
>
  <span slot="title"><slot name="title" /></span>
  <article>
    <Transition {diff}>
      <slot />
    </Transition>
  </article>
</Modal>

<style lang="scss">
  // TODO: Manage modal height in L2-302
  article {
    height: 500px;
    margin: 0;
    padding: calc(2 * var(--padding));
  }

  :global(.wizard-wrapper) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: var(--padding);
    height: 100%;
  }
</style>
