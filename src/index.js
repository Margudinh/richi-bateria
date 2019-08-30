import express from 'express';
import * as bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import session from 'express-session';
import * as fs from 'fs';
import * as paypal from 'paypal-rest-sdk';

// setting up paypal stuff refactor this later
const PAYPAL_SECRET = fs.readFileSync(path.join(__dirname, '../paypal.secret.key')).toString();
const PAYPAL_CLIENT = fs.readFileSync(path.join(__dirname, '../paypal.client.key')).toString();

paypal.configure({
    'mode': 'sandbox',
    'client_id': PAYPAL_CLIENT,
    'client_secret': PAYPAL_SECRET
}); 

// create express instance
const app = express();

const products = [
    {
        title: "Food 1",
        description: "lorem asdasdajsd alkjsdlakdsj askdljadj salkjsdlkads",
        img: "http://lorempixel.com/300/300/food/",
        price: 20.00
    },{
        title: "Food 2",
        description: "lorem ipsum dolor sit amet",
        img: "http://lorempixel.com/300/300/food/",
        price: 30.00
    }
];

// setup engine
nunjucks.configure( path.join(__dirname, '../views') ,{
    express: app,
    watch: true,
});

// setup express middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: fs.readFileSync(path.join(__dirname, '../secret.key')).toString(),
    resave: false,
    saveUninitialized: false
}));

// setup default stuff to send to templates
app.use((req, res, next) =>{
    res.locals.title = 'Hey there';
    res.locals.isLoggedIn = req.session.isLoggedIn;
    next();
})

app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/productos', (req, res) => {
    res.render('productos.html',{products: products});
});

app.get('/checkout', (req,res) => {

    let total = 0;
    for(let p of products){
        total += p.price;
    }

    res.render('checkout.html', {products, total});
});

app.post('/checkout', (req, res) => {
    
    // getting the total
    let total = 0;
    for(let p of products){
        total += p.price;
    }


    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:5000/success",
            "cancel_url": "http://localhost:5000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Test",
                    "sku": "01",
                    "price": "" + total,
                    "currency": "MXN",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "MXN",
                "total": "" + total 
            },
            "description": "This is the payment description."
        }]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
        if(error){
            console.log(error);
            throw error;
        }else{
            console.log("create payment");
            //console.log(payment);

            for(let link of payment.links){
                if(link.rel === 'approval_url'){
                    res.redirect(link.href);
                }
            }
        }
    });
});

app.get('/success', (req,res) => {

    let total = 0;
    for(let p of products){
        total += p.price;
    }

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "MXN",
                "total": "" + total
            }
        }]
    }

    paypal.payment.execute(paymentId, execute_payment_json, (error, payment)=> {
        if(error){
            console.log(error);
            throw error;
        }else{
            res.render('success.html');
        }
    });

    
});

// creating db connection
createConnection()
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () =>{
            console.log(`Server started at http://localhost:${PORT}`);
        })
    })
    .catch(err =>{
        console.log(err);
    });



