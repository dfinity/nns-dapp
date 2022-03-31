const deployEnvironment: string = String(process.env.DEPLOY_ENV);
export const IS_TESTNET = deployEnvironment === "testnet";
