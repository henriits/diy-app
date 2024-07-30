import { Kysely, PostgresDialect } from 'kysely';
    
    export async function up(db: Kysely<PostgresDialect>) {
      // Add your migration up logic here
    }
    
    export async function down(db: Kysely<PostgresDialect>) {
      // Add your migration down logic here
    }