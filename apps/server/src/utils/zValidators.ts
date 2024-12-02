import { zValidator } from '@hono/zod-validator';

export function zJsonValidator(schema: any) {
  return zValidator('json', schema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  });
}

export function zParamsValidator(schema: any) {
  return zValidator('param', schema, (result, c) => {
    console.log('param details', result.data);
    if (!result.success) {
      throw result.error;
    }
  });
}
