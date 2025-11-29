const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

const ArticlesRoute = require("./Routers/Articles");


app.use(cors());
app.use(express.json());  

app.use("/api/articles", ArticlesRoute);



app.listen(process.env.PORT, () => {
    console.log(`Server running at ${process.env.PORT}`);
});
