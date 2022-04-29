const deployEnvironment: string = String(process.env.DEPLOY_ENV);
export const IS_TESTNET = deployEnvironment === "testnet";
export const IS_NOT_MAINNET = (deployEnvironment === "testnet") || (deployEnvironment === "local");
