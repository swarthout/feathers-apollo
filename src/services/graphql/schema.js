const typeDefinitions = `

enum Category {
  POLITICS
  TECHNOLOGY
  SPORTS
  OTHER
}

type Author {
  id: Int! # the ! means that every author object _must_ have an id
  firstName: String
  lastName: String
  posts: [Post] # the list of Posts by this author
}

type Post {
  id: Int!
  title: String
  category: String
  summary: String
  content: String
  timestamp: String
  comments(limit: Int) : [Comment]
  author: Author
}

type Comment {
  id: Int!
  content: String
  author: Author
  timestamp: String
}

# the schema allows the following two queries:
type RootQuery {
  author(firstName: String, lastName: String): Author
  authors: [Author]
  posts(category: Category): [Post]
  post(id: String!) : Post
}

# this schema allows the following two mutations:
type RootMutation {
  createAuthor(
    firstName: String!
    lastName: String!
  ): Author

  createPost(
    title: String!
    content: String!
    summary: String
    category: Category
    authorId: Int!
  ): Post
  
  createComment(
    postId: Int!
    content: Int!
    authorId: Int!
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
