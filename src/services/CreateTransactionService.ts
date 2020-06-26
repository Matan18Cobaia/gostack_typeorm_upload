import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository, getRepository } from 'typeorm';

interface ITransactionDTO {
  category: string;
  title: string;
  value: number;
  type: "income" | "outcome";
}
class CreateTransactionService {
  public async execute({ category, title, value, type }: ITransactionDTO): Promise<Transaction> {
    const transactionsRepository =
      getCustomRepository(TransactionsRepository)
    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError("Outcome too high for transaction")
    }
    const categoriesRepository = getRepository(Category)

    let newCategory = await categoriesRepository.findOne({ where: { title: category } })
    if (!newCategory) {
      newCategory = categoriesRepository.create({ title: category })
      await categoriesRepository.save(newCategory)
    }

    const transaction =
      transactionsRepository.create({
        category_id: newCategory.id, title, value, type
      })
    await transactionsRepository.save(transaction)


    return transaction;
  }
}

export default CreateTransactionService;
