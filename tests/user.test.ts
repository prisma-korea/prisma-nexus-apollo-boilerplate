import { request } from 'graphql-request';
import { testHost } from './testSetup';

describe('Resolver - User', () => {
  const name = 'dooboo1';
  const email = `${name}@dooboo1.com`;
  const password = 'password';

  const mutation = /* GraphQL */`
    mutation {
      signUp(user: {
        email: "${email}"
        password: "${password}"
        name: "${name}"
      }) {
        token,
        user {
          email
        }
      }
    }
  `;

  it('should signUp user', async () => {
    const response = await request(testHost, mutation);

    expect(response).toHaveProperty('signUp');
    expect(response.signUp).toHaveProperty('token');
    expect(response.signUp).toHaveProperty('user');
    expect(response.signUp.user.email).toEqual(email);
  });
});
