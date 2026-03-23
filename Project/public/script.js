 let token = localStorage.getItem('token')
      let username = localStorage.getItem('username')

      if (token && username) {
        showNotesSection()
      }

      function showMessage(id, text, isError) {
        const el = document.getElementById(id)
        el.textContent = text
        el.className = 'message ' + (isError ? 'error' : 'success')
      }

      function showNotesSection() {
        document.getElementById('currentUser').textContent = username
        document.getElementById('authSection').classList.add('hidden')
        document.getElementById('notesSection').classList.remove('hidden')
        loadNotes()
      }

      async function register() {
        const user = document.getElementById('regUsername').value
        const pass = document.getElementById('regPassword').value

        const res = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, password: pass })
        })

        const data = await res.json()
        showMessage('regMessage', data.message || data.error, !res.ok)
      }

      async function login() {
        const user = document.getElementById('loginUsername').value
        const pass = document.getElementById('loginPassword').value

        const res = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, password: pass })
        })

        const data = await res.json()

        if (res.ok) {
          token = data.token
          username = user
          localStorage.setItem('token', token)
          localStorage.setItem('username', username)
          showNotesSection()
        } else {
          showMessage('loginMessage', data.error, true)
        }
      }

      function logout() {
        token = null
        username = null
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        document.getElementById('authSection').classList.remove('hidden')
        document.getElementById('notesSection').classList.add('hidden')
      }

      async function addNote() {
        const note = document.getElementById('noteText').value

        const res = await fetch('/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({ note })
        })

        const data = await res.json()
        showMessage('noteMessage', data.message || data.error, !res.ok)

        if (res.ok) {
          document.getElementById('noteText').value = ''
          loadNotes()
        }
      }

      async function loadNotes() {
        const res = await fetch('/notes', {
          headers: { 'Authorization': token }
        })

        const data = await res.json()
        const container = document.getElementById('notesList')

        if (data.length === 0) {
          container.innerHTML = '<p>No notes yet</p>'
          return
        }

        container.innerHTML = data.map(n =>
          '<div class="note"><p>' + n.note + '</p><small>' + new Date(n.createdAt).toLocaleString() + '</small></div>'
        ).join('')
      }