export const queryKeys = {
  packages: {
    list: (params = {}) => ["packages", "list", params],
  },
  bookings: {
    list: (params = {}) => ["bookings", "list", params],
  },
  planner: {
    list: (params = {}) => ["planner", "list", params],
  },
  suggestions: {
    list: (params = {}) => ["suggestions", "list", params],
  },
};
