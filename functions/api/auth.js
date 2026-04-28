export async function onRequestPost({ request, env }) {
    const header = request.headers.get('Authorization') ?? ''
    const token = header.replace('Basic ', '')
    if (!token) return new Response(null, { status: 401 })

    const decoded = atob(token)
    const colon = decoded.indexOf(':')
    const username = decoded.slice(0, colon)
    const password = decoded.slice(colon + 1)

    if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' },
        })
    }
    return new Response(null, { status: 401 })
}