const express = require("express")
const cors = require("cors")
const bodyParser = require('body-parser')
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://shihabmilky1:shihabmilky1@cluster0.4czm1.mongodb.net/Bazar?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = 'bkash61cc86d7b05d4'
const store_passwd = 'bkash61cc86d7b05d4@ssl'
const is_live = false //true for live, false for sandbox





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
    app.post('/orders', (req, res) => {

        customersOrders.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.post('/payments', (req, res) => {
        let { id, total } = req.body;
        console.log(total);
        const payment = stripe.paymentIntents.create({
            amount: total.totalAmount * 100,
            currency: 'usd',
            description: 'Internet Service',
            payment_method: id,
            confirm: true,
        })
        if (payment) {
            res.json({
                message: 'Payment Successful',
                success: true,
            })
        }
        else {
            res.json({
                message: 'Payment Unsuccessful',
                success: false,
            })
        }

    })

    app.get('/bkash-checkout', (req, res) => {
        const data = {
            total_amount: 1,
            currency: 'USD',
            tran_id: 'REF123', // use unique tran_id for each api call
            success_url: 'http://localhost:5000/success',
            fail_url: 'http://localhost:5000/fail',
            cancel_url: 'http://localhost:5000/cancel',
            ipn_url: 'http://localhost:5000/ipn',
            shipping_method: 'Courier',
            product_name: 'Computer.',
            product_category: 'Electronic',
            product_profile: 'general',
            cus_name: 'Customer Name',
            cus_email: 'customer@example.com',
            // cus_add1: 'Dhaka',
            // cus_add2: 'Dhaka',
            // cus_city: 'Dhaka',
            // cus_state: 'Dhaka',
            // cus_postcode: '1000',
            // cus_country: 'Bangladesh',
            cus_phone: '01711111111',
            ship_name: 'Customer Name',
            ship_add1: 'Dhaka',
            ship_country: 'Bangladesh',
        };
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
        sslcz.init(data).then(apiResponse => {
            // Redirect the user to payment gateway
            let GatewayPageURL = apiResponse.GatewayPageURL
            res.redirect(GatewayPageURL)
            console.log('Redirecting to: ', GatewayPageURL)
        });
    })
    app.post('/bkash-success', (req, res) => {
        res.redirect('http://localhost:3000/success')
    })

    app.post('/userOrder', (req, res) => {
        customersOrders.find({ userEmail: req.body.email })
            .toArray((err, doc) => {
                res.send(doc)
            })
    })
    app.get('/orderDetail/:id', (req, res) => {
        customersOrders.find({ _id: ObjectId(req.params.id) })
            .toArray((err, doc) => {
                res.send(doc)
            })
    })
    app.post('/saveUser', (req, res) => {
        saveUser.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/myUser', (req, res) => {
        if (req.query.email === 'shihabmilky1@gmail.com' && req.query.pass === 'shihabmilky1@') {
            saveUser.find({}).toArray((err, doc) => {
                res.send(doc)
            })
        }
        else {
            res.status(403).send('rejected')
        }

    })

});

app.listen(process.env.PORT || 5000, () => console.log('hi'))