import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';
import { classToClass } from 'class-transformer';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    //
    const { id } = request.body;
    const findOrder = container.resolve(FindOrderService);

    const orders = await findOrder.execute({
      id,
    });

    return response.json(orders);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    // TODO
    const { customer_id, products } = request.body;

    const createOrder = container.resolve(CreateOrderService);

    const orders = await createOrder.execute({
      customer_id,
      products,
    });

    return response.json(classToClass(orders));
  }
}
