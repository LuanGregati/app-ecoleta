import Knex from 'knex';

// Responsável por criar a tabela
export async function up (knex: Knex) {
    return knex.schema.createTable('items', table => {
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('title').notNullable();
    });
}

// Méotodo para voltar atrás caso necessário
export async function down (knex: Knex) {
    return knex.schema.dropTable('items');
}