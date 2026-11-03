// Every security query key in one place, so mutations refresh exactly what they change.
export const securityKeys = {
  all: ["security"] as const,
  pinStatus: () => [...securityKeys.all, "pinStatus"] as const,
};
