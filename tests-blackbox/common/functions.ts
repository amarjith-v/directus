import request from 'supertest';
import { getUrl } from './config';
import * as common from './index';

export type OptionsCreateRole = {
	name: string;
	appAccessEnabled: boolean;
	adminAccessEnabled: boolean;
};

export async function CreateRole(vendor: string, options: OptionsCreateRole) {
	// Action
	const roleResponse = await request(getUrl(vendor))
		.get(`/roles`)
		.query({
			filter: { name: { _eq: options.name } },
		})
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`);

	if (roleResponse.body.data.length > 0) {
		return roleResponse.body.data[0];
	}

	const response = await request(getUrl(vendor))
		.post(`/roles`)
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`)
		.send({ name: options.name, app_access: options.appAccessEnabled, admin_access: options.adminAccessEnabled });

	return response.body.data;
}

export type OptionsCreateUser = {
	token: string;
	email: string;
	password?: string;
	name?: string;
	role?: string;
	// Automatically removed params
	roleName?: string; // to generate role
};

export async function CreateUser(vendor: string, options: Partial<OptionsCreateUser>) {
	// Validate options
	if (!options.token) {
		throw new Error('Missing required field: token');
	}
	if (!options.email) {
		throw new Error('Missing required field: email');
	}

	if (options.roleName) {
		const roleResponse = await request(getUrl(vendor))
			.get(`/roles`)
			.query({
				filter: { name: { _eq: options.roleName } },
				fields: ['id', 'name'],
			})
			.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`);

		if (roleResponse.body.data.length === 0) {
			throw new Error(`Role ${options.roleName} does not exist`);
		}

		options.role = roleResponse.body.data[0].id;
		delete options.roleName;
	}

	// Action
	const response = await request(getUrl(vendor))
		.post(`/users`)
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`)
		.send(options);

	return response.body.data;
}

export type OptionsCreateCollection = {
	collection: string;
	meta?: any;
	schema?: any;
	fields?: any;
	// Automatically removed params
	primaryKeyType?: common.PrimaryKeyType;
};

export async function CreateCollection(vendor: string, options: Partial<OptionsCreateCollection>) {
	// Validate options
	if (!options.collection) {
		throw new Error('Missing required field: collection');
	}

	// Parse options
	const defaultOptions = {
		meta: {},
		schema: {},
		fields: [],
		primaryKeyType: 'integer',
	};

	options = Object.assign({}, defaultOptions, options);

	switch (options.primaryKeyType) {
		case 'uuid':
			options.fields.push({
				field: 'id',
				type: 'uuid',
				meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] },
				schema: { is_primary_key: true, length: 36, has_auto_increment: false },
			});
			break;
		case 'string':
			options.fields.push({
				field: 'id',
				type: 'string',
				meta: { hidden: false, readonly: false, interface: 'input' },
				schema: { is_primary_key: true, length: 255, has_auto_increment: false },
			});
			break;
		case 'integer':
		default:
			options.fields.push({
				field: 'id',
				type: 'integer',
				meta: { hidden: true, interface: 'input', readonly: true },
				schema: { is_primary_key: true, has_auto_increment: true },
			});
			break;
	}

	if (options.primaryKeyType) {
		delete options.primaryKeyType;
	}

	// Action
	const collectionResponse = await request(getUrl(vendor))
		.get(`/collections/${options.collection}`)
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`);

	if (collectionResponse.body.data) {
		return collectionResponse.body.data;
	}

	const response = await request(getUrl(vendor))
		.post(`/collections`)
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`)
		.send(options);

	return response.body.data;
}

export type OptionsDeleteCollection = {
	collection: string;
};

export async function DeleteCollection(vendor: string, options: OptionsDeleteCollection) {
	// Action
	const response = await request(getUrl(vendor))
		.delete(`/collections/${options.collection}`)
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`);

	return response.body;
}

export type OptionsDeleteField = {
	collection: string;
	field: string;
};

export async function DeleteField(vendor: string, options: OptionsDeleteField) {
	// Action
	const response = await request(getUrl(vendor))
		.delete(`/fields/${options.collection}/${options.field}`)
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`);

	return response.body;
}

export type OptionsCreateField = {
	collection: string;
	field: string;
	type: string;
	meta?: any;
	schema?: any;
};

export async function CreateField(vendor: string, options: OptionsCreateField) {
	// Parse options
	const defaultOptions = {
		meta: {},
		schema: {},
	};

	options = Object.assign({}, defaultOptions, options);

	// Action
	const collectionResponse = await request(getUrl(vendor))
		.get(`/fields/${options.collection}`)
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`);

	for (const field of collectionResponse.body.data) {
		if (field.field === options.field) {
			return field;
		}
	}

	const response = await request(getUrl(vendor))
		.post(`/fields/${options.collection}`)
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`)
		.send(options);

	return response.body.data;
}

export type OptionsCreateRelation = {
	collection: string;
	field: string;
	related_collection: string;
	meta?: any;
	schema?: any;
};

export async function CreateRelation(vendor: string, options: OptionsCreateRelation) {
	// Parse options
	const defaultOptions = {
		meta: {},
		schema: {},
	};

	options = Object.assign({}, defaultOptions, options);

	// Action
	const relationResponse = await request(getUrl(vendor))
		.get(`/relations/${options.collection}/${options.field}`)
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`);

	if (relationResponse.statusCode === 200) {
		return relationResponse.body.data;
	}

	const response = await request(getUrl(vendor))
		.post(`/relations`)
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`)
		.send(options);

	return response.body.data;
}

export type OptionsCreateFieldM2O = {
	collection: string;
	field: string;
	fieldMeta?: any;
	fieldSchema?: any;
	primaryKeyType?: common.PrimaryKeyType;
	otherCollection: string;
	relationMeta?: any;
	relationSchema?: any;
};

export async function CreateFieldM2O(vendor: string, options: OptionsCreateFieldM2O) {
	// Parse options
	const defaultOptions = {
		fieldMeta: {},
		fieldSchema: {},
		primaryKeyType: 'integer',
		relationMeta: {},
		relationSchema: {},
	};

	options = Object.assign({}, defaultOptions, options);

	const fieldOptions: OptionsCreateField = {
		collection: options.collection,
		field: options.field,
		type: options.primaryKeyType!,
		meta: options.fieldMeta ?? {},
		schema: options.fieldSchema ?? {},
	};

	if (!fieldOptions.meta.special) {
		fieldOptions.meta.special = ['m2o'];
	} else if (!fieldOptions.meta.special.includes('m2o')) {
		fieldOptions.meta.special.push('m2o');
	}

	// Action
	const field = await CreateField(vendor, fieldOptions);

	const relationOptions: OptionsCreateRelation = {
		collection: options.collection,
		field: options.field,
		meta: options.relationMeta,
		schema: options.relationSchema,
		related_collection: options.otherCollection,
	};

	const relation = await CreateRelation(vendor, relationOptions);

	return { field, relation };
}

export type OptionsCreateFieldO2M = {
	collection: string;
	field: string;
	fieldMeta?: any;
	otherCollection: string;
	otherField: string;
	primaryKeyType?: string;
	otherMeta?: any;
	otherSchema?: any;
	relationMeta?: any;
	relationSchema?: any;
};

export async function CreateFieldO2M(vendor: string, options: OptionsCreateFieldO2M) {
	// Parse options
	const defaultOptions = {
		fieldMeta: {},
		primaryKeyType: 'integer',
		otherMeta: {},
		otherSchema: {},
		relationMeta: {},
		relationSchema: {},
	};

	options = Object.assign({}, defaultOptions, options);

	const fieldOptions: OptionsCreateField = {
		collection: options.collection,
		field: options.field,
		type: 'alias',
		meta: options.fieldMeta,
		schema: null,
	};

	if (!fieldOptions.meta.special) {
		fieldOptions.meta.special = ['o2m'];
	} else if (!fieldOptions.meta.special.includes('o2m')) {
		fieldOptions.meta.special.push('o2m');
	}

	// Action
	const field = await CreateField(vendor, fieldOptions);

	const otherFieldOptions: OptionsCreateField = {
		collection: options.otherCollection,
		field: options.otherField,
		type: options.primaryKeyType!,
		meta: options.otherMeta,
		schema: options.otherSchema,
	};

	const otherField = await CreateField(vendor, otherFieldOptions);

	const relationOptions: OptionsCreateRelation = {
		collection: options.otherCollection,
		field: options.otherField,
		meta: { ...options.relationMeta, one_field: options.field },
		schema: options.relationSchema,
		related_collection: options.collection,
	};

	const relation = await CreateRelation(vendor, relationOptions);

	return { field, otherField, relation };
}

export type OptionsCreateItem = {
	collection: string;
	item: any;
};

export async function CreateItem(vendor: string, options: OptionsCreateItem) {
	// Action
	const response = await request(getUrl(vendor))
		.post(`/items/${options.collection}`)
		.set('Authorization', `Bearer ${common.USER.TESTS_FLOW.TOKEN}`)
		.send(options.item);

	return response.body.data;
}

// TODO
// export async function CreatePermissions() {}
// export async function UpdatePermissions() {}
// export async function DeletePermissions() {}
