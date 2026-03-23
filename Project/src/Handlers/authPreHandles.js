import { verifyToken } from '../dbHandlers/dbWork.js'

export async function authPreHandler(request, reply) {
    const token = request.headers.authorization

    if (!token) {
        return reply.code(401).send({ error: 'Token required' })
    }

    const username = await verifyToken(token)

    if (!username) {
        return reply.code(401).send({ error: 'Invalid token' })
    }

    request.user = username
}