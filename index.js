const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const stripe = require("stripe")(process.env.PAYEMNT_KEY);
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//midelware

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mhchwsf.mongodb.net/?retryWrites=true&w=majority`;
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
    const usersCollecion = client.db("ArtssCraft").collection("users");
    const courseCollecion = client.db("ArtssCraft").collection("courses");
    const cartColleection= client.db("ArtssCraft").collection("selectcourse");
    const paymentCollection = client.db("ArtssCraft").collection("payments")


    
    app.get('/users', async (req, res) => {
      const result = await usersCollecion.find().toArray();
      res.send(result)
  })
    app.get('/users/personalData', async (req, res) => {
      const email= req.query.email;
      const result = await usersCollecion.findOne({email:email});
      res.send(result)
  })



    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = {email: user.email}
      const existingUser = await usersCollecion.findOne(query);
      if(existingUser){
        return res.send({message : 'user already exists'})
      }
      const result = await usersCollecion.insertOne(user);
      res.send(result);
    })

    app.patch('/users/admin/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set:{
          role: 'admin'
        },
      };

      const result = await usersCollecion.updateOne(filter,updateDoc);
      res.send(result)

    })
    app.patch('/users/instructor/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set:{
          role: 'instructor'
        },
      };

      const result = await usersCollecion.updateOne(filter,updateDoc);
      res.send(result)

    })
    app.get("/users/role/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollecion.findOne(query);
      res.send({ isRole: user?.role });
    });


   //   //courses
    app.get('/courses', async (req, res) => {
      const result = await courseCollecion.find({}).toArray()
      res.send(result)
    })
    app.post('/courses', async (req, res) => {
      const newCourse = req.body;
      const result = await courseCollecion.insertOne(newCourse)
      res.send(result)

    })
    app.patch('/courses/approved/:id', async (req, res) => {
      const id = req.params.id;
      const filterData = { _id: new ObjectId(id)};
      const updateDoc = { $set: { status: "approved" } };
  
      const result = await courseCollecion.updateOne(filterData, updateDoc);
      // console.log(result)
      res.send(result)
    
  });

  app.patch('/courses/denied/:id',async(req,res)=>{
    const id = req.params.id;
    const filterData = {_id: new ObjectId(id)};
    const updateDoc = {
      $set: {status: "denied"}
    }
    const result = await courseCollecion.updateOne(filterData,updateDoc)
    res.send(result);
  })


  app.patch('/courses/feedback/:id',async(req,res)=>{
    const id = req.params.id;
    const info= req.body;
    const filterData = {_id: new ObjectId(id)}
    const updateDoc ={
      $set:{
        feedback: info,
      }
    }
    const result = await courseCollecion.updateOne(filterData,updateDoc)
    res.send(result);
  })

  app.get('/courses/myclass/:email', async(req,res)=>{
    const email = req.params.email
    const query = {Email:email}
    // console.log(query)
    const result = await courseCollecion.find(query).toArray()
    res.send(result);
    // console.log(result)
    })



  app.get('/dashboard/edit/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {_id:new ObjectId(id)}
    const result =await courseCollecion.findOne(query)
    res.send(result)
  })

  

  app.put('/courses/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    // console.log(id, data);
    const query = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        ...data
      }
    };
    const result = await courseCollecion.updateOne(query, updateDoc); 
    // console.log(result)
    res.send(result);
  });


  app.delete('/courses/deletecourse/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {_id:new ObjectId(id)}
    const reuslt = await courseCollecion.deleteOne(query)
    res.send(reuslt)
  })

  //selectcourse
  app.post('/addcart',async(req,res)=>{
    const data = req.body;
    const result=await cartColleection.insertOne(data)
    res.send(result)

  })

  app.get('/addcart/:email',async(req,res)=>{
    const email= req.params.email

    const query={userEmail:email}
    const result= await cartColleection.find(query).toArray()
    res.send(result)
  })


  //Payment
  app.get('/addcart/payment/:id',async (req,res)=>{
    const id = req.params.id 
    console.log(id)
    const query = {_id:new ObjectId(id)}
    const result = await cartColleection.findOne(query)
    res.send(result)
    // console.log(result)
  })

  app.post('/payments',async(req,res)=>{
    const info = req.body
    const id = info.payment
    const query = {_id:new ObjectId(id)}
    const result = await paymentCollection.insertOne(info)

    const deleteResult = await cartColleection.deleteOne(query)
    res.send({result,deleteResult})
  })


app.get('/payments/:email',async(req,res)=>{
  const email = req.params.email
  const query = {email:email}
  const result = await paymentCollection.find(query).toArray()
  res.send(result)
})

app.post("/create-payment-intent", async (req, res) => {
  const { price } = req.body;
  const amount = price * 100;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    payment_method_types: ["card"],
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






















app.get('/', (req, res) => {
  res.send('arts and crafts running..')
})
app.listen(port, () => {
  console.log(`Arts & Crafts are running on port ${port}`);
})