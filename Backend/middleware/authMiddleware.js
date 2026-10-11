import jwt from 'jsonwebtoken'

export function Authorization(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
        return res.status(401).json({ message: "Token not found" })
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decoded;
            next()
        } catch (err) {
            return res.status(403).json({ message: err })
        }
    }
}

export function adminOnly(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" })
    }
    next()
}
