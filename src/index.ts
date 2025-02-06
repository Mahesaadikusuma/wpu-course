import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import cors from "cors";
import db from "./utils/database";
import docs from "./docs/route";



async function init() {
    try {
        // connect to database baru masuk ke dalam server
        const result = await db();

        console.log("database status: ", result);
        const app = express();
        // BodyParser itu harus diatas router jika tidak akan error
        app.use(cors());
        app.use(bodyParser.json());


        const port = 3000;

        app.get('/', (req, res) => {
            res.status(200).json({
                message: "server is running"
            })
        })

        app.use('/api', router)
        docs(app);

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

    } catch (error) {
        console.log(error);
    }
}

init();