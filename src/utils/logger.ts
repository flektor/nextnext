import { blue, green, magenta, yellow } from "./console-colors"

function log(value: any, enabled = true) {
    if (!enabled) {
        return
    }

    if (typeof value === 'string') {
        return console.log(value)
    }

    if (typeof value === 'object') {
        return console.log(JSON.stringify(value, null, 2))
    }

    return console.log(...value)
}

function error(value: Error, enabled = true) {
    if (!enabled) {
        return
    }

    console.error(value.message);
}

export default function debug(__enabled = true, name?: string) {
    if (name) {
        console.log(`${name} is ${__enabled ? 'enabled' : 'disabled'}`)
    }

    return { log, error }
}


export function printServerUrl(port: string | undefined, mode: string) {
    if (port === undefined) {
        return console.log(magenta(`Environment variable PORT is not defined\n Check .env file!`));
    }

    const url = `http://localhost:${port}`
    switch (mode) {
        case 'production':
            return console.log(green(` - listening on ${yellow(url)}`));
        case 'development':
            return console.log(blue(` - listening on ${yellow(url)}`));
        case 'test':
            return console.log(yellow(` - listening on ${green(url)}`));
    }
}




