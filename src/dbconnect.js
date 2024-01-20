import { MongoClient, ServerApiVersion } from 'mongodb';
import {connection} from '../secret.js'

// const connectionString = process.env.ATLAS_URI || "";
const client = new MongoClient(connection);
let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}
let db = conn.db("ticketing-system");
export default db;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// export const client = new MongoClient(connection, {
    // serverApi: {
    //   version: ServerApiVersion.v1,
    //   strict: true,
    //   deprecationErrors: true,
    // }
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     serverApi: ServerApiVersion.v1,
// });
// async function run() {
//     try {
//       // Connect the client to the server	(optional starting in v4.7)
//       await client.connect();
//       // Send a ping to confirm a successful connection
//       await client.db("ticketing-system").command({ ping: 1 });
//       console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//       // Ensures that the client will close when you finish/error
//       await client.close();
//     }
// }
// run().catch(console.dir);