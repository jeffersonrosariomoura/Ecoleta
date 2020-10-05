import { Request, Response } from 'express';
import connection from '../database/connection';

class ItemsController {
    async index(request: Request, response: Response) {

        const items = await connection('items').select('*');

        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://192.168.0.14:3333/uploads/${item.image}`
                // image_url: `http://localhost:3333/uploads/${item.image}`
            }
        });

        response.json(serializedItems);
    };
}
    export default ItemsController;