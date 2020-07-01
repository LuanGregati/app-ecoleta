import { Request, Response, response } from 'express';
import knex from '../database/connection';

export default class PointsController {

    // Cadastrar ponto de coleta
    async create (req: Request, res: Response) {

        const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body;
    
        // Criando uma transação, caso alguma INSERT retorne uma falha
        const trx = await knex.transaction();

        const point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
    
        // Inserindo dados na tabela points
        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0]; // Como estou cadastrando apenas um, retorno o primeiro índice do array diretamente
    
        // Inserir dados na tabela point_items, relacionando os dois registros
        const pointItems = items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((item_id: number) => {
            return {
                item_id,
                point_id,
            }
        });
    
        await trx('point_items').insert(pointItems);

        await trx.commit();
    
        return res.json({
            id: point_id,
            ...point
        });
    }

    // Listar vários pontos de coleta
    // Filtros: estado, cidade e itens
    async index (req: Request, res: Response) {
        const { city, uf, items } = req.query;

        const parsedItems = String(items).split(',').map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'point_items.point_id', '=', 'points.id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .select('points.*')
            .distinct()

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.0.2:3333/uploads/${point.image}`
            }
        });

        return res.json(serializedPoints);
    }

    // Listar um único ponto de coleta
    async show(req: Request, res: Response) {
        const { id } = req.params;

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({
                message: "Point not found."
            });
        }

        const serializedPoints = {
            ...point,
            image_url: `http://192.168.0.2:3333/uploads/${point.image}`
        };

        // Itens do ponto de coleta
        const items = await knex('items')
            .select('items.title')
            .join('point_items', 'point_items.id', '=', 'items.id')
            .where('point_items.point_id', id)

        return res.json({ point: serializedPoints, items });
    }
}