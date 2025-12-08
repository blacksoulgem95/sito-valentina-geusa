# Authorizer.dev Integration

This project currently uses a custom JWT-based authentication system. If you're using [Authorizer.dev](https://docs.authorizer.dev) for authentication, you can integrate it as follows:

## Option 1: Replace Current Auth with Authorizer.dev

1. Install Authorizer.dev SDK:
   ```bash
   npm install @authorizerdev/authorizer-js
   ```

2. Update `src/lib/auth/jwt.ts` to use Authorizer.dev token verification:
   ```typescript
   import Authorizer from '@authorizerdev/authorizer-js';

   const authorizerClient = new Authorizer({
     authorizerURL: process.env.AUTHORIZER_URL,
     clientID: process.env.AUTHORIZER_CLIENT_ID,
   });

   export async function verifyAuthToken(request: Request): Promise<TokenPayload> {
     const authHeader = request.headers.get('Authorization');
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       throw new Error('Non autenticato');
     }
     const token = authHeader.split('Bearer ')[1];
     
     // Verify token with Authorizer.dev
     const response = await authorizerClient.validateJWTToken({
       token,
     });
     
     if (!response.is_valid) {
       throw new Error('Token non valido');
     }
     
     return {
       userId: parseInt(response.user_id),
       email: response.email,
     };
   }
   ```

3. Update `src/pages/api/auth/login.ts` to use Authorizer.dev login:
   ```typescript
   import Authorizer from '@authorizerdev/authorizer-js';

   const authorizerClient = new Authorizer({
     authorizerURL: process.env.AUTHORIZER_URL,
     clientID: process.env.AUTHORIZER_CLIENT_ID,
   });

   export const POST: APIRoute = async ({ request }) => {
     const { email, password } = await request.json();
     
     const response = await authorizerClient.login({
       email,
       password,
     });
     
     return new Response(JSON.stringify({
       user: response.user,
       idToken: response.access_token,
     }));
   };
   ```

4. Update frontend `src/services/auth.service.ts` to use Authorizer.dev SDK:
   ```typescript
   import Authorizer from '@authorizerdev/authorizer-js';

   const authorizerClient = new Authorizer({
     authorizerURL: import.meta.env.PUBLIC_AUTHORIZER_URL,
     clientID: import.meta.env.PUBLIC_AUTHORIZER_CLIENT_ID,
   });
   ```

## Option 2: Keep Current Auth, Add Authorizer.dev as Alternative

You can keep the current JWT system and add Authorizer.dev as an additional authentication method by creating new API routes that use Authorizer.dev.

## Environment Variables

Add these to your `.env` and Railway:

```env
AUTHORIZER_URL=https://your-authorizer-instance.com
AUTHORIZER_CLIENT_ID=your-client-id
PUBLIC_AUTHORIZER_URL=https://your-authorizer-instance.com
PUBLIC_AUTHORIZER_CLIENT_ID=your-client-id
```

## Migration Notes

- The current `users` table in the database can be kept for backward compatibility or removed if fully migrating to Authorizer.dev
- Authorizer.dev manages its own user database, so you may not need the `users` table if using Authorizer.dev exclusively
- Update all API routes that use `verifyAuthToken` to work with Authorizer.dev tokens

For more information, see: https://docs.authorizer.dev

