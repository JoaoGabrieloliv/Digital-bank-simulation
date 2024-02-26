const fs = require("fs");

let inquirer;
import("inquirer")
  .then((inquirerModule) => {
    inquirer = inquirerModule.default || inquirerModule;

    import("chalk")
      .then((chalkModule) => {
        const chalk = chalkModule.default || chalkModule;

        operation(inquirer, chalk);
      })
      .catch((chalkError) => {
        console.error("Erro ao importar o chalk:", chalkError);
      });
  })
  .catch((inquirerError) => {
    console.error("Erro ao importar o inquirer:", inquirerError);
  });

function operation(inquirer, chalk) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      if (action === "Criar conta") {
        CriaçãoDeConta(inquirer, chalk);
      } else if (action === "Depositar") {
        deposit(inquirer, chalk);
      } else if (action === "Consultar saldo") {
        consultarSaldo(inquirer, chalk);
      } else if (action === "Sacar") {
        sacar(inquirer, chalk);
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar o Banco!"));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

function CriaçãoDeConta(inquirer, chalk) {
  console.log(chalk.bgGreen.black("Parabéns por escolher nosso banco!"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));
  BuildAccount(inquirer, chalk);
}

function BuildAccount(inquirer, chalk) {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para sua conta: ",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.red("Essa conta já existe, escolha outro nome"));
        BuildAccount(inquirer, chalk); // Passar o objeto inquirer e chalk
      } else {
        fs.writeFileSync(
          `accounts/${accountName}.json`,
          JSON.stringify({ balance: 0 }),
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );

        console.log(chalk.green("Parabéns, sua conta foi criada"));
        operation(inquirer, chalk); // Passar o objeto inquirer e chalk
      }
    })
    .catch((err) => console.log(err));
}

function deposit(inquirer, chalk) {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
      {
        name: "amount",
        message: "Quanto você deseja depositar?",
        type: "number",
      },
    ])
    .then((answer) => {
      const { accountName, amount } = answer;

      // verifica se conta existe
      if (!checkAccount(accountName, chalk)) {
        return deposit(inquirer, chalk); // Passar o objeto inquirer e chalk
      }

      // realiza o depósito
      const accountFilePath = `accounts/${accountName}.json`;
      const accountData = JSON.parse(fs.readFileSync(accountFilePath, "utf-8"));
      accountData.balance += amount;
      fs.writeFileSync(accountFilePath, JSON.stringify(accountData));

      console.log(chalk.green(`Depósito de ${amount} realizado com sucesso!`));
      operation(inquirer, chalk); // Passar o objeto inquirer e chalk
    })
    .catch((err) => console.log(err));
}

function consultarSaldo(inquirer, chalk) {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      // verifica se conta existe
      if (!checkAccount(accountName, chalk)) {
        return consultarSaldo(inquirer, chalk); // Passar o objeto inquirer e chalk
      }

      // obtém e exibe o saldo
      const accountFilePath = `accounts/${accountName}.json`;
      const accountData = JSON.parse(fs.readFileSync(accountFilePath, "utf-8"));
      console.log(
        chalk.green(`Saldo da conta ${accountName}: ${accountData.balance}`)
      );
      operation(inquirer, chalk); // Passar o objeto inquirer e chalk
    })
    .catch((err) => console.log(err));
}

function sacar(inquirer, chalk) {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
      {
        name: "amount",
        message: "Quanto você deseja sacar?",
        type: "number",
      },
    ])
    .then((answer) => {
      const { accountName, amount } = answer;

      // verifica se conta existe
      if (!checkAccount(accountName, chalk)) {
        return sacar(inquirer, chalk); // Passar o objeto inquirer e chalk
      }

      // verifica se há saldo suficiente
      const accountFilePath = `accounts/${accountName}.json`;
      const accountData = JSON.parse(fs.readFileSync(accountFilePath, "utf-8"));
      if (amount > accountData.balance) {
        console.log(chalk.red("Saldo insuficiente!"));
        return sacar(inquirer, chalk);
      }

      // realiza o saque
      accountData.balance -= amount;
      fs.writeFileSync(accountFilePath, JSON.stringify(accountData));

      console.log(chalk.green(`Saque de ${amount} realizado com sucesso!`));
      operation(inquirer, chalk);
    })
    .catch((err) => console.log(err));
}

function checkAccount(accountName, chalk) {
  const accountFilePath = `accounts/${accountName}.json`;

  if (!fs.existsSync(accountFilePath)) {
    console.log(chalk.bgRed.black("Esta conta não existe!"));
    return false;
  }
  return true;
}
