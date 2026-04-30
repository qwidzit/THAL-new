export function xpFor(rank) {
    
    const a = 1.262
    const b = 0.9941
    return Math.max(1, Math.round(50*(a*(b**(rank+50))+1)))
}