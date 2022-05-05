export const DEPLOY_ENV: string = String(process.env.DEPLOY_ENV);
export const IS_TESTNET: boolean = DEPLOY_ENV === "testnet";
export const HOST: string = process.env.HOST as string;
export const ROLLUP_WATCH: boolean = process.env.ROLLUP_WATCH === "true";
export const FETCH_ROOT_KEY: boolean = process.env.FETCH_ROOT_KEY === "true";
