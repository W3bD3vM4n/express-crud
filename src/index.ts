import express from 'express';
import { AppDataSource } from './data-source.js';
import userRoutes from './routes/user.route.js';

// Swagger imports
import swaggerUi from 'swagger-ui-express';
import { generateOpenAPIDocument } from './utils/openapi-generator.js'

// Initialize the database connection
AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err);
    });

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Swagger Setup (by generator call)
const swaggerDocs = generateOpenAPIDocument();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Register API routes
app.use('/api', userRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});