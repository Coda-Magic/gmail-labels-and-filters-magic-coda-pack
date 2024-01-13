import * as coda from "@codahq/packs-sdk";
import { LabelReferenceSchema } from "./label_schemas";

export const FilterSchema = coda.makeObjectSchema({
  displayProperty: "name", // Which property above to display by default.
  idProperty: "id", // Which property above is a unique ID.
  featuredProperties: [
    "name",
    "criteriaQuery",
    "criteriaSubject",
    "criteriaHasAttachment",
    "criteriaTo",
    "criteriaFrom",
    "actionLabelsToAdd",
    "actionLabelsToRemove",
    "actionForward",
  ],
  properties: {
    name: { type: coda.ValueType.String },
    id: { type: coda.ValueType.String },
    criteriaQuery: { type: coda.ValueType.String, mutable: true },
    criteriaSubject: { type: coda.ValueType.String, mutable: true },
    criteriaHasAttachment: { type: coda.ValueType.Boolean, mutable: true },
    criteriaTo: { type: coda.ValueType.String, mutable: true },
    criteriaFrom: { type: coda.ValueType.String, mutable: true },
    actionLabelsToAdd: {
      type: coda.ValueType.Array,
      items: LabelReferenceSchema,
      mutable: false,
    },
    actionLabelsToRemove: {
      type: coda.ValueType.Array,
      items: LabelReferenceSchema,
      mutable: false,
    },
    label: {
      ...LabelReferenceSchema,
      mutable: true,
    },
    skipInbox: { type: coda.ValueType.Boolean, mutable: true },
    markAsRead: { type: coda.ValueType.Boolean, mutable: true },
    starIt: { type: coda.ValueType.Boolean, mutable: true },
    deleteIt: { type: coda.ValueType.Boolean, mutable: true },
    neverSendItToSpam: { type: coda.ValueType.Boolean, mutable: true },
    alwaysMarkItAsImportant: { type: coda.ValueType.Boolean, mutable: true },
    neverMarkItAsImportant: { type: coda.ValueType.Boolean, mutable: true },
    category: { type: coda.ValueType.String, mutable: true },
    actionForward: { type: coda.ValueType.String, mutable: true },
  },
});
