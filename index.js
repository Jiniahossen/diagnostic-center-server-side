const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


//middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lcpkzlk.mongodb.net/?retryWrites=true&w=majority`;

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

    const userCollection = client.db('Diagnostic-center').collection('users')
    const testCollection = client.db('Diagnostic-center').collection('tests')



    //post users to database

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email, name:user.name };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already in use', insertedId: null })
      }
     
      const result = await userCollection.insertOne(query);

      res.send(result)
    })


    //get all users

    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    })



    //delete a user

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })



    //post test

    app.post('/tests',async(req,res)=>{
      const test=req.body;
      const result=await testCollection.insertOne(test);
      res.send(result)
    })

    //get tests data from database

    app.get('/tests',async(req,res)=>{
      const result=await testCollection.find().toArray();
      res.send(result)
    })

    app.get('/tests/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await testCollection.findOne(query)
      res.send(result)
    })


    //update user to admin

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
















    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);










app.get('/', async (req, res) => {
  res.send('Diagnostic center server is running');
})

app.listen(port, async (req, res) => {
  console.log(`Sever is running at port :${port}`)
})