const { twitchAuthController, ErrorLogCreateFileHandler } = require("../utils/utilities");
const { twitchApi } = require('../modules/twitch/api/twitchApi');
const { streamers_live_check_time } = require("../models/SlaveModels");
const { spawn } = require('child_process');
const path = require('path');
// const schedule = require('node-schedule');

const checkStreamService = async () => {
    try {
        const getLivesToCheck = await streamers_live_check_time().select("*").where({ live_ended_at: NULL });
        console.log('Consolando cron Service! o que temos aqui? ', getLivesToCheck);
    } catch (err) {
        console.log(err);
        const txtName = "error-CronService-CheckStreams.txt"
        const warning = "Erro na ao checar live Stream! "
        return ErrorLogCreateFileHandler(txtName, warning, err);
    }
}

// Agende a execução da função a cada 3 minutos
// const job = schedule.scheduleJob('*/3 * * * *', () => {
//     console.log('Executando a função de verificação de transmissões ao vivo...');

//     // Execute a função no controlador usando um processo filho
//     const childProcess = spawn('node', [path.join(__dirname, 'controllers', 'checkLiveStreams.js')]);

//     childProcess.stdout.on('data', (data) => {
//         console.log(`Saída do processo filho: ${data}`);
//     });

//     childProcess.stderr.on('data', (data) => {
//         console.error(`Erro do processo filho: ${data}`);
//     });
// });
