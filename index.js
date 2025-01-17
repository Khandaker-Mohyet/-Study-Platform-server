require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middlewar
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.47f5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const UserCollection = client.db('StudyPlatform').collection('users')
    const StudyCollection = client.db('StudyPlatform').collection('studySection')
    const BookCollection = client.db('StudyPlatform').collection('book')

    // users Collection

    app.get('/users', async (req, res) => {
      const result = await UserCollection.find().toArray()
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const users = req.body;
      const query = { email: users.email }
      const existingUser = await UserCollection.findOne(query);
      if (existingUser) {
        return res.send({message: 'user already exists', insertedId: null})
      }
      const result = await UserCollection.insertOne(users);
      res.send(result)
    })





    app.get('/studySection', async (req, res) => {
      const cursor = StudyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/studySection/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await StudyCollection.findOne(query)
      res.send(result)
    })

    // Book

    app.get('/book', async (req, res) => {
      const result = await BookCollection.find().toArray()
      res.send(result)
    })

    app.post('/book', async (req, res) => {
      const book = req.body;
      const result = await BookCollection.insertOne(book);
      res.send(result)
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Khandaker Work station')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})