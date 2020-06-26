import fs from "fs";
import csvParse from "csv-parse";
import Transaction from '../models/Transaction';
import Category from "../models/Category";
import TransactionsRepository from "../repositories/TransactionsRepository";
import { In, getRepository, getCustomRepository } from "typeorm";

interface ICSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string
}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository =getCustomRepository(TransactionsRepository);
    const readCSVStream = fs.createReadStream(filePath)
    const categoriesRepository = getRepository(Category)
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true
    })
    const parseCSV = readCSVStream.pipe(parseStream)
    const categories: string[] = [];
    const transactions = Array<ICSVTransaction>();
    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim()
      )
      if (!title || !type || !value) return;

      categories.push(category)

      transactions.push({ title, type, value, category })
    })
    await new Promise(resolve => {
      parseCSV.on('end', resolve)
    })

    const existentsCategories = await categoriesRepository.find({
      where: {
        title: In(categories)
      }
    })

    const existentsCategoriesTitles = existentsCategories.map((category: Category) => category.title)
    const addCategoriesTitles = categories
      .filter(category => !existentsCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index)
    const newCategories = categoriesRepository.create(
      addCategoriesTitles.map(title=>({title}))
    )
    await categoriesRepository.save(newCategories)

    const finalCategories = [...newCategories, ...existentsCategories]

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction=>({
        title:transaction.title,
        type:transaction.type,
        value: transaction.value,
        category:finalCategories.find(category=>category.title===transaction.category)
      }))
    )
    await transactionsRepository.save(createdTransactions)
    await fs.promises.unlink(filePath)

    return createdTransactions;
  }
}

export default ImportTransactionsService;
