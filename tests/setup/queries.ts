export const signUpMutation = /* GraphQL */`
  mutation signUp($user: UserCreateInput) {
    signUp(user: $user) {
      token,
      user {
        email
      }
    }
  }
`;

export const signInMutation = /* GraphQL */`
  mutation signIn($email: String! $password: String!) {
    signIn(email: $email password: $password) {
      token
      user {
        email
      }
    }
  }
`;

export const updateProfileMutation = /* GraphQL */`
  mutation updateProfile($user: UserUpdateInput) {
    updateProfile(user: $user) {
      name
    }
  }
`;

export const createDraftMutation = /* GraphQL */`
  mutation createDraft($title: String! $content: String!) {
    createDraft(title: $title content: $content) {
      id
      title
    }
  }
`;

export const publishMutation = /* GraphQL */`
  mutation publish($id: Int!) {
    publish(id: $id) {
      id
      title
    }
  }
`;

export const deletePostMutation = /* GraphQL */`
  mutation deletePost($id: Int!) {
    deletePost(id: $id) {
      id
    }
  }
`;

export const meQuery = /* GraphQL */`
  query me {
    me {
      id
      email
      name
    }
  }
`;

export const feedQuery = /* GraphQL */`
  query feed {
    feed {
      id
      title
    }
  }
`;

export const filterPostsQuery = /* GraphQL */`
  query filterPosts($searchString: String!) {
    filterPosts(searchString: $searchString) {
      id
      title
    }
  }
`;

export const postQuery = /* GraphQL */`
  query post($id: Int!) {
    post(id: $id) {
      id
      title
    }
  }
`;
