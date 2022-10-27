const importAppServices = () => import("../services/app.services");

export const initAppProxy = async (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const { initApp } = await importAppServices();
  return initApp();
};

// SvelteKit issue: https://github.com/sveltejs/kit/issues/1485#issuecomment-1291882125
export const gotoProxy = async (
  url: string | URL,
  opts?: {
    replaceState?: boolean;
  }
): Promise<void> => {
  const { goto } = await import("$app/navigation");
  await goto(url, opts);
};
