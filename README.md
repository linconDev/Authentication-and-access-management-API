# Authentication and Access Management Api

## Description

This API was carefully developed, with special focus on each functionality, aiming for security, error handling and scalability. With it you can register users and authenticate with their appropriate access credentials provided at the time of registration. See the Swagger documentation located at the api/docs endpoint, execute each request and run your tests, each endpoint has a detailed explanation of what it returns, and what needs to be provided in each request.

### Package list

- Node.JS v20.12.2
- yarn v1.22.22 (You can use npm, but we recommend using yarn, it is in any case a personal choice of the developer)

### Installation guide

**Using npm**

```PowerShell
npm install
```

```PowerShell
npm run start:dev
```

**Using yarn**

```PowerShell
yarn install
```

```PowerShell
yarn start:dev
```

The Api will start and you will not need to configure any database, as the api will automatically generate a database file called database.db that will be used by the sqlite3 driver in the root of the api, initially it is more than necessary to go using it, if you want to use this database you can run the api as it is and start using it, it's the best way to have a complete api with everything you need.
However, I must warn you that sqlite is simple for cases that will not require a more complex database, for example if you are a developer who just wants something simple and practical for your development on your local machine, or if you own a small business and you just need something simple to have users in your system, and to provide login for these users.
For cases that require mysql or any other type of database, follow the steps below.

### Using another database (optional)

In this guide I will use MySQL as a model.

1. install the MySQL driver

```PowerShell
yarn add mysql2
```

Or

```PowerShell
npm install mysql2
```

2. Then go to src/app.module.ts and change this block of code:

```Typescript
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: './database.db',
    entities: [User],
    synchronize: true,
  }),
```

for this:

```Typescript
  TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'your host db',
      port: 3306,
      username: 'your root user',
      password: 'your db password',
      database: 'your database name',
      entities: [User],
      synchronize: false,
      retryAttempts: 3,
      retryDelay: 10000,
    }),
```

If you want to modify the structures of the tables, such as the user table for example, our api makes use of typeorm, the tables and their columns are created based on what we insert in the entities of each module, in the case of users, it would be src/users/entities/ user.entity.ts see:

```Typescript
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  created_at: string;

  @Column()
  updated_at: string;
}

```

### Test coverage

----------------------|---------|----------|---------|---------|-------------------
File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------|---------|----------|---------|---------|-------------------
All files | 100 | 100 | 100 | 100 |  
 src | 100 | 100 | 100 | 100 |  
 app.controller.ts | 100 | 100 | 100 | 100 |  
 app.service.ts | 100 | 100 | 100 | 100 |  
 src/auth | 100 | 100 | 100 | 100 |  
 auth.controller.ts | 100 | 100 | 100 | 100 |  
 auth.service.ts | 100 | 100 | 100 | 100 |  
 jwt.strategy.ts | 100 | 100 | 100 | 100 |  
 src/common/logger | 100 | 100 | 100 | 100 |  
 logger.service.ts | 100 | 100 | 100 | 100 |  
 src/users | 100 | 100 | 100 | 100 |  
 users.controller.ts | 100 | 100 | 100 | 100 |  
 users.service.ts | 100 | 100 | 100 | 100 |  
 src/users/dto | 100 | 100 | 100 | 100 |  
 create-user.dto.ts | 100 | 100 | 100 | 100 |  
 src/users/entities | 100 | 100 | 100 | 100 |  
 user.entity.ts | 100 | 100 | 100 | 100 |  
----------------------|---------|----------|---------|---------|-------------------

Test Suites: 8 passed, 8 total
Tests: 39 passed, 39 total
Snapshots: 0 total
Time: 4.123 s
Ran all test suites.
✨ Done in 4.94s.

## Functionalities

### Authentication

To get an access token, after starting the api, you must register as a user, at the /users/register endpoint, simple data, you will only provide your name, email and desired password to authenticate, below I will leave a curl of example.

```Shell
curl --request POST \
  --url http://localhost:3000/users/register \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/8.6.1' \
  --data '{
	"name": "Your Full Name",
	"email": "YourEmail@email.com",
	"password": "m!@#sadeyb2nshx"
}'
```

**Important detail, this is the only endpoint that you can use without being authenticated**

After completing your registration, you will be able to log in normally to the authentication point using the email you entered when registering, and the password you chose, see the curl below.

```Shell
curl --request POST \
  --url http://localhost:3000/auth/login \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/9.1.0' \
  --data '{
	"email": "YourEmail@email.com",
	"password": "m!@#sadeyb2nshx"
}'
```

Once this is done you should receive a response like this

```Json
{
	"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsaWNpYWRhbWF0YUBteWVtYWlsLmNvbSIsInN1YiI6NCwiaWF0IjoxNzE0OTU1NTkzLCJleHAiOjE3MTUwNDE5OTN9.D5DheTLgqXNgrKZqpzzqKz9u1-uLy7fXocBaxjmUJb4"
}
```

To test your access you will use this token on the two endpoints we have so far, /users/profile and /users/delete, the interesting thing about this API is that it is already at a starting point to be used in a basic concept of mobile application or web applications, because to see your information you access the /users/profile profile endpoint and based on the token you received at the time of login, the code will collect the email stored within it and search for your information, In other words, you must be logged in to obtain your data, try making a request without this token and one with it, so you will understand for yourself how invalid access is handled. see the curl below of a successful request to get your data:

```Shell
curl --request GET \
  --url http://localhost:3000/users/profile \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsaWNpYWRhbWF0YUBteWVtYWlsLmNvbSIsInN1YiI6NCwiaWF0IjoxNzE0OTUxMzI3LCJleHAiOjE3MTUwMzc3Mjd9.-HMQcZnGxDMQoFO_GN3-U3hdRXMl68EoYHt5Me4YihE' \
  --header 'User-Agent: insomnia/9.1.0'
```

You will see output similar to this

```Json
{
	"id": 4,
	"name": "Alicia da Mata Gallo dos Santos",
	"email": "aliciadamata@myemail.com",
	"created_at": "2024-05-05T13:40:56.385Z",
	"updated_at": "2024-05-05T13:40:56.386Z"
}
```

Now because we already have everything ready for you to use this API with your application that needs to be approved on a mat on the Google Play console, or your web system that needs to comply with the general data protection law where each user has the right to request the complete deletion of your information, thus ceasing to exist from your system completely. And to enjoy this service, as well as the other service of fetching your own data, the user must be logged in and authenticated at the users/delete endpoint, as well, see the curl below.

```Shell
curl --request DELETE \
  --url http://localhost:3000/users/delete \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsaWNpYWRhbWF0YUBteWVtYWlsLmNvbSIsInN1YiI6NCwiaWF0IjoxNzE0OTU1NTkzLCJleHAiOjE3MTUwNDE5OTN9.D5DheTLgqXNgrKZqpzzqKz9u1-uLy7fXocBaxjmUJb4' \
  --header 'User-Agent: insomnia/9.1.0'
```

So far we have only developed these functionalities containing an initial cycle of an application that needs the basics to get started and because it is in nest.js it is fully scalable, thus allowing you to add all the functionalities that your application will consume with ease, I recommend I strongly recommend reading the official nest documentation https://docs.nestjs.com, for this reason I am leaving this repository public to help our community of developers save a good few initial hours when developing an api. However, if you want to thank us with a coffee for the help provided here, I will leave a PayPal donation link below along with my personal contacts if you want a freelancer in your future projects.

[![Donate with PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate?hosted_button_id=EAM7ZX44FPGUC)

My contacts

email: lincongallo@icloud.com
