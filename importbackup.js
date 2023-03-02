const { exec } = require('child_process');
const path = require('path');

const host = 'tibiaproject.copfugd4swu4.sa-east-1.rds.amazonaws.com';
const user = 'ademirotbproject';
const password = 'adfg2DOwGQwfV5XpLPU9';
const database = 'tibiaproject';
const backupFile = path.join(__dirname, 'backup.sql');

const command = `mysql --host=${host} --user=${user} --password=${password} ${database} < ${backupFile}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao fazer a importação: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Erro ao fazer a importação: ${stderr}`);
    return;
  }
  console.log('Importação concluída com sucesso!');
});