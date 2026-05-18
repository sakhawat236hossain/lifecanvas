import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === "development") {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export const dbConnect = async (collectionName: string) => {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName).collection(collectionName);
};

export const collections = {
  memories: "memories",
  habits: "habits",
  goals: "goals",
  moods: "moods",
  journals: "journals",
  users: "users",
  achievements: "achievements"
};
