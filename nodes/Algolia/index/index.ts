import { Resource } from '@helpers';

import { listIndices } from './listIndices';

export const index = new Resource({
	name: 'Index',
	value: 'index',
}).addOperation(listIndices);
