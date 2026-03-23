import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import cors from '@fastify/cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fastifyView from '@fastify/view'
import pug from 'pug'

import { authSchema, noteSchema } from './schemes/Schemes.js'
import { authPreHandler } from './Handlers/authPreHandles.js'
import {
    findUserByName,
    createUser,
    verifyPassword,
    createToken,
    addNote,
    getUserNotes
} from './dbHandlers/dbWork.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fastify = Fastify({ logger: true })

await fastify.register(cors)

await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../public')
})

await fastify.register(fastifyView, {
    engine: { pug },
    root: path.join(__dirname, '../public')
})

fastify.get('/', (request, reply) => {
    reply.view('index.pug')
})

fastify.post('/register', {
    schema: { body: authSchema }
}, async (request, reply) => {
    const { username, password } = request.body

    if (await findUserByName(username)) {
        return reply.code(409).send({ error: 'User already exists' })
    }

    await createUser(username, password)
    reply.code(201).send({ message: 'User registered successfully' })
})

fastify.post('/login', {
    schema: { body: authSchema }
}, async (request, reply) => {
    const { username, password } = request.body

    const isValid = await verifyPassword(username, password)
    if (!isValid) {
        return reply.code(401).send({ error: 'Invalid credentials' })
    }

    const token = await createToken(username)
    reply.send({ token })
})

fastify.post('/notes', {
    schema: { body: noteSchema },
    preHandler: authPreHandler
}, async (request, reply) => {
    const { note } = request.body
    await addNote(request.user, note)
    reply.code(201).send({ message: 'Note added' })
})

fastify.get('/notes', {
    preHandler: authPreHandler
}, async (request, reply) => {
    const notes = await getUserNotes(request.user)
    reply.send(notes)
})

fastify.listen({ port: 3000 }, (err) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})