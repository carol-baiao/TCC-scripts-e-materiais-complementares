const INITIAL_BALANCE = 100_000;
const TRANSACTIONS = Array.from({ length: 24 }, (_, index) => ({
    type: index % 2 === 0 ? "deposit" : "withdraw",
    amount: 25 + ((index * 17) % 150)
}));

export function execute(solutionModule) {
    const { BankAccount } = solutionModule;

    if (typeof BankAccount !== "function") {
        throw new Error("A classe BankAccount não foi encontrada.");
    }

    const account = new BankAccount();
    account.open();
    account.deposit(INITIAL_BALANCE);

    for (const transaction of TRANSACTIONS) {
        if (transaction.type === "deposit") {
            account.deposit(transaction.amount);
        } else {
            account.withdraw(transaction.amount);
        }
    }

    const balance = account.balance;
    account.close();

    return balance;
}
