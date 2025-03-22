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


