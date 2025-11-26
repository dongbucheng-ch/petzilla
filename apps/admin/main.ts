import process from 'node:process';

import '#/config';

const { default: app } = await import('#app');

const port = process.env.PORT || 3030;

const bootstrap = async () => {
  const appInstance = await app.init();
  appInstance.listen(+port);
};

bootstrap();
