const userResolvers = require("./user");
const sessionResolvers = require("./session");
const parkingResolvers = require("./parking");

module.exports = {
  Query: {
    ...userResolvers.Query,
    ...sessionResolvers.Query,
    ...parkingResolvers.Query, 
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...sessionResolvers.Mutation,
    // Không có mutation cho parking → bỏ qua
  }
};
