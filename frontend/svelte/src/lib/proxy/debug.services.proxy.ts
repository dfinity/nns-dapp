const importDebugServices = () => import("../services/debug.services");

export const generateDebugLogProxy = async (options: {
  saveToFile: boolean;
  anonymise: boolean;
}): Promise<void> => {
  const { generateDebugLog } = await importDebugServices();

  return generateDebugLog(options);
};
