const express = require("express")
const cors = require("cors")
const bodyParser = require('body-parser')
require('dotenv').config();

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://shihabmilky1:shihabmilky1@cluster0.4czm1.mongodb.net/Bazar?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const stripe = require('stripe')("sk_test_51IeGgvCvYK065ALoE1Ql7FJpupSquqdVorHXmoOKuRiD62BQ1FCu5YBAB7yCnzevVvbWtTetEfDKQH5tFAXFLOfT004inC5BJJ")
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Working')
})
client.connect(err => {
    const admin = client.db("Bazar").collection("admin");
    const customersOrders = client.db("Bazar").collection("customersOrders");
    const saveUser = client.db("Bazar").collection("saveUser");
    //Admin
    app.get('/isAdmin', (req, res) => {
        console.log(req.query.email)
        admin.find({ email: req.query.email })
            .toArray((err, doc) => {
                if (doc.length !== 0) {
                    res.json({ isAdmin: true, permission: true, message: 'Permission Granted', email: doc[0].email }).status(200)
                }
                else {
                    res.json({ isAdmin: false, permission: false, message: 'Permission Denied', email: '' }).status(403)
                }
            })
    })
    app.post('/Order', (req, res) => {
        customersOrders.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.post('/payments', (req, res) => {
        let { id, cart } = req.body;
        const total = cart.reduce((total, cart) => total + cart.price, 0)
        const discount = cart.reduce((discount, cart) => discount + cart.discount, 0)
        const totalAmount = total - discount;
        const payment = stripe.paymentIntents.create({
            amount: totalAmount * 100,
            currency: 'usd',
            description: 'Internet Service',
            payment_method: id,
            confirm: true,
        })
        console.log(payment);
        res.json({
            message: 'Payment Successful',
            success: true,
        })
    })

    app.post('/saveUser', (req, res) => {
        saveUser.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

});

app.listen(process.env.PORT || 3001)