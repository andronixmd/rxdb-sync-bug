import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxDocument,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from 'rxdb';

export const messageSchemaLiteral = {
  title: 'message schema',
  description: 'message schema',
  version: 2,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    content: {
      type: ['string', 'null'],
    },
    status: {
      type: 'string',
      maxLength: 100,
    },
    type: {
      type: 'string',
      maxLength: 100,
    },

    active: {
      type: 'boolean',
    },
    delivered: {
      type: 'boolean',
    },

    createdAt: {
      type: 'string',
      format: 'date-time',
      maxLength: 100,
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      maxLength: 100,
    },
  },
  indexes: ['createdAt', 'updatedAt', 'status', 'type'],
  attachments: {},
} as const;

const schemaTyped = toTypedRxJsonSchema(messageSchemaLiteral);

export type MessageDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export type MessageDocument = RxDocument<MessageDocType, unknown>;

// and then merge all our types
export type MessageCollection = RxCollection<MessageDocType, unknown, unknown>;

export const messageSchema: RxJsonSchema<MessageDocType> = schemaTyped;
