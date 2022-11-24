import type { User } from "firebase/auth";
import { writable } from "svelte/store";

const userStore = writable<User | null | undefined>();

export async function isAdmin(user: User): Promise<boolean> {
  const token = await user.getIdTokenResult();
  return token.claims?.admin;
}

export function createUserLoggedInPromise(
  userCallback?: (user: User) => Promise<boolean>
): Promise<boolean> {
  return new Promise((resolve) => {
    const unsubscribeRef: Function[] = [];

    function unsubscribe() {
      if (unsubscribeRef.length === 0) return;

      unsubscribeRef[0]();
      unsubscribeRef.pop();
    }

    unsubscribeRef.push(
      userStore.subscribe(async (value) => {
        if (value === undefined) {
          return;
        }

        if (value === null) {
          resolve(false);
          unsubscribe();
          return;
        }

        if (userCallback === undefined) {
          resolve(true);
          unsubscribe();
          return;
        }

        const shouldAllow = await userCallback(value);

        if (shouldAllow) {
          resolve(true);
          unsubscribe();
          return;
        }

        resolve(false);
        unsubscribe();
      })
    );
  });
}

export default userStore;
