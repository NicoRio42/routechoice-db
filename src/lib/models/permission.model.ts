import type { User } from 'lucia-auth';

export interface Permission<T> {
	get: PermissionFunction<T>;
	list: PermissionFunction<T[]>;
	create: CreatePermissionFunction<T>;
	update: PermissionFunction<T>;
	delete: PermissionFunction<T>;
}

type PermissionFunction<T> =
	| ((user: User) => boolean | Promise<boolean>)
	| ((user: User, result: T) => boolean | Promise<boolean>);

type CreatePermissionFunction<T> = (user: User) => boolean | Promise<boolean>;
