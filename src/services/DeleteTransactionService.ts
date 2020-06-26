import AppError from '../errors/AppError';
import TransactionsRepository from "../repositories/TransactionsRepository";
import { getCustomRepository } from 'typeorm';

class DeleteTransactionService {
  public async execute(id:string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository)
    await transactionsRepository.delete(id)
    return ;

  }
}

export default DeleteTransactionService;
