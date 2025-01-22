require('dotenv').config()
const express = require('express')
const fileUpload = require("express-fileupload");
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middlewar
app.use(cors())
app.use(express.json())
app.use(fileUpload());



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
    const ReviewCollection = client.db('StudyPlatform').collection('review')
    const MaterialCollection = client.db('StudyPlatform').collection('materials')
    const NotesCollection = client.db('StudyPlatform').collection('notes')

    // users Collection

    app.get('/users', async (req, res) => {
      const search = req.query.search || '';
      const query = {
        displayName: { $regex: search, $options: 'i' },
      };
      const result = await UserCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await UserCollection.findOne(query);
      res.send(result)
    });

    app.post('/users', async (req, res) => {
      const users = req.body;
      const query = { email: users.email }
      const existingUser = await UserCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await UserCollection.insertOne(users);
      res.send(result)
    })

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await UserCollection.updateOne(filter, updateDoc)
      res.send(result);
    })

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await UserCollection.deleteOne(query)
      res.send(result)
    })




    // Study Section

    // **Get all study sessions with pagination**
    
    app.get('/studySection', async (req, res) => {
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 6; 
      const skip = (page - 1) * limit; 

      const total = await StudyCollection.countDocuments(); of items
      const result = await StudyCollection.find().skip(skip).limit(limit).toArray();

      res.send({
        data: result,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    });


    // **Get study sessions by tutor's email**
    app.get('/studySection/:email', async (req, res) => {
      const email = req.params.email;
      const query = { tutorEmail: email };
      const result = await StudyCollection.find(query).toArray();
      res.send(result);
    });

    // **Get a single study session by ID**
    app.get('/studySection/single/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await StudyCollection.findOne(query);
      res.send(result);
    });

    // **Add a new study session**
    app.post('/studySection', async (req, res) => {
      const study = req.body;
      const result = await StudyCollection.insertOne(study);
      res.send(result);
    });

    // **Approve a study session**
    app.patch('/studySection/approve/:id', async (req, res) => {
      const id = req.params.id;
      const { fee } = req.body; // Fee information
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'approved',
          fee: fee || 0, // Default to 0 if not provided
        },
      };
      const result = await StudyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // **Reject a study session (update status to "rejected")**
    app.patch('/studySection/reject/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "rejected",
        },
      };
      const result = await StudyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    // **Update a study session (optional for admin)**
    app.patch('/studySection/update/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: updatedData,
      };
      const result = await StudyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // **Delete a study session**
    app.delete('/studySection/delete/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await StudyCollection.deleteOne(filter);
      res.send(result);
    });


    // review

    // Review Collection (POST API)
    app.post('/review', async (req, res) => {
      try {
        const review = req.body;
        const result = await ReviewCollection.insertOne(review);
        res.send(result);
      } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).send({ error: "Failed to add review" });
      }
    });







    //materials

    app.get('/materials', async (req, res) => {
      const cursor = MaterialCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/materials/single/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await MaterialCollection.findOne(query);
      res.send(result);
    });

    app.get('/materials/studySession/:id', async (req, res) => {
      const id = req.params.id;
      const query = { studySessionId: (id) };
      const result = await MaterialCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/materials/:email', async (req, res) => {
      const email = req.params.email;
      const query = { tutorEmail: email };
      const result = await MaterialCollection.find(query).toArray();
      res.send(result);
    });



    app.post("/materials", async (req, res) => {
      try {
        const { title, studySessionId, tutorEmail, link } = req.body;

        if (!title || !studySessionId || !tutorEmail || !link) {
          return res.status(400).send({ message: "All fields are required." });
        }
        const material = {
          title,
          studySessionId,
          tutorEmail,
          link,
          uploadDate: new Date(),
        };
        const result = await MaterialCollection.insertOne(material);
        res.status(201).send({ insertedId: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to upload material." });
      }
    });

    app.delete("/materials/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await MaterialCollection.deleteOne(query);
      res.send(result)
    })

    app.put("/materials/update/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { title, studySessionId, tutorEmail, link } = req.body;

        if (!title || !studySessionId || !tutorEmail || !link) {
          return res.status(400).send({ message: "All fields are required." });
        }

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            title,
            studySessionId,
            tutorEmail,
            link,
            updatedAt: new Date(),
          },
        };

        const result = await MaterialCollection.updateOne(filter, updateDoc);

        if (result.modifiedCount > 0) {
          res.status(200).send({ message: "Material updated successfully." });
        } else {
          res.status(404).send({ message: "Material not found or no changes made." });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to update material." });
      }
    });






    // note

    app.get('/notes', async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.status(400).send({ message: "Email is required." });
      }

      const query = { email: email };
      try {
        const notes = await NotesCollection.find(query).toArray();
        res.send(notes);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to fetch notes." });
      }
    });

    app.post('/notes', async (req, res) => {
      const note = req.body;

      if (!note.email || !note.title || !note.description) {
        return res.status(400).send({ message: "All fields are required." });
      }

      note.createdAt = new Date(); // Add timestamp

      try {
        const result = await NotesCollection.insertOne(note);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to create note." });
      }
    });

    app.delete('/notes/:id', async (req, res) => {
      const id = req.params.id;

      try {
        const query = { _id: new ObjectId(id) };
        const result = await NotesCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to delete note." });
      }
    });

    app.put('/notes/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      try {
        const query = { _id: new ObjectId(id) };
        const update = {
          $set: {
            title: updatedData.title,
            description: updatedData.description,
          },
        };

        const result = await NotesCollection.updateOne(query, update);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to update note." });
      }
    });






    // Book

    app.get('/book/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await BookCollection.find(query).toArray();
      res.send(result)
    });


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