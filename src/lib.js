const axios = require('axios');
const async = require('async');
const moment = require('moment');

const Player = require('./Player');

/**
 * @typedef {Object} Player
 * @property id
 * @property name
 * @property server
 * @property region
 * @property {Raid[]} raids
 *
 */

/**
 * @typedef {Object} Raid
 * @property title
 * @property start
 * @property end
 * @property {number} zone
 */

/**
 * @returns {Promise<{Player[]}>}
 */
function updateAttendance({WCL_KEY, WCL_GUILD, WCL_SERVER, WCL_REGION}) {
  return axios.get(
    `https://classic.warcraftlogs.com/v1/reports/guild/${WCL_GUILD}/${WCL_SERVER}/${WCL_REGION}?api_key=${WCL_KEY}&start=${moment()
      .subtract(30, 'days')
      .valueOf()}`,
  )
    .then(response => {
      const reports = response.data;
      return reports.map(report => ({id: report.id, start: report.start, end: report.end}));
    })
    .then(reportIds => {
      console.log('reportIds', reportIds);
      return reportIds.map(({id}) => (callback) => axios.get(
        `https://classic.warcraftlogs.com/v1/report/fights/${id}?api_key=${WCL_KEY}`,
      ).then(reportResponse => callback(null, reportResponse.data)));
    })
    .then(promises => async.series(promises))
    .then((reports = []) => {
      const players = {};

      reports.forEach(report => report.exportedCharacters.forEach(player => {
        const {title, start, end, zone} = report;
        if (!players[player.name]) {
          players[player.name] = player;
          players[player.name].raids = [];
        }
        players[player.name].raids.push({
          title,
          start,
          end,
          zone,
        });
        players[player.name].raids.sort((a, b) => {
          return b.start - a.start;
        });
      }));

      return players;
    })
    .then(players => {
      (async () => {
        await Player.remove({}, function (err) {
          if (err) {
            console.log('error deleting old data.');
          }
        });

        for (const idx of Object.keys(players)) {
          let player = await Player.findOne({wcl_id: players[idx].id});
          if (!player) {
            player = new Player({
              name: players[idx].name,
              wcl_id: players[idx].id,
              raids: players[idx].raids,
            });
          } else {
            player.raids = players[idx].raids;
          }
          await player.save();
        }
      })();
    });
}

/**
 * @returns {Promise<{Player[]}>}
 */
function getAttendance() {
  return Player.find({});
}

/**
 * @type {{updateAttendance: (function({WCL_KEY?: *, WCL_GUILD: *, WCL_SERVER: *, WCL_REGION: *}): Promise<{}>), getAttendance: (function(): *)}}
 */
module.exports = {updateAttendance, getAttendance};