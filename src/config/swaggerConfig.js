const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'EasyLocker API',
            version: '1.0.0',
        },
    },
    apis: ['./src/routes/*.js'], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(swaggerOptions);

const fs = require('fs');

fs.writeFileSync("apiaryJson", JSON.stringify(openapiSpecification));

const configureSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve);
    app.get('/api-docs', swaggerUi.setup(openapiSpecification));
}

module.exports = configureSwagger;