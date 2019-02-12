/* tslint:disable:no-console */

import config from "config";
import {TimestampOptions} from "logform";
import moment from "moment-timezone";
import path from "path";
import {VError} from "verror";
import winston from "winston";

const env = process.env.NODE_ENV || "development";
const isDeveloment = env === "development";
const isVerbose = process.env.VERBOSE === "1";

if (isVerbose) { console.log("Logger started in verbose mode"); }

const consoleLogLevel = isVerbose ? "vsilly" : "verbose";
const fileLogLevel = "vsilly";
const showFullError = isDeveloment;

class LoggerError extends VError {
    public id: string | undefined;
    public fullError: string | undefined;
}

const loggerLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 3,
        temp: 4,
        test: 5,
        debug: 6,
        silly: 7,
        vsilly: 8,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        verbose: "cyan",
        temp: "white magentaBG",
        test: "white cyanBG",
        debug: "blue",
        silly: "grey",
        vsilly: "grey",
    },
};

const format = winston.format;

const nop = format((info: any) => info); // To make it convenient to use the ternary operator for format items

 // For errors, we assign an hashed ID for easy lookup later
const uniquelyIdentifyErrors = format((info: any, opts: any) => {
    if (info instanceof VError || info instanceof Error) {
        info = info as LoggerError;
    }

    if (info instanceof LoggerError) {
        info.id = Math.random().toString(36).substring(2, 8);
        info.fullError = VError.fullStack(info);
    }
    return info;
});

const LEVEL = Symbol.for("level");
const omitLevel = (level: string) => {
    return format((info: any) => {
        if (info[LEVEL] !== level) {
            return info;
        }
    })();
};

const onlyLevel = (level: string) => {
    return format((info: any) => {
        if (info[LEVEL] === level) {
            return info;
        }
    })();
};

const prependErrorId = format((info: any, opts: any) => {
    if (info.id) { info.message = "[" + info.id + "] " + info.message; }
    return info;
});

const prependProfileDuration = format((info: any, opts: any) => {
    if (info.durationMs) { info.message = `(${info.durationMs}ms) ${info.message}`; }
    return info;
});

const expandStackTrace = format((info: any, opts: any) => {  // This expands the full stack trace when writing log files
    if (info.fullError) { info.message = `[${info.id}] ${info.fullError}`; }
    return info;
});

const truncateLevelNames = format((info: any, opts: any) => {
    const size = 5;
    info.level = info.level.substring(0, size);
    while (info.level.length < size) { info.level += " "; }
    return info;
});

winston.addColors(loggerLevels.colors);
const logger = winston.createLogger({
    levels: loggerLevels.levels,
    level: "vsilly",
    format: format.combine(
        uniquelyIdentifyErrors(),
        format.timestamp({
            format: () => moment().tz("America/Los_Angeles").format("YYYY-MM-DD HH:mm:ss") + " PST",
        } as unknown as TimestampOptions),
        format.printf(
            (info: any) => `${info.timestamp} ${info.level}${info.id ? " [" + info.id + "]" : ""}: ${info.message}`,
        ),
    ),
    transports: [
        new winston.transports.Console({
            level: consoleLogLevel,
            format: format.combine(
                truncateLevelNames(),
                showFullError ? expandStackTrace() : prependErrorId(),
                prependProfileDuration(),
                format.colorize(),
                format.printf(
                    (info: any) => `${info.timestamp} ${info.level}: ${info.message}`,
                ),
            ),
        }),
        new winston.transports.File({
            level: fileLogLevel,
            filename: path.join(config.directories.logs, `${moment().format("YYYY-MM-DD-HHmmss")}.txt`),
            format: format.combine(
                expandStackTrace(),
                prependProfileDuration(),
                format.printf(
                    (info: any) => `${info.timestamp} ${info.level}: ${info.message}`,
                ),
            ),
        }),
    ],
});

export default logger;
