import * as coda from "@codahq/packs-sdk";
import { Logger } from "../logging";
import { FilterSchema } from "../schemas/filter_schemas";
import { toFilter } from "../helpers/filter_helpers";

export function addUpdateFilterFormula(pack, logger: Logger) {
  pack.addFormula({
    name: "UpdateFilter",
    description: "Update filter",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "criteriaFrom",
        description: "Criteria from.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "criteriaTo",
        description: "Criteria to.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "criteriaSubject",
        description: "Criteria subject.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "criteriaQuery",
        description: "Criteria query.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.Boolean,
        name: "criteriaHasAttachment",
        description: "Criteria has attachment?",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.StringArray,
        name: "actionLabelsToAdd",
        description: "Action labels to add.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.StringArray,
        name: "actionLabelsToRemove",
        description: "Action labels to remove.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "actionForward",
        description: "Action forward email.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "filterId",
        description: "Filter ID.",
        required: true,
      }),
    ],
    resultType: coda.ValueType.Object,
    schema: coda.withIdentity(FilterSchema, "Filter"),
    isAction: true,

    execute: async function (
      [
        criteriaFrom,
        criteriaTo,
        criteriaSubject,
        criteriaQuery,
        criteriaHasAttachment,
        actionLabelsToAdd,
        actionLabelsToRemove,
        actionForward,
        filterId,
      ],
      context
    ) {
      let create_url =
        "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters";
      let delete_url =
        "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/" +
        filterId;
      let body: any = { criteria: {}, action: {} };

      if (criteriaFrom) {
        body.criteria.from = criteriaFrom;
      }
      if (criteriaTo) {
        body.criteria.to = criteriaTo;
      }
      if (criteriaSubject) {
        body.criteria.to = criteriaSubject;
      }
      if (criteriaQuery) {
        body.criteria.query = criteriaQuery;
      }
      if (criteriaHasAttachment) {
        body.criteria.to = criteriaHasAttachment;
      }
      if (actionLabelsToAdd) {
        body.action.addLabelIds = actionLabelsToAdd;
      }
      if (actionLabelsToAdd) {
        body.action.removeLabelIds = actionLabelsToRemove;
      }
      if (actionForward) {
        body.action.forward = actionForward;
      }
      console.log("Creating " + body);
      let create_response = await context.fetcher.fetch({
        url: create_url,
        method: "POST",
        body: JSON.stringify(body),
      });
      console.log("Created " + JSON.stringify(create_response.body));

      console.log("Deleting " + delete_url);

      let response = await context.fetcher.fetch({
        url: delete_url,
        method: "DELETE",
      });

      console.log("Delete response: " + JSON.stringify(response.body));
      console.log(await toFilter(create_response.body));
      return await toFilter(create_response.body);
    },
  });
}

export function addCreateFilterFormula(pack, logger: Logger) {
  pack.addFormula({
    name: "CreateFilter",
    description: "Create filter",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "criteriaFrom",
        description: "Criteria from.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "criteriaTo",
        description: "Criteria to.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "criteriaSubject",
        description: "Criteria subject.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "criteriaQuery",
        description: "Criteria query.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.Boolean,
        name: "criteriaHasAttachment",
        description: "Criteria has attachment?",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.StringArray,
        name: "actionLabelsToAdd",
        description: "Action labels to add.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.StringArray,
        name: "actionLabelsToRemove",
        description: "Action labels to remove.",
        required: false,
      }),
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "actionForward",
        description: "Action forward email.",
        required: false,
      }),
    ],
    resultType: coda.ValueType.Object,
    schema: coda.withIdentity(FilterSchema, "Filter"),
    isAction: true,

    execute: async function (
      [
        criteriaFrom,
        criteriaTo,
        criteriaSubject,
        criteriaQuery,
        criteriaHasAttachment,
        actionLabelsToAdd,
        actionLabelsToRemove,
        actionForward,
      ],
      context
    ) {
      let create_url =
        "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters";
      let body: any = { criteria: {}, action: {} };

      if (criteriaFrom) {
        body.criteria.from = criteriaFrom;
      }
      if (criteriaTo) {
        body.criteria.to = criteriaTo;
      }
      if (criteriaSubject) {
        body.criteria.to = criteriaSubject;
      }
      if (criteriaQuery) {
        body.criteria.to = criteriaQuery;
      }
      if (criteriaHasAttachment) {
        body.criteria.to = criteriaHasAttachment;
      }
      if (actionLabelsToAdd) {
        body.action.addLabelIds = actionLabelsToAdd;
      }
      if (actionLabelsToAdd) {
        body.action.removeLabelIds = actionLabelsToRemove;
      }
      if (actionForward) {
        body.action.forward = actionForward;
      }
      console.log("Creating " + body);
      let create_response = await context.fetcher.fetch({
        url: create_url,
        method: "POST",
        body: JSON.stringify(body),
      });
      return await toFilter(create_response.body);
    },
  });
}

export function addDeleteFilterFormula(pack, logger: Logger) {
  pack.addFormula({
    name: "DeleteFilter",
    description: "Delete filter",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "filterId",
        description: "Filter ID.",
        required: true,
      }),
    ],
    resultType: coda.ValueType.String,
    isAction: true,
    execute: async function ([filterId], context) {
      let delete_url =
        "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/" +
        filterId;

      let response = await context.fetcher.fetch({
        url: delete_url,
        method: "DELETE",
      });

      return "";
    },
  });
}
