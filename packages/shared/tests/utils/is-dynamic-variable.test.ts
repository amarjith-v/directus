import { isDynamicVariable } from '../../src/utils/is-dynamic-variable';

const tests: [string, boolean][] = [
	['$NOW', true],
	['$NOW(- 1 year)', true],
	['test', false],
	['$CUSTOM', false],
	['$CURRENT_USER', true],
	['$CURRENT_ROLE', true],
	['$CURRENT_USER.role.name', true],
	['$CURRENT_ROLE.users.id', true],
];

describe('is extension type', () => {
	for (const [value, result] of tests) {
		it(value, () => {
			expect(isDynamicVariable(value)).toBe(result);
		});
	}
});
