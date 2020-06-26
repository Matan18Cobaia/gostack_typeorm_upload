# gostack_typeorm_upload

## Another challenge from GoStack bootcamp

In this one we must integrate a database using typeorm, interacting with a csv file to register all transactions or registering a single transaction by POST request

```javascript 
// Transaction type
class Transaction {
  id: string;

  title: string;

  type: 'income' | 'outcome';

  value: number;

  category:Category;

  created_at: Date;

  updated_at: Date;
}

// Category type
class Category {
  id: string;

  title: string;

  created_at: Date;

  updated_at: Date;
}
```

I will show some interesting thins i learn in this challenge:

1. Use multer lib for nodeJs is a litle simple, I create a file like this:

```javascript
export default {
  directory:tmpFolder,
  storage:multer.diskStorage({
    destination:tmpFolder,
    filename(request,file, callback){
      const fileName = `${Date.now()}=${file.originalname}`
      return callback(null, fileName)
    }
  })
}
```
Who will save the file, changing the name of the file, in the destination.
Then use this as multer middleware on the route I'll need, and set in single() the name that request will send to us:

```javascript
transactionsRouter.post('/import', multer(upload).single('file'), async (request, response) => {
  const importTransactionsService = new ImportTransactionsService()
  const transactions = await importTransactionsService.execute(request.file.path)

  return response.send(transactions)
});
```
After that, I already got the file in data to use it as I need it
basecally
2. The function array.map() is not thread-safe:
The template already has a file service who will be used to create and save a transaction and a new category (if necessary) on database, but in this case of import a file (lot of registers), this will not work if there is repetitive categories, i'll try to explain it:

If I will create a transaction, and the category doesn't exist on database, I will create this category, after that, I will create the transaction.
But in multiple transaction, using map() for example, javascript will basically separate each transaction, then use in diferents states of program time

Imagine that here below is ta timeline that each "-" represents a moment in time, and the Transaction 2 and 3 has the same category, when I started a map function to register each transaction, all transaction will start at the same state of project (where category on transaction 2 and 3 doesn't exists), so both transactions will create a new category with the same title, and possibly crash our application (if category title must be Unique for example), or even over populate our database, if the file is too extensive

Transaction 1 - ---- Verify category (exist) ----- save Transaction ----- return Transaction saved
Transaction 2 - --- Verify category (doesn't exist) ----- save category --- save transaction ----- return Transaction saved
Transaction 3 - -----Verify category (doesn't exist)--- save category ---- save transaction ------ return Transaction saved



