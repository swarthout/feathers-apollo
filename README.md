# feathers-apollo

> feathers apollo integration

## About

This is my first attempt at building an app with [Apollo Server](http://www.apollostack.com/). 
This project uses [Feathers](http://feathersjs.com) to provide key features in a simple and easy to use way.

Unique aspects of this approach for building Apollo Servers:


1. Feathers cli tool to generate boilerplate and new services

2. JWT based auth

3. Permissions via feathers hooks (user can only remove and modify own posts, etc.)

4. No code was manually written for database services

5. Consistent query syntax independent of database (I could change the database from Mongo to SQL with no change to the resolvers)

6. Automatic REST endpoint generation (it is nice to have REST as a fallback or for public facing APIs)

7. Express compliant (use any Express middleware without hacks)

8. Automatic Socket.io integration (way to use websockets for real-time features before Apollo's solution is completed)

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies
    
    ```
    cd path/to/feathers-apollo; npm install
    ```

3. Start your app
    
    ```
    npm start
    ```
