const { AuthenticationError } = require("apollo-server-express");
const { User, Book } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id });

        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        const savedBook = await User.findOneAndUpdate(
          {_id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return savedBook;
      }
      throw new AuthenticationError('You need to be logged in');
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const removedBook =await User.findOneAndUpdate(
          {_id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          {new: true }
        );
        return removedBook;

      }
      throw new AuthenticationError('You need to be logged in');
    }
  },
};

module.exports = resolvers;
