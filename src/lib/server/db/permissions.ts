import { RolesEnum } from '$lib/models/enums/roles.enum';
import type { Permission } from '$lib/models/permission.model';
import type { User } from 'lucia-auth';
import type { Todo } from './schema';

export const todoPermissions: Permission<Todo> = {
	get: (user: User, todo: Todo) => user.role === RolesEnum.Enum.admin || user.id === todo.userId,
	list: (user: User, todos: Todo[]) =>
		user.role === RolesEnum.Enum.admin || todos.every((todo) => user.id === todo.userId),
	create: (user: User) => true,
	delete: (user: User, todo: Todo) => user.role === RolesEnum.Enum.admin || user.id === todo.userId,
	update: (user: User, todo: Todo) => user.role === RolesEnum.Enum.admin || user.id === todo.userId
};
