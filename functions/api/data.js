function base64ToStr(b64) {
    const binary = atob(b64.replace(/\n/g, ''))
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new TextDecoder().decode(bytes)
}

const FILE_MAP = {
    achievements:       'data/achievements.json',
    pending:            'data/pending.json',
    legacy:             'data/legacy.json',
    timeline:           'data/timeline.json',
    platformers:        'data/platformers.json',
    platformertimeline: 'data/platformertimeline.json',
}

export async function onRequest({ request, env }) {
    // Auth
    const token = (request.headers.get('Authorization') ?? '').replace('Basic ', '')
    if (!token) return new Response(null, { status: 401 })
    const decoded = atob(token)
    const colon = decoded.indexOf(':')
    if (decoded.slice(0, colon) !== env.ADMIN_USERNAME || decoded.slice(colon + 1) !== env.ADMIN_PASSWORD)
        return new Response(null, { status: 401 })

    const file = new URL(request.url).searchParams.get('file')
    const filePath = FILE_MAP[file]
    if (!filePath) return new Response(JSON.stringify({ error: 'Invalid file' }), { status: 400 })

    const res = await fetch(
        `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${filePath}?ref=${env.GITHUB_BRANCH}`,
        { headers: { Authorization: `token ${env.GITHUB_TOKEN}`, 'User-Agent': 'THAL-Admin' } }
    )
    if (!res.ok) return new Response(JSON.stringify({ error: 'GitHub fetch failed' }), { status: 500 })

    const { content } = await res.json()
    return new Response(base64ToStr(content), { headers: { 'Content-Type': 'application/json' } })
}