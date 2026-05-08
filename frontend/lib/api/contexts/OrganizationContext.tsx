export function OrganizationProvider() {
  return null;
}

export function useOrganization() {
  return {
    organizations: [],
    isLoading: false,
    error: null,
    loadOrganizations: async () => {},
    refresh: async () => {},
  };
}