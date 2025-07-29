const express = require("express");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServer } = require("@apollo/server");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");

dotenv.config();

const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

const startServer = async () => {
  const app = express();

  await connectDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();

  // ✅ CORS & JSON body parsing – tăng giới hạn lên 200MB
  app.use(cors());
  app.use(express.json({ limit: "200mb" }));          // ✅ express.json với limit mới
  app.use(bodyParser.json({ limit: "200mb" }));       // ✅ nếu backend vẫn dùng body-parser

  // ✅ Apollo GraphQL middleware + JWT context
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization || "";
        const token = auth.replace("Bearer ", "");
        try {
          const user = jwt.verify(token, process.env.JWT_SECRET);
          return { user };
        } catch {
          return {};
        }
      },
    })
  );

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`✅ MongoDB connected`);
    console.log(`🚀 Apollo Server running at http://localhost:${PORT}/graphql`);
  });
};

startServer();
