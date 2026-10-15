// Structured problem statements are loaded as data; this repo does not compile MDX routes.
export function useMDXComponents<T extends Record<string, unknown>>(components: T): T {
  return components;
}
