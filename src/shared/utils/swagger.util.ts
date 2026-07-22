import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

export function ApiSuccess<TModel extends Type<unknown>>(
  model: TModel,
  description = 'Request successful',
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description,
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: description,
          },
          data: {
            $ref: getSchemaPath(model),
          },
        },
      },
    }),
  );
}

export function ApiCreated<TModel extends Type<unknown>>(
  model: TModel,
  description = 'Resource created successfully',
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiCreatedResponse({
      description,
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: description,
          },
          data: {
            $ref: getSchemaPath(model),
          },
        },
      },
    }),
  );
}
export function ApiPaginated<TModel extends Type<unknown>>(
  model: TModel,
  description = 'Request successful',
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description,
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: description,
          },
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  $ref: getSchemaPath(model),
                },
              },
              meta: {
                type: 'object',
                properties: {
                  page: {
                    type: 'number',
                    example: 1,
                  },
                  limit: {
                    type: 'number',
                    example: 10,
                  },
                  totalItems: {
                    type: 'number',
                    example: 125,
                  },
                  totalPages: {
                    type: 'number',
                    example: 13,
                  },
                  hasNextPage: {
                    type: 'boolean',
                    example: true,
                  },
                  hasPreviousPage: {
                    type: 'boolean',
                    example: false,
                  },
                },
              },
            },
          },
        },
      },
    }),
  );
}
