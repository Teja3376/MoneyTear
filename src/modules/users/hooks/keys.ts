// Every users query key in one place, so mutations refresh exactly what they change.
export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
};
