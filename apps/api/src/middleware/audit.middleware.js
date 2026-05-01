const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logAudit = (action, entityType) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;


      if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        try {
          const responseData = JSON.parse(body);
          const entityId = responseData.item?.id || responseData.id || req.params.id;

          if (entityId && req.user && req.params.workspaceId) {
            prisma.auditLog.create({
              data: {
                workspaceId: req.params.workspaceId,
                userId: req.user.id,
                action: `${req.method}_${action}`,
                entityType: entityType,
                entityId: entityId,
                details: req.method === 'DELETE' ? null : req.body
              }
            }).catch(err => console.error('Audit log failed:', err));
          }
        } catch (e) {
          // Body might not be JSON or other issues
        }
      }

      return originalSend.call(this, body);
    };

    next();
  };
};

module.exports = logAudit;
