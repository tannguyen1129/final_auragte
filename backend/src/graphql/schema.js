const { gql } = require("graphql-tag");

const typeDefs = gql`
  type User {
    id: ID!
    fullName: String!
    email: String!
    licensePlates: [String]
    role: String!
    vehicleType: String
  }

  type ParkingSession {
    id: ID!
    user: User!
    licensePlate: String!
    faceIdentity: String!
    checkinTime: String
    checkoutTime: String
    status: String
    vehicleType: String
  }

  type ParkingStats {
    totalCarSlots: Int!
    carIn: Int!
    carAvailable: Int!
    totalBikeSlots: Int!
    bikeIn: Int!
    bikeAvailable: Int!
  }

  type Query {
    me: User
    hello: String
    getAllSessions: [ParkingSession!]!
    getActiveSessions: [ParkingSession!]!
    getUserHistory(userId: ID!): [ParkingSession!]!
    getAllUsers: [User!]!
    getAllEmployees: [User!]! 

    parkingStats: ParkingStats!
    statsLogsByPeriod(period: PeriodType!): [LogStats!]!
  }

  input RegisterInput {
    fullName: String!
    email: String!
    password: String!
    role: String
    faceImages: [String!]!
    plateImage: String!
    licensePlates: [String!]
    vehicleType: String 
  }

  input UpdateUserInput {
    fullName: String
    email: String
    password: String
    licensePlates: [String!]
    role: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum PeriodType {
  DAY
  MONTH
  YEAR
}

type LogStats {
  label: String!
  totalIn: Int
  totalOut: Int
}

  type Mutation {
    registerUser(input: RegisterInput!): User!
    loginUser(email: String!, password: String!): AuthPayload!

     logEntry(faceImages: [String!]!, plateImage: String!, vehicleType: String): ParkingSession
    logExit(faceImage: String!, plateImage: String!): ParkingSession

    # (Optional) Giữ API cũ để tương thích ngược
    logEntryLegacy(image: String!): ParkingSession @deprecated(reason: "Use logEntry(faceImage, plateImage) instead")
    logExitLegacy(image: String!): ParkingSession @deprecated(reason: "Use logExit(faceImage, plateImage) instead")

    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
