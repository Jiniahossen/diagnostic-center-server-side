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
    const bookCollection = client.db('Diagnostic-center').collection('bookedTest')
    const recommCollection = client.db('Diagnostic-center').collection('recommendations')
    const bannerCollection = client.db('Diagnostic-center').collection('banners')

    //get recommendation post

    app.get('/recommendations', async (req, res) => {
      const item = await recommCollection.find().toArray();
      res.send(item);
    })

    //get recommendation post by id

    app.get('/recommendations/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await recommCollection.findOne(query)
      res.send(result);
    })




    //post users to database

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email, name: user.name };
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

    app.post('/tests', async (req, res) => {
      const test = req.body;
      const result = await testCollection.insertOne(test);
      res.send(result)
    })

    //get tests data from database

    app.get('/tests', async (req, res) => {
      const result = await testCollection.find().toArray();
      res.send(result)
    })

    app.get('/tests/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await testCollection.findOne(query)
      res.send(result)
    })

    app.delete('/tests/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await testCollection.deleteOne(filter);
      res.send(result);
    })


    //post booked data

    app.post('/book', async (req, res) => {
      const bookedItem = req.body;
      const result = await bookCollection.insertOne(bookedItem);
      res.send(result);
    })

    app.get('/book', async (req, res) => {
      const result = await bookCollection.find().toArray();
      res.send(result)
    })



    //get book items by email
    app.get('/book/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const userBookings = await bookCollection.find(query).toArray();
        res.json(userBookings);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });

    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollection.deleteOne(filter);
      res.send(result);
    })



    //update slots after booking

    //   app.patch('/tests/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const filter = { _id: new ObjectId(id) };
    //     const test = await testCollection.findOne(filter);

    //     if (test && typeof test.slots === 'string') {
    //         test.slots = parseInt(test.slots, 10);
    //     }

    //     const updateSlots = {
    //         $inc: {
    //             slots: -1,
    //         },
    //     };

    //     const result = await testCollection.updateOne(filter, updateSlots);
    //     res.send(result);
    // });


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


    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;

      // if (email !== req.decoded.email) {
      //     return res.status(403).send({ message: 'forbidden access' })
      // }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })



    //blocked user
    app.patch('/users/blocked/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: 'blocked'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    //get blocked users

    app.get('/users/blocked/:email', async (req, res) => {
      const email = req.params.email;

      // if (email !== req.decoded.email) {
      //     return res.status(403).send({ message: 'forbidden access' })
      // }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let blocked = false;
      if (user) {
        blocked = user?.status === 'blocked';
      }
      res.send({ blocked });
    })



    //banner data post to database

    app.post('/banners', async (req, res) => {
      const banner = req.body;
      const result = await bannerCollection.insertOne(banner);
      res.send(result);
    })


    //get banners data
    app.get('/banners', async (req, res) => {
      const banner = await bannerCollection.find().toArray();
      res.send(banner);
    })


    //delete banner data

    app.delete('/banners/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bannerCollection.deleteOne(filter);
      res.send(result);
    })



    // Update banner isActive status
    app.put('/banners/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      // Update the clicked banner to isActive: true
      const updatedBanner = await bannerCollection.updateOne(filter, { $set: { isActive: true } });

      // Set all other banners' isActive to false
      const updateOthers = await bannerCollection.updateMany(
        { _id: { $ne: new ObjectId(id) } },
        { $set: { isActive: false } }
      );

      res.send({ updatedBanner, updateOthers });
    });




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