const logger = async (ctx, next) => {
    const start = Date.now();

    await next();

    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${ctx.updateType} от ${ctx.from?.username || ctx.from?.id} — ${ms}ms`);
};

module.exports = { logger };