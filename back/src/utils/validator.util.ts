
const checkDate = (date: string | Date): boolean => {
    if (typeof date === 'string') {
        return RegExp(/^\d{4}-\d{2}-\d{2}$/).exec(date) !== null;
    }

    return date instanceof Date; // Check if the date is a valid Date object
};

const checkKeys = (validKeys: string[], body: Record<string, unknown>): boolean => {
    const keys = Object.keys(body);
    if (!keys.length) {
        throw new Error('No parameters were provided');
    }
    const invalidKeys = keys.filter(key => !validKeys.includes(key));
    if (invalidKeys.length) {
        throw new Error(`Invalid parameters: ${invalidKeys.join(', ')}`);
    }
    return true;
}

export {
    checkDate,
    checkKeys,
};
