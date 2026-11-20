<script lang="ts" module>
  type T = string;
</script>

<script generics="T extends string" lang="ts">
  import type { Snippet } from "svelte";
  import WizardTransition from "$lib/gix/components/WizardTransition.svelte";
  import Modal from "$lib/gix/components/Modal.svelte";
  import { WizardStepsState } from "$lib/gix/stores/wizard.state";
  import type { WizardStep, WizardSteps } from "$lib/gix/types/wizard";

  interface Props {
    steps: WizardSteps<T>;
    disablePointerEvents?: boolean;
    testId?: string;
    currentStep?: WizardStep<T>;
    title?: Snippet;
    children: Snippet;
    onClose?: () => void;
  }

  let {
    steps,
    disablePointerEvents = false,
    testId,
    currentStep = $bindable(),
    title,
    children,
    onClose,
  }: Props = $props();

  let stepState = $derived(new WizardStepsState<T>(steps));

  // `stepState` is not reactive: next, back and set mutate it in place.
  // A new `transition` object re-runs the `{#key}` slide animation.
  let transition = $derived({ diff: stepState.diff });

  // Sync `currentStep` on mount and when `steps` change.
  $effect(() => {
    ({ currentStep } = stepState);
  });

  const runStepTransition = (move: () => void) => {
    const { currentStepIndex } = stepState;

    move();
    ({ currentStep } = stepState);

    if (stepState.currentStepIndex !== currentStepIndex) {
      transition = { diff: stepState.diff };
    }
  };

  export const next = () => runStepTransition(() => stepState.next());
  export const back = () => runStepTransition(() => stepState.back());
  export const set = (step: number) =>
    runStepTransition(() => stepState.set(step));

  // onDestroy is not always called when repetitively opened/closed in NNS-dapp.
  // This might be linked to Svelte issue https://github.com/sveltejs/svelte/issues/5268.
  // We use to display the content of the wizard modal according to the modal intro state (see GIT history), but this happens to be visually glitchy.
  // That is why we rather enforce not rendering any content in the DOM when the modal is closed, which solves both issues.
  let visible = $state(true);
  const close = () => {
    visible = false;
    onClose?.();
  };
</script>

{#if visible}
  <Modal {disablePointerEvents} onClose={close} {testId} {title}>
    <WizardTransition {transition}>
      {@render children()}
    </WizardTransition>
  </Modal>
{/if}
