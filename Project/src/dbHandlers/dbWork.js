import fs from 'fs/promises'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DB_USERS = path.join(__dirname, '../../data/users.json')
const DB_NOTES = path.join(__dirname, '../../data/notes.json')
const DB_TOKENS = path.join(__dirname, '../../data/tokens.json')

async function readUsers() {
    try {
        const data = await fs.readFile(DB_USERS, 'utf-8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

async function writeUsers(users) {
    await fs.writeFile(DB_USERS, JSON.stringify(users, null, 2))
}

export async function findUserByName(username) {
    const users = await readUsers()
    return users.find(u => u.username === username)
}

export async function createUser(username, password) {
    const users = await readUsers()
    const hashedPass = await bcrypt.hash(password, 10)

    const newUser = {
        id: uuidv4(),
        username,
        password: hashedPass
    }

    users.push(newUser)
    await writeUsers(users)

    return { id: newUser.id, username: newUser.username }
}

export async function verifyPassword(username, password) {
    const user = await findUserByName(username)
    if (!user) return false
    return bcrypt.compare(password, user.password)
}

async function readTokens() {
    try {
        const data = await fs.readFile(DB_TOKENS, 'utf-8')
        return JSON.parse(data)
    } catch {
        return {}
    }
}

async function writeTokens(tokens) {
    await fs.writeFile(DB_TOKENS, JSON.stringify(tokens, null, 2))
}

export async function createToken(username) {
    const tokens = await readTokens()
    const token = uuidv4()
    tokens[token] = username
    await writeTokens(tokens)
    return token
}

export async function verifyToken(token) {
    const tokens = await readTokens()
    return tokens[token] || null
}

async function readNotes() {
    try {
        const data = await fs.readFile(DB_NOTES, 'utf-8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

async function writeNotes(notes) {
    await fs.writeFile(DB_NOTES, JSON.stringify(notes, null, 2))
}

export async function addNote(username, noteText) {
    const notes = await readNotes()

    const newNote = {
        id: uuidv4(),
        username,
        note: noteText,
        createdAt: new Date().toISOString()
    }

    notes.push(newNote)
    await writeNotes(notes)

    return newNote
}

export async function getUserNotes(username) {
    const notes = await readNotes()
    return notes.filter(n => n.username === username)
}