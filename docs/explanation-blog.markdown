# The Eagle Has Landed

*Special thanks to Sashko Stubailo for reviewing this post and for asking me to write this! Check out his amazing work in the [Apollo Stack GitHub](https://github.com/apollostack)*

Over the past year, the Javascript ecosystem has seen an explosion of new technologies and ideas. We are now seeking to follow new best practices like deconstructing our monoliths of old into modern microservices, and replacing our traditional REST endpoints with GraphQL. How do we take amazing technology like Express and GraphQL-JS, and useful design patterns like service-oriented design and client specified queries, and simplify them so everyone can use them in their technology stack? How do we give structure to these technologies so developers can't help but build their apps in organized and scalable ways? Enter Feathers and Apollo Server.

## Apollo Server

Simply put, Apollo Server is a set of packages that let developers write GraphQL Node.js servers. In contrast to Facebook's GraphQL-JS implementation, Apollo Server uses GraphQL type language to let developers write their schema with an intuitive DSL. Also, Apollo separates the query resolvers from the application schema, which makes code clearer overall.

## Current Challenges

Although Apollo Server has a few opinions for structuring a GraphQL server, it leaves many aspects to the developer. This is intentional, but leaves a number of questions unanswered. For example, while Apollo Server gives the option to provide connectors to bringing data into your resolve functions, there is no consistent query syntax for them and the APIs of your various connectors will vary based on what data they provide, or what backing store they use. A connector for MongoDB will probably look different from one for a third-party REST endpoint. This means a developer needs to know many different querying syntaxes for their connectors, or write their own adapters for each backing store to make their connectors consistent. This can be a lot of work and a number of thoughtful design choices must be made for this to work well. Also, there is authentication. Apollo Server provides a few examples in their documentation of how to get authentication tokens into your app, but it is left to the developer to wrangle with passport or some other authentication library and implement secure authentication. This sounds like something I don't want to have to deal with. Furthermore, there has been a lot of talk lately about how to do authorization in GraphQL, and right now there are only a few things people in the community agree upon:
1. It is not easy
2. It should not be done in the resolvers if you can avoid it.
3. You shoud secure your data and implement permissions independent of your database or network interface.

This means that GraphQL servers should have an intermediate "business logic" layer between the database and the GraphQL endpoint that sorts out what data needs to be secured, and who should have access to reading or modifying it. Unfortunately, there aren't many guidelines of how to do this right now.

So basically you are telling me if I want to build a GraphQL server, I have to figure out how to structure my application, handle authentication and authorization all on my own, and learn a bunch of querying syntaxes just to put data into my GraphQL endpoint? And if I eventually want to break up my app into a bunch of microservices, I have no guidance? Fortunately that answer is no. Welcome to Feathers.

## Feathers

Feathers exists because the questions posed to GraphQL developers are not theirs alone. Developers have been asking the same questions and seeking the same guidance for years while building Express REST and Socket.io apps. Feathers gives developers a set of minimalistic but useful packages to help them organize their Node apps. With Feathers, developers contruct their application as independent, datastore agnostic services. Feathers provides generators and documentation about how to organize code, and some tricky parts of server design, like authentication and managing environment variables, are one liners with Feathers. Also, Feathers brings the idea of hooks, which are simple middleware functions that run before or after a service is accessed. They provide data sanitization and authorization in a way that is decoupled from the database or even the particular service the affect.

This sounds great, but how to I use these two libraries together?

## Tutorial

Note: All source code for this tutorial is available at  https://github.com/swarthout/feathers-apollo. I will try to keep this repository in sync with this blog post, but if conflicts do arise, the repository is probably right.

First install Node.js and NPM. then enter the following commands into your command line:

```sh
$ npm install -g feathers-cli
$ mkdir blog-example
$ cd blog-example/
$ feathers generate
```

The Feathers generator will give you a number of prompts, for you to configure which databases you are using, whether you want to use authentication, and if you want to use REST or Socket.io, or both. For the purposes of this example, select yes for local authentication and REST as a minimum. Here is an example configuration:

```sh
? Project name blog-example
? Description example for blog post
? What type of API are you making? (Press <space> to select)REST, Realtime via S
ocket.io
? CORS configuration Enabled for all domains
? What database do you primarily want to use? MongoDB
? What authentication providers would you like to support? (Press <space> to sel
ect)local
```

Once the generator finishes, you will have a full application structure for moving forward. Feel free to explore the app folders and files to situate yourself with what everything looks like.


Now for the magic. Type the following commmands into your command line to get Apollo Server installed.

```sh
$ npm install --save apollo-server graphql-tools graphql bcrypt-as-promised jsonwebtoken
$ feathers generate service

```

Enter the following into the generator for the service

```sh
? What do you want to call your service? graphql
? What type of service do you need? generic
? Does your service require users to be authenticated? No
```

Although we will be doing authentication, this will not be done in the graphql layer, so we will say no in this prompt.

Now go into src/services/graphql and replace the index.js with the following:

```javascript
// src/services/graphql/index.js
'use strict';

const hooks = require('./hooks');
import { apolloExpress, graphiqlExpress } from 'apollo-server';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import Resolvers from  './resolvers';
import Schema from './schema';

module.exports = function () {
  const app = this;

  const executableSchema = makeExecutableSchema({
    typeDefs: Schema,
    resolvers: Resolvers.call(app)
  });

  // Initialize our service with any options it requires
  app.use('/graphql', apolloExpress((req) => {
    let {token, provider} = req.feathers;
    return {
      schema: executableSchema,
      context: {
        token,
        provider
      }
    }
  }));

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
  }))

};

```

Feathers automatically manages routing and retrieving the auth token from the header and putting it in req.feathers.token. We will grab it from there and pass it along to our resolvers in the context. It is important to make the context have token and provider as keys so the built-in feathers auth hooks will work. Also note I am using fancy ES2015 syntax, as feathers installed babel and configured it to use the ES2015 preset.

Now to build the schema and resolvers, make two new files in the graphql folder named schema.js and resolvers.js. This can be changed if you wish, but for this example we are going to keep things simple with one schema file and one resolver file.

## Schema

Add the following schema to the schema.js file. We will be building a simple blog in this example to demonstrate how to build authentication, permissions, and the relational abilities of GraphQL.

```javascript
// src/services/graphql/schema.js

const typeDefinitions = `

enum Category {
  POLITICS
  TECHNOLOGY
  SPORTS
  OTHER
}

type User {
  _id: String! # the ! means that every author object _must_ have an id
  firstName: String
  lastName: String
  username: String!
  posts: [Post] # the list of Posts by this author
}

type Post {
  _id: String!
  title: String
  category: String
  summary: String
  content: String!
  createdAt: String
  comments(limit: Int) : [Comment]
  author: User
}

type Comment {
  _id: String!
  content: String!
  author: User
  createdAt: String
}

type AuthPayload {
  token: String # JSON Web Token
  data: User
}

input postInput {
  title: String!
  content: String!
  summary: String
  category: Category
}

# the schema allows the following queries:
type RootQuery {
  viewer: User
  author(username: String!): User
  authors: [User]
  posts(category: Category): [Post]
  post(_id: String!) : Post
}

# this schema allows the following mutations:
type RootMutation {
  signUp (
    username: String!
    password: String!
    firstName: String
    lastName: String
  ): User

  logIn (
    username: String!
    password: String!
  ): AuthPayload

  createPost (
    post: postInput
  ): Post

  createComment (
    postId: String!
    content: String!
  ): Comment

  removePost (
    _id: String! # _id of post to remove
  ): Post

  removeComment (
    _id: String! # _id of comment to remove
  ): Comment

}

# we need to tell the server which types represent the root query
# and root mutation types. We call them RootQuery and RootMutation by convention.
schema {
  query: RootQuery
  mutation: RootMutation
}
`;



export default [typeDefinitions]

```


This schema should be fairly straightforward for someone comfortable with GraphQL type language, but there are a few interesting things here. In the RootQuery, there is a query called viewer, which returns the current user. This will use the JWT in the request header to figure out who this is. Also note how passing in a userId is not necessary for creating posts or comments. This is also handled by feathers. We will learn more about that later.

## Services

For storing this data, we should construct a few feathers services. For this example, we will use MongoDB for all of the services, but this is not required by Feathers and furthermore, it is not important that all of these services use the same database. We could just as easily put the comments in MongoDB, the posts in PostgreSQL, and the users in Auth0, with no change to the resolvers or the schema. We are able to do that because Feathers includes a set of adapters to iron out the differences between all of these datastores' querying mechanisms.

Make the services for post, comment, and viewer with the following:

```sh
$ feathers generate service
? What do you want to call your service? post
? What type of service do you need? database
? For which database? MongoDB
? Does your service require users to be authenticated? Yes

$ feathers generate service
? What do you want to call your service? comment
? What type of service do you need? database
? For which database? MongoDB
? Does your service require users to be authenticated? Yes

$ feathers generate service
? What do you want to call your service? viewer
? What type of service do you need? generic
? Does your service require users to be authenticated? Yes


```

The Feathers generator pluralizes the service name in the service route, but viewer is a singleton so in src/services.viewer/index.js,so change the code to reflect the following
``` javascript
// src/services/viewer/index.js

//old
app.use('/viewers', new Service());

//new
app.use('/viewer', new Service());
```

This will set up your feathers services with some default structure and some sane defaults. We will change some of these later, but it is a good start.

## Resolvers

Now it is time to start wiring up resolvers! For basic information about how Apollo resolvers work, reference http://docs.apollostack.com/apollo-server/resolvers.html and for learning about the Feathers querying syntax, review http://docs.feathersjs.com/databases/querying.html, although for developers coming from MongoDB querying syntax or Waterline, this should be fairly familiar. Here are the contents of the resolvers.js file:

```javascript
// src/services/graphql/resolvers.js
import request from 'request-promise';

export default function Resolvers() {

  let app = this;

  let Posts = app.service('posts');
  let Users = app.service('users');
  let Comments = app.service('comments');
  let Viewer = app.service('viewer');

  const localRequest = request.defaults({
    baseUrl: `http://${app.get('host')}:${app.get('port')}`,
    json: true
  });

  return {
    User: {
      posts(user, args, context) {
        return Posts.find({
          query: {
            authorId: user._id
          }
        });
      }
    },
    Post: {
      comments(post, { limit }, context) {
        return Comments.find({
          query: {
            postId: post._id
          }
        });
      },
      author(post, args, context) {
        return Users.get(post.authorId);
      }
    },
    Comment: {
      author(comment, args, context) {
        return Users.get(comment.authorId);
      }
    },
    AuthPayload: {
      data(auth, args, context) {
        return auth.data;
      }
    },
    RootQuery: {
      viewer(root, args, context) {
        return Viewer.find(context);
      },
      author(root, { username }, context) {
        return Users.find({
          query: {
            username
          }
        }).then((users) => users[0]);
      },
      authors(root, args, context) {
        return Users.find({})
      },
      posts(root, { category }, context) {
        return Posts.find({
          query: {
            category
          }
        });
      },
      post(root, { _id }, context) {
        return Posts.get(_id)
      }
    },

    RootMutation: {
      signUp(root, args, context) {
        return Users.create(args)
      },
      logIn(root, {username, password}, context) {
        return localRequest({
          uri: '/auth/local',
          method: 'POST',
          body: { username, password }
        });
      },
      createPost(root, {post}, context) {
        return Posts.create(post, context);
      },
      createComment(root, args, context) {
        return Comments.create(args, context);
      },
      removePost(root, { _id }, context) {
        return Posts.remove(_id, context);
      },
      removeComment(root, { _id }, context) {
        return Comments.remove(_id, context);
      }
    }

  }
}

```
That is a lot of code, so let's just focus on a few important lines:

```javascript
// src/services/graphql/resolvers.js

let Posts = app.service('posts');
let Users = app.service('users');
let Comments = app.service('comments');
let Viewer = app.service('viewer');
```

This is where we get references to the feathers services we created in the generator. We will take a look at them more closely later when we implement authorization, but for now, just know this is how you can reference feathers services in your resolvers.

Now let's take a look at our viewer query

```javascript
// src/services/graphql/resolvers.js
    ...

    RootQuery: {
        viewer(root, args, context) {
            return Viewer.find(context);
        }
        ...

```

This is all we need to get the current user, because we passed the JWT to the context of the resolvers. Now let's take a look at how Feathers uses hooks to verify the token and populate the user.

# Feathers Hooks
The primary method of verifying input and implementing authorization in Feathers is hooks. To better understand hooks, let's look at the hooks for the viewer service:

```javascript
// src/services/viewer/hooks/index.js

'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser()
  ],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [hooks.remove('password')],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

```

The verifyToken and populateUser hooks work exactly as they sound. They will authenticate the user and populate the current user's information at params.user in the request. Also, we don't want to share the user's password hash with the client, so we will remove that from all requests. To finish off the viewer service, we just need to return params.user on the find method like so:

```javascript
// src/services/viewer/index.js
...

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return Promise.resolve(params.user);
  }
}
...
```

Pretty simple, right? Let's look at how we can implement more advanced permission logic on the post service:

```javascript
// src/services/post/hooks/index.js
'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.associateCurrentUser({as: 'authorId'})
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: 'authorId' })
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: 'authorId' })
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: 'authorId' })
  ]
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

```

For this blog, anyone can view posts without being signed in, but in order to create a post, a user must have a valid auth token and we will automatically populate the authorId field on the post with the current user's id. Also, a user can only edit and delete their own posts, since we have the restrictToOwner hook on update, patch, and remove. The best part is this permission logic is transferrable to any other feathers service, and is independent of the database, meaning we could change this service to use a different database and not have to change the authorization logic.

As you can see, we have answered many of the questions GraphQL developers face when starting a new project. Authentication? Easy. Authorization? Check. Code Organization? Done. Not sure what database to use yet, or need to integrate data from a variety of sources? No problem.

## Extra

While not necessary, I added a model layer to the MongoDB collections with Mongoose. This should help you see exactly what keys are used in the database. If you decide to move some or all of these endpoints to SQL, you can use Sequelize or Knex to structure your tables in much the same way.

## Conclusion

I have been using this stack on production projects for the past two months and I feel like it is a great way to structure GraphQL servers in Javascript. If you have any questions or see areas for improvement, please comment on this post or seek me out on Github or in the FeathersJS or Apollo Slack channels as @swarthout.

[Feathers Slack](https://feathersjs.slack.com/)

[Apollo Slack](https://apollostack.slack.com/)

[My GitHub Account](https://github.com/swarthout)