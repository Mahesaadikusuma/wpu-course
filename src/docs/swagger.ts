
import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "v0.0.1",
        title: "Documentation Api Acara WPU",
        description: "Documentation Api Acara WPU"
    },
    servers: [
        {
            url: "http://localhost:3000/api",
            description: "Local server"
        },
        {
            url: "https://wpu-course-three.vercel.app/api",
            description: "Production server"
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
            }
        },
        schemas: {
            LoginRequest: {
                identifier: "Mahesa",
                password: "123456"
            }
        }
    }
}

const outputFile = "./swagger-output.json";
const endpointFiles = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointFiles, doc);