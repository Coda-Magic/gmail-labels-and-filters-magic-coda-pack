import * as coda from "@codahq/packs-sdk";

export const LabelSchema = coda.makeObjectSchema({
  displayProperty: "name", // Which property above to display by default.
  idProperty: "id", // Which property above is a unique ID.
  properties: {
    id: { type: coda.ValueType.String, required: true },
    name: { type: coda.ValueType.String, required: true },
    type: { type: coda.ValueType.String },
    labelListVisibility: { type: coda.ValueType.String },
    messageListVisibility: { type: coda.ValueType.String },
    textColor: { type: coda.ValueType.String },
    backgroundColor: { type: coda.ValueType.String },
  },
});

export const LabelReferenceSchema = coda.makeReferenceSchemaFromObjectSchema(
  LabelSchema,
  "Labels"
);
