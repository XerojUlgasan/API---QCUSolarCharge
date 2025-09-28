const filterObj = (allowedKeys, obj) => {
    const data = Object.fromEntries(
        allowedKeys.map(key => [key, obj[key]])
            .filter(([k, v]) => v !== undefined)
    )

    return data
}

module.exports = filterObj