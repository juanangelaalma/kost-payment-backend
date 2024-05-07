const winston = require('winston');

const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
    silly: 6
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'magenta',
    info: 'green',
    verbose: 'cyan',
    silly: 'grey'
  }
};

const timestampConfigs = {
  format: 'YYYY-MM-DD HH:mm:ss.SSS',
}

winston.addColors(config.colors);
const wLogger = ({ logName, level }) =>
  winston.createLogger({
    levels: config.levels,
    level: `${level}`,
    transports: [
      new winston.transports.Console({
        level: `${level}`,
        format: winston.format.combine(
          winston.format.timestamp(timestampConfigs),
          winston.format.printf(
            info => `[${info.timestamp}] ${info.level.toLocaleUpperCase()}: ${info.message}`
          ),
          winston.format.colorize({ all: true })
        )
      }),
      new winston.transports.File({
        filename: `./src/logs/${logName}/${logName}-Error.log`,
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(timestampConfigs),
          winston.format.printf(
            info => `[${info.timestamp}] ${info.level.toLocaleUpperCase()}: ${info.message}`
          ),
        )
      }),
      new winston.transports.File({
        filename: `./src/logs/${logName}/${logName}-Info.log`,
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(timestampConfigs),
          winston.format.printf(
            info => `[${info.timestamp}] ${info.level.toLocaleUpperCase()}: ${info.message}`
          ),
        )
      }),

      new winston.transports.File({
        format: winston.format.combine(
          winston.format.timestamp(timestampConfigs),
          winston.format.printf(
            info => `[${info.timestamp}] ${info.level.toLocaleUpperCase()}: ${info.message}`
          ),
        ),
        filename: './src/logs/globalLog.log',
        level: 'silly'
      })
    ]
  });

module.exports = wLogger;

//const logger = wLogger({ logName: moduleName, level: logLevel })
//logger.info('test')