import type { HttpAgent, Identity } from '@dfinity/agent';
import { createAgent as createAgentUtil } from '@dfinity/utils';
import { FETCH_ROOT_KEY } from '../constants/environment.constants';

export const createAgent = async (params: {
	identity: Identity;
	host?: string;
}): Promise<HttpAgent> =>
	createAgentUtil({
		...params,
		fetchRootKey: FETCH_ROOT_KEY
	});
