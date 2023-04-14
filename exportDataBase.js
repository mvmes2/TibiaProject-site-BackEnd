const { exec } = require('child_process');
const path = require('path');

// Configuração da conexão com o banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'tibiaproject'
};

// Opções de exportação do banco de dados
const dumpOptions = {
  resultFile: path.join(process.cwd(), 'dump.sql'),
};

// Comando para exportar o banco de dados
const dumpCommand = `mysqldump --column-statistics=0 --host=${dbConfig.host} --user=${dbConfig.user} --password=${dbConfig.password} --databases ${dbConfig.database} > ${dumpOptions.resultFile}`;

// Executa o comando de exportação do banco de dados
exec(dumpCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao exportar o banco de dados: ${error}`);
    return;
  }
  console.log(`Banco de dados exportado com sucesso para o arquivo ${dumpOptions.resultFile}`);
});
