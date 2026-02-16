const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const dotenv=require('dotenv');
const app=express();
//midlewares
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: ['http://localhost:3000'], // Allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true // Allow cookies/auth headers
}));
const port=process.env.PORT;
//database connection

const main=async()=>{
  await mongoose.connect(process.env.MONGODB_URL)
}

main().then(()=>{
    console.log("connected succesfully to the database")
}).catch((err)=>{
    console.log(err)
});

app.listen(port,()=>{
    console.log("server running on ",port);
})
