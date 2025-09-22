import express from 'express';
import { AppDataSource } from './data-source.js';
import userRoutes from './routes/UserRoutes.js';

// Swagger imports
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Initialize the database connection
AppDataSource.initialize()
    .then(() => {
        console.log('✅ Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('❌ Error during Data Source initialization:', err);
    });

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Swagger Options
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'CRUD API with Express and TypeORM',
            version: '1.0.0',
            description: 'A simple CRUD API for managing users.',
        },
        servers: [
            {
                url: `http://localhost:${port}/api`,
            },
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        name: {
                            type: 'string',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Register API routes
app.use('/api', userRoutes);

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📚 Swagger docs available at http://localhost:${port}/api-docs`);
});