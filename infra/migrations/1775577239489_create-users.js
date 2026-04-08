export const up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
    },
    username: {
      // For reference, Github limits usernames to 39 characters.
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
  });
};
