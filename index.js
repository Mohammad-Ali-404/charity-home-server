const express = require('express')
const cors = require('cors')
const app = express();const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;

// const corsOptions = {
//     origin: "http://localhost:5173", // Replace with the origin of your frontend
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true,
//     optionsSuccessStatus: 204,
//  };
 
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e60xkn0.mongodb.net/?retryWrites=true&w=majority`;

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

    const causesCollection = client.db('charityHome').collection('trendingCauses')
    const causesDetailsCollection = client.db('charityHome').collection('causesDetails')
    const eventCollection = client.db('charityHome').collection('event')
    const newsCollection = client.db('charityHome').collection('news')
    const userCollection = client.db('charityHome').collection('users')
    const contactCollection = client.db('charityHome').collection('contacts')
    const paymentCollection =  client.db('charityHome').collection('payments')
    const socialMediaCollection =  client.db('charityHome').collection('social-media')

    // get all user data
    app.get('/user', async(req, res) =>{
        const user = userCollection.find();
        const result = await user.toArray()
        res.send(result)
    })

    // get all volunteer send email data
    app.get('/send-email', async(req, res) =>{
        const email = contactCollection.find();
        const result = await email.toArray()
        res.send(result)
    })

    // get all user send mail or contact data from client to backend
    app.post('/send-email', async(req, res) =>{
        const email = req.body;
        console.log(email)
        const result = await contactCollection.insertOne(email)
        res.send(result)
    })
    // get all user data from client to backend
    app.post('/users', async(req, res) =>{
        const user = req.body;
        console.log(user)
        const result = await userCollection.insertOne(user)
        res.send(result)
    })
    // get all user data update from client to backend
    app.post('/users-update', async(req, res) =>{
        const user = req.body;
        console.log(user)
        const result = await userCollection.insertOne(user)
        res.send(result)
    })

    // get all causes data
    app.get('/causes', async(req, res) =>{
        const causes = causesCollection.find();
        const result = await causes.toArray()
        res.send(result)
    })
    // added a single causes 
    app.post('/causes', async(req,res) =>{
        const addedCauses = req.body;
        console.log(addedCauses);
        const result = await causesCollection.insertOne(addedCauses);
        res.send(result)
    })
    // get all causes details data
    app.get('/causesdetails', async(req, res) =>{
        const causesDetails = causesDetailsCollection.find();
        const result = await causesDetails.toArray()
        res.send(result)
    })
    
    // get single causes details collection
    app.get('/causesdetails/:title', async (req, res) => {
        const title = req.params.title;
        console.log(title)
        const query = { title: title }; // Corrected syntax
        const user = await causesDetailsCollection.findOne(query);
        res.send(user);
    });
    
    // Create payment intent system
    app.post('/create-payment-intent', async (req, res) => {
        const { donationAmount } = req.body;
        const amount = donationAmount * 100;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card']
        });
        
        res.send({
            clientSecret: paymentIntent.client_secret
        });
        
      });


    //   Payment related api 
    app.post('/payments', async(req, res) =>{
        const payment = req.body;
        const result = await paymentCollection.insertOne(payment)
        res.send(result)
    })

    // get all payment history data
    app.get('/payment-history', async(req, res) =>{
        const payment = paymentCollection.find();
        const result= await payment.toArray();
        res.send(result)
    })
    // get all event data
    app.get('/event', async(req, res) =>{
        const event = eventCollection.find();
        const result= await event.toArray();
        res.send(result)
    })

    // get all event data
    app.get('/news', async(req, res) =>{
        const result = await newsCollection.find().toArray();
        res.send(result)
    })
        // get all social media details and update'
        app.post('/social-media', async (req, res) => {
            const socialMedia = req.body;
            console.log(socialMedia);
        
            // Check if social media data already exists
            const existingData = await socialMediaCollection.findOne();
        
            if (existingData) {
                // If data exists, remove the existing entry
                await socialMediaCollection.deleteOne();
            }
        
            // Insert the new social media data
            const result = await socialMediaCollection.insertOne(socialMedia);
            res.send(result);
        });
    // get social media data
    app.get('/social-media', async(req, res)=>{
        const result = await socialMediaCollection.find().toArray();
        res.send(result)
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



app.get('/', (req, res) =>{
    res.send('charity server in running')
})
app.listen(port, () =>{
    console.log(`charity server in running, ${port}`)
})