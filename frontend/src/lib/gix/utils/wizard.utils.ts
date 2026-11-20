import type { WizardStep } from "$lib/gix/types/wizard";

export const wizardStepIndex = <T extends string = string>({
  name: stepName,
  steps,
}: {
  name: string;
  steps: WizardStep<T>[];
}) => steps.findIndex(({ name }: WizardStep) => name === stepName);
