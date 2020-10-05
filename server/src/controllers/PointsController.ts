import { Request, Response } from 'express';
import connection from '../database/connection';

class PointsController {

    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await connection('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.0.14:3333/uploads/${point.image}`
            }
        });

        return response.json(serializedPoints);
    };

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await connection('points').where('id', id).first();

        if (!point)
            return response.status(400).json({
                message: 'Point not found'
            });

        const serializedPoint = {
            ...point,
            image_url: `http://192.168.0.14:3333/uploads/${point.image}`
        };

        const items = await connection('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        return response.json({ point: serializedPoint, items });
    };

    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;

        const transaction = await connection.transaction();

        const point = {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            image: request.file.filename
        };

        const pointsResponse = await transaction('points').insert(point);

        const point_id = pointsResponse[0];

        const point_items = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    point_id,
                    item_id
                }
            });

        await transaction('point_items').insert(point_items);

        transaction.commit();

        response.json({
            id: point_id,
            ...point
        });
    };

}

export default PointsController;