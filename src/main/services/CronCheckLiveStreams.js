const { twitchAuthController, ErrorLogCreateFileHandler } = require("../utils/utilities");
const { twitchApi } = require('../modules/twitch/api/twitchApi');
const { streamers_live_check_time } = require("../models/SlaveModels");
const { spawn } = require('child_process');
const path = require('path');

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

// module.exports = cron.schedule('*/3 * * * *', checkStreamService, {
//     // const childProcess = spawn("como eu faria esta parte aqui?"),
//     scheduled: true,
//     timezone: "America/Sao_Paulo"
//   });
