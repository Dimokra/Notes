export const authSchema = {
    type: 'object',
    properties: {
        username: { type: 'string', minLength: 2, maxLength: 50 },
        password: { type: 'string', minLength: 6, maxLength: 100 }
    },
    required: ['username', 'password']
}

export const noteSchema = {
    type: 'object',
    properties: {
        note: { type: 'string', minLength: 1, maxLength: 1000 }
    },
    required: ['note']
}