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
