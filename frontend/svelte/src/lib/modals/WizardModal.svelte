<script lang="ts">
  import { StepsState } from "../stores/steps.state";
  import Modal from "./Modal.svelte";
  import Transition from "../components/ui/Transition.svelte";

  export let steps: string[];

  let stepState: StepsState;
  $: stepState = new StepsState(steps);

  export let currentStep: number;
  let diff: number;
  $: ({ currentStep, diff } = stepState);

  export const next = () => (stepState = stepState.next());
  export const back = () => (stepState = stepState.back());
  export const set = (step: number) => (stepState = stepState.set(step));
</script>

<Modal
  theme="dark"
  size="medium"
  on:nnsClose
  showBackButton={currentStep > 0}
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
    padding: 0;
    margin: 0;
  }
</style>
