import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('Customer not exists.');
    }

    const idProducts = products.map(product => {
      return { id: product.id };
    });

    const findProducts = await this.productsRepository.findAllById(idProducts);

    if (findProducts.length !== products.length) {
      throw new AppError('Product not exists.');
    }

    const verifyQuantity = findProducts.find(product => {
      return (
        product.quantity < products.filter(p => p.id === product.id)[0].quantity
      );
    });

    if (verifyQuantity) {
      throw new AppError('Verify the quantity.');
    }

    const productsFormated = findProducts.map(product => {
      return {
        product_id: product.id,
        price: product.price,
        quantity: products.filter(p => p.id === product.id)[0].quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: productsFormated,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
