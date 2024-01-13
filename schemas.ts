import * as coda from "@codahq/packs-sdk";
import { LabelReferenceSchema } from "./schemas/label_schemas";

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
