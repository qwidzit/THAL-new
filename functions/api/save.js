function strToBase64(str) {
    const bytes = new TextEncoder().encode(str)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
}

const FILE_MAP = {
    achievements:       'data/achievements.json',
    pending:            'data/pending.json',
    legacy:             'data/legacy.json',
    timeline:           'data/timeline.json',
    platformers:        'data/platformers.json',
    platformertimeline: 'data/platformertimeline.json',
}

export async function onRequestPost({ request, env }) {
    // Auth
    const token = (request.headers.get('Authorization') ?? '').replace('Basic ', '')
    if (!token) return new Response(null, { status: 401 })
    const decoded = atob(token)
    const colon = decoded.indexOf(':')
    if (decoded.slice(0, colon) !== env.ADMIN_USERNAME || decoded.slice(colon + 1) !== env.ADMIN_PASSWORD)
        return new Response(null, { status: 401 })

    const { file, data } = await request.json()
    const filePath = FILE_MAP[file]
    if (!filePath) return new Response(JSON.stringify({ error: 'Invalid file' }), { status: 400 })

    const base = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`
    const headers = { Authorization: `token ${env.GITHUB_TOKEN}`, 'User-Agent': 'THAL-Admin', 'Content-Type': 'application/json' }

    // Get current SHA
    const getRes = await fetch(`${base}/contents/${filePath}?ref=${env.GITHUB_BRANCH}`, { headers })
    if (!getRes.ok) return new Response(JSON.stringify({ error: 'Could not fetch file SHA' }), { status: 500 })
    const { sha } = await getRes.json()

    // Commit updated file
    const putRes = await fetch(`${base}/contents/${filePath}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            message: `admin: update ${file}`,
            content: strToBase64(JSON.stringify(data, null, 2)),
            sha,
            branch: env.GITHUB_BRANCH,
        }),
    })

    if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}))
        return new Response(JSON.stringify({ error: err.message ?? 'Commit failed' }), { status: 500 })
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
}