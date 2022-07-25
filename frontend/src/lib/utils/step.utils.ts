import type { Step } from "../stores/steps.state";

export const stepIndex = ({
  name: stepName,
  steps,
}: {
  name: string;
  steps: Step[];
}) => steps.findIndex(({ name }: Step) => name === stepName);
