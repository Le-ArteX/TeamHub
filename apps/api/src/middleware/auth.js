const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../lib/prisma');

// Authenticate user from access token cookie
async function authenticate(req, res, next) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, avatarUrl: true, isVerified: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Require specific workspace role (ADMIN or MEMBER)
function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID required' });
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: req.user.id,
            workspaceId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'Not a member of this workspace' });
      }

      if (roles.length > 0 && !roles.includes(membership.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.membership = membership;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

module.exports = { authenticate, requireRole };
