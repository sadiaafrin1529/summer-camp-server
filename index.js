const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

//midelware

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('arts and crafts running..')
})
app.listen(port,()=>{
    console.log(`Arts & Crafts are running on port ${port}`);
})