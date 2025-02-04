import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import db from "./utils/database";



async function init() {
    try {
        // connect to database baru masuk ke dalam server
        const result = await db();

        console.log("database status: ", result);
        const app = express();
        // BodyParser itu harus diatas router jika tidak akan error
        app.use(bodyParser.json());


        const port = 3000;


        app.use('/api', router)

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

    } catch (error) {
        console.log(error);
    }
}

init();