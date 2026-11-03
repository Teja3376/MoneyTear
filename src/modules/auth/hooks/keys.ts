// Every auth query key in one place, so mutations refresh exactly what they change.
export const authKeys = {
  all: ["auth"] as const,
  state: () => [...authKeys.all, "state"] as const,
};
