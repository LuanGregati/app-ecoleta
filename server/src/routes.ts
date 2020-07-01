/**
 * Arquivo responsável por lidar com as rotas da aplicação
 */

import express from 'express';
import multer from 'multer';
import { celebrate, Joi } from 'celebrate';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

import multerConfig from './config/multer';

const routes = express.Router();

const pointsController = new PointsController();
const itemsController = new ItemsController();

const upload = multer(multerConfig);

// Items
routes.get('/items', itemsController.index); // Listar itens

// Points
routes.post(
    '/points', 
    upload.single('image'), 
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            items: Joi.string().required()
        })
    }, {
        abortEarly: false
    }),
    pointsController.create
); // Cadastrar pontos de coleta

routes.get('/points', pointsController.index); // Listar vários pontos de coleta
routes.get('/points/:id', pointsController.show); // Listar um ponto de coleta específico

export default routes;
