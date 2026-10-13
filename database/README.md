# PostgreSQL setup

Use a dedicated database and account for this new project. Do not reuse or migrate the old application's database.

Open `psql` as your PostgreSQL administrator. Run:

```sql
CREATE ROLE nextstep LOGIN;
\password nextstep
CREATE DATABASE nextstep OWNER nextstep;
```

The password command prompts securely. Set the same password in your private root `.env`:

```dotenv
DATABASE_URL=jdbc:postgresql://localhost:5432/nextstep
DATABASE_USER=nextstep
DATABASE_PASSWORD=your-private-password
PORT=8081
```

The development database prepared during implementation uses a separate `nextstep_new` database on port 55432. Its credentials are already in the private `.env`; they are not in documentation or source control. This local PostgreSQL process must be running before the backend starts. For a permanent setup, use your installed PostgreSQL Windows service and update `.env` accordingly.

Flyway migrations live in `backend/src/main/resources/db/migration`. V1 defines relational users, questions, attempts, bookmarks, problems, submissions, resume reviews, interview questions and sessions, and goals. V2 inserts 60 explained MCQs, 12 coding problems, and 12 interview prompts. Selected quiz answers and interview responses are currently stored as JSON text on their parent rows.

JPA validates the schema; it does not drop or recreate tables. Back up with PostgreSQL's `pg_dump` before any schema change. Protect backups like other private user data.
