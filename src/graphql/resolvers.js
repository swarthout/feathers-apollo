import app from '../app';

let postService = app.service('/posts');
let authorService = app.service('/authors');
let commentService = app.service('/comments');

const resolveFunctions = {
  Author: {
    posts(root, { id }, context){
      return postService.find({
        query: {
          authorId: id
        }
      })
    }
  },
  Post: {
    comments(root, { id }, context){
      return commentService.find({
        query: {
          postId: id
        }
      })
    },
    author(root, { authorId }, context){
      return authorService.get(authorId)
    }
  },
  Comment: {
    author(root, { authorId }, context){
      return authorService.get(authorId)
    }
  },
  RootQuery: {
    author(root, { firstName, lastName }, context){
      return authorService.find({
        query: {
          firstName: firstName,
          lastName: lastName
        }
      }).then((authors) => authors[ 0 ])
    },
    authors(root, args, context){
      return authorService.find({})
    },
    posts(root, { category }, context){
      return postService.find({
        query: {
          category: category
        }
      });
    },
    post(root, { id }, context){
      return postService.get(id)
    }
  },

  RootMutation: {
    createAuthor(root, args, context){
      return authorService.create(args)
    },
    createPost(root, args, context){
      return authorService.create(args)
    },
    createComment(root, args, context){
      return commentService.create(args)
    }
  }

}

export default resolveFunctions;
