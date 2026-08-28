export const FIRESTORE = {
  COLLECTIONS: {
    DEFAULT_HOURS: "default_hours",
    BUFOST_SERVICES: "bufost_services",
  },
  FIELDS: {
    DATE: "date",
  },
  OPERATORS: {
    DOUBLE_EQUALS: "==",
  },
  ORDER_BY: {},
  DIRECTION: {
    DESC: "desc",
    ASC: "asc",
  },
  DB: "medixenter-db",
} as const;
export default FIRESTORE;
