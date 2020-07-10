import { getCustomRepository } from 'typeorm';

import { Router } from 'express';

import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import upload from '../config/upload';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();
  return response.send({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    category,
    title,
    value,
    type,
  });

  return response.send(transaction);
});

transactionsRouter.post(
  '/import',
  multer(upload).single('file'),
  async (request, response) => {
    const importTransactionsServices = new ImportTransactionsService();
    const transactions = await importTransactionsServices.execute(
      request.file.path,
    );

    return response.send(transactions);
  },
);

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);
  return response.json();
});

export default transactionsRouter;
