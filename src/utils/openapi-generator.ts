import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { userRegistry } from '../routes/user.route.js';

// Create a local registry for components
const componentsRegistry = new OpenAPIRegistry();

// Register the security scheme component
componentsRegistry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
});

// Create a combined registry by passing all other registries to the constructor
const mainRegistry = new OpenAPIRegistry([
    componentsRegistry,
    userRegistry,
]);

const port = 3000;

export function generateOpenAPIDocument() {
    // Use the main combined registry to generate the document
    const generator = new OpenApiGeneratorV3(mainRegistry.definitions);

    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            title: 'CRUD API with Express',
            version: '1.0.0',
            description: 'A simple CRUD API for managing users',
        },
        servers: [
            {
                url: `http://localhost:${port}/api`, // Use your port and base path
            },
        ],

        // Security: Basic Auth
        // security: [
        //     {
        //         basicAuth: [], // Must match the name in securitySchemes
        //     },
        // ],

        // Security: JSON Web Tokens (JWT)
        security: [
            {
                bearerAuth: [],
            },
        ],
    });
}