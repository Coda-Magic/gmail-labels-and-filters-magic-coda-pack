import * as coda from "@codahq/packs-sdk";

export const LabelReferenceSchema = coda.makeObjectSchema({
  codaType: coda.ValueHintType.Reference,
  properties: {
    id: { type: coda.ValueType.String, required: true },
    name: { type: coda.ValueType.String, required: true },
  },
  displayProperty: "name",
  idProperty: "id",
  // For reference schemas, set identity.name the value of identityName on the
  // sync table being referenced.
  identity: {
    name: "Labels",
  },
});

export const LabelSchema = coda.makeObjectSchema({
  displayProperty: "name", // Which property above to display by default.
  idProperty: "id", // Which property above is a unique ID.
  properties: {
    id: { type: coda.ValueType.String },
    name: { type: coda.ValueType.String },
    type: { type: coda.ValueType.String },
    labelListVisibility: { type: coda.ValueType.String },
    messageListVisibility: { type: coda.ValueType.String },
  },
});

export const FilterSchema = coda.makeObjectSchema({
  displayProperty: "id", // Which property above to display by default.
  idProperty: "id", // Which property above is a unique ID.
  properties: {
    id: { type: coda.ValueType.String },
    criteriaQuery: { type: coda.ValueType.String },
    criteriaSubject: { type: coda.ValueType.String },
    criteriaHasAttachment: { type: coda.ValueType.Boolean },
    criteriaTo: { type: coda.ValueType.String },
    criteriaFrom: { type: coda.ValueType.String },
    actionLabelsToAdd: {
      type: coda.ValueType.Array,
      items: LabelReferenceSchema,
    },
    actionLabelsToRemove: {
      type: coda.ValueType.Array,
      items: LabelReferenceSchema,
    },
    actionForward: { type: coda.ValueType.String },
  },
});

export const MessageSchema = coda.makeObjectSchema({
  displayProperty: "subject", // Which property above to display by default.
  idProperty: "id", // Which property above is a unique ID.
  properties: {
    id: { type: coda.ValueType.String },
    snippet: { type: coda.ValueType.String },
    subject: { type: coda.ValueType.String },
    from: { type: coda.ValueType.String },
    to: { type: coda.ValueType.String },
    labels: { type: coda.ValueType.Array, items: LabelReferenceSchema },
    date: { type: coda.ValueType.String },
  },
});
