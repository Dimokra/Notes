import fs from 'fs/promises'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Путь к папке data (на уровень выше от dbHandlers)
const DATA_DIR = path.join(__dirname, '../../data')

const DB_USERS = path.join(DATA_DIR, 'users.json')
const DB_NOTES = path.join(DATA_DIR, 'notes.json')
const DB_TOKENS = path.join(DATA_DIR, 'tokens.json')

// Инициализация: создаем папку и файлы, если их нет
async function initDb() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true })
        
        // Проверяем/создаем файлы с начальными данными
        const files = [
            { path: DB_USERS, default: '[]' },
            { path: DB_NOTES, default: '[]' },
            { path: DB_TOKENS, default: '{}' }
        ]

        for (const file of files) {
            try {
                await fs.access(file.path)
            } catch {
                await fs.writeFile(file.path, file.default)
            }
        }
    } catch (err) {
        console.error("Database initialization error:", err)
    }
}

// Запускаем немедленно
await initDb()

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ЧТЕНИЯ/ЗАПИСИ ---

async function readData(filePath) {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
}

async function writeData(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// --- ЭКСПОРТИРУЕМЫЕ ФУНКЦИИ ---

export async function findUserByName(username) {
    const users = await readData(DB_USERS)
    return users.find(u => u.username === username)
}

export async function createUser(username, password) {
    const users = await readData(DB_USERS)
    const hashedPass = await bcrypt.hash(password, 10)
    const newUser = { id: uuidv4(), username, password: hashedPass }
    users.push(newUser)
    await writeData(DB_USERS, users)
    return newUser
}

export async function verifyPassword(username, password) {
    const user = await findUserByName(username)
    if (!user) return false
    return bcrypt.compare(password, user.password)
}

export async function createToken(username) {
    const tokens = await readData(DB_TOKENS)
    const token = uuidv4()
    tokens[token] = username
    await writeData(DB_TOKENS, tokens)
    return token
}

export async function verifyToken(token) {
    const tokens = await readData(DB_TOKENS)
    return tokens[token] || null
}

export async function addNote(username, noteText) {
    const notes = await readData(DB_NOTES)
    const newNote = {
        id: uuidv4(),
        username,
        note: noteText,
        createdAt: new Date().toISOString()
    }
    notes.push(newNote)
    await writeData(DB_NOTES, notes)
    return newNote
}

export async function getUserNotes(username) {
    const notes = await readData(DB_NOTES)
    return notes.filter(n => n.username === username)
}