export const queryKeys = {
  packages: {
    list: (params = {}) => ["packages", "list", params],
  },
  bookings: {
    list: (params = {}) => ["bookings", "list", params],
  },
  reviews: {
    reviewable: (params = {}) => ["reviews", "reviewable", params],
  },
  points: {
    summary: () => ["points", "summary"],
  },
  coupons: {
    list: (params = {}) => ["coupons", "list", params],
  },
  users: {
    logs: (params = {}) => ["users", "logs", params],
  },
  planner: {
    list: (params = {}) => ["planner", "list", params],
  },
  suggestions: {
    list: (params = {}) => ["suggestions", "list", params],
  },
};
