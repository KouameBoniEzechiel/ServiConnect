const chalk = require('chalk');

function logger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl, headers, body, params, query } = req;

  const token = headers['authorization'] || 'Aucun token';

  console.log(chalk.blue.bold('\n===================================================================== DÉBUT DES LOGS ====================================================================='));
  console.log(chalk.cyan(`← Méthode:`), chalk.green(`${method}`), chalk.cyan(`URL:`), chalk.yellow(`${originalUrl}`));
  console.log(chalk.cyan(`← Headers:`), headers);
  console.log(chalk.cyan(`← Token:`), chalk.magenta(`${token}`));
  console.log(chalk.cyan(`← Query:`), JSON.stringify(query));
  console.log(chalk.cyan(`← Params:`), params);
  console.log(chalk.cyan(`← Body:`),  chalk.cyan(JSON.stringify(body)));
 

  // Capture de la réponse
  const oldSend = res.send;
  res.send = function (data) {
    res.locals.body = data; // stocker pour l'utiliser plus tard dans res.on('finish')
    return oldSend.call(this, data);
  };

  res.on('finish', () => {
    try {
      const duration = Date.now() - start;
      const formatted = format(res.locals.body);
  
      console.log(chalk.cyan(`← Réponse:\n`), chalk.green.bold(formatted));
      console.log(chalk.cyan(`← Durée:`), chalk.green(`${duration}ms`));
  
      if (res.statusCode >= 400) {
        console.log(chalk.red.bold(`Erreur: Code ${res.statusCode}`));
      } else {
        console.log(chalk.green.bold(`← Statut: ${res.statusCode}`));
      }
    } catch (e) {
      console.log(chalk.red('Erreur de format de réponse :'), e.message);
    }
    console.log(chalk.blue.bold('===================================================================== FIN DES LOGS =============================================================\n'));
  });

  next();
}

function format(data) {
    const parsed = JSON.parse(data);
    const objectKeys = Object.keys(parsed);

    let result = '';

    objectKeys.forEach((key) => {
        const value = parsed[key];
        const formattedValue = typeof value === 'object'
            ? JSON.stringify(value, null, 2)
            : value;

        result += `${key} :${formattedValue}\n`;
    });

    return result;
}
module.exports = { logger };
