import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { db } from '$lib/server/db/db.js';
import { user as userTable } from '$lib/server/db/schema.js';
import { asc, like, or } from 'drizzle-orm';

const PAGE_SIZE = 20;

export async function load({ locals, url }) {
	redirectIfNotAdmin(locals.user);

	const pageNumber = getPageNumberFromSearchParams(url.searchParams);

	let selectClause = db
		.select({
			id: userTable.id,
			firstName: userTable.firstName,
			lastName: userTable.lastName,
			email: userTable.email,
			emailVerified: userTable.emailVerified,
			role: userTable.role,
			passwordExpired: userTable.passwordExpired
		})
		.from(userTable)
		.orderBy(asc(userTable.lastName), asc(userTable.firstName))
		.limit(PAGE_SIZE + 1)
		.offset((pageNumber - 1) * PAGE_SIZE);

	const search = url.searchParams.get('search');

	const selectClauseWithWhere =
		search !== null && search !== ''
			? selectClause.where(
					or(like(userTable.firstName, `%${search}%`), like(userTable.lastName, `%${search}%`))
				)
			: selectClause;

	const users = await selectClauseWithWhere.all();

	const isLastPage = users.length !== PAGE_SIZE + 1;

	if (!isLastPage) {
		users.pop();
	}

	return { users, pageNumber, isLastPage, user: locals.user };
}

function getPageNumberFromSearchParams(searchParams: URLSearchParams) {
	const pageNumberStr = searchParams.get('pageNumber');
	if (pageNumberStr === null) return 1;
	const pageNumber = parseInt(pageNumberStr, 10);
	if (isNaN(pageNumber) || pageNumber < 1) return 1;
	return pageNumber;
}
