import { hasOwnProperty } from "../utilities";
import { FilterSchema } from "../schemas/filter_schemas";

const builtin_labels = [
  "INBOX",
  "STARRED",
  "IMPORTANT",
  "SENT",
  "DRAFT",
  "TRASH",
  "SPAM",
  "CATEGORY_PERSONAL",
  "CATEGORY_SOCIAL",
  "CATEGORY_PROMOTIONS",
  "CATEGORY_UPDATES",
  "CATEGORY_FORUMS",
];

export async function toFilter(filter: any) {
  let result: any = {
    id: filter.id,
  };
  if (hasOwnProperty(filter.criteria, "subject")) {
    result.criteriaSubject = filter.criteria.subject;
  }
  if (hasOwnProperty(filter.criteria, "to")) {
    result.criteriaTo = filter.criteria.to;
  }
  if (hasOwnProperty(filter.criteria, "from")) {
    result.criteriaFrom = filter.criteria.from;
  }
  if (hasOwnProperty(filter.criteria, "query")) {
    result.criteriaQuery = filter.criteria.query;
  }
  if (hasOwnProperty(filter.criteria, "hasAttachment")) {
    result.criteriaHasAttachment = filter.criteria.hasAttachment;
  }
  result.actionLabelsToAdd = [];
  result.actionLabelsToRemove = [];
  if (hasOwnProperty(filter.action, "addLabelIds")) {
    for (let label of filter.action.addLabelIds) {
      result.actionLabelsToAdd.push({ id: label, name: "Not Found" });
    }
  }
  if (hasOwnProperty(filter.action, "removeLabelIds")) {
    for (let label of filter.action.removeLabelIds) {
      result.actionLabelsToRemove.push({ id: label, name: "Not Found" });
    }
  }
  if (hasOwnProperty(filter.action, "query")) {
    result.actionForward = filter.action.forward;
  }
  for (const label of filter.action.addLabelIds) {
    if (!builtin_labels.includes(label)) {
      result.label = { id: label, name: "Not Found" };
    }
  }
  if (filter.action.removeLabelIds != undefined) {
    if (filter.action.removeLabelIds.includes("INBOX")) {
      result.skipInbox = true;
    }
    if (filter.action.removeLabelIds.includes("UNREAD")) {
      result.markAsRead = true;
    }
    if (filter.action.removeLabelIds.includes("IMPORTANT")) {
      result.neverMarkItAsImportant = true;
    }
    if (filter.action.removeLabelIds.includes("SPAM")) {
      result.neverSendItToSpam = true;
    }
  }
  if (filter.action.addLabelIds != undefined) {
    if (filter.action.addLabelIds.includes("STARRED")) {
      result.starIt = true;
    }
    if (filter.action.addLabelIds.includes("TRASH")) {
      result.deleteIt = true;
    }
    if (filter.action.addLabelIds.includes("IMPORTANT")) {
      result.alwaysMarkItAsImportant = true;
    }
    if (filter.action.addLabelIds.includes("CATEGORY_PERSONAL")) {
      result.category = "Primary";
    }
    if (filter.action.addLabelIds.includes("CATEGORY_SOCIAL")) {
      result.category = "Social";
    }
    if (filter.action.addLabelIds.includes("CATEGORY_PROMOTIONS")) {
      result.category = "Promotions";
    }
    if (filter.action.addLabelIds.includes("CATEGORY_UPDATES")) {
      result.category = "Updates";
    }
    if (filter.action.addLabelIds.includes("CATEGORY_FORUMS")) {
      result.category = "Forums";
    }
  }

  return result;
}

export async function updateFilter(context: any, filter: any) {
  console.log(JSON.stringify(filter));
  let create_url =
    "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters";
  let delete_url =
    "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/" +
    filter.id;
  let body: any = { criteria: {}, action: {} };
  body.action.addLabelIds = [];
  body.action.removeLabelIds = [];

  if (filter.criteriaFrom) {
    body.criteria.from = filter.criteriaFrom;
  }
  if (filter.criteriaTo) {
    body.criteria.to = filter.criteriaTo;
  }
  if (filter.criteriaSubject) {
    body.criteria.to = filter.criteriaSubject;
  }
  if (filter.criteriaQuery) {
    body.criteria.query = filter.criteriaQuery;
  }
  if (filter.criteriaHasAttachment) {
    body.criteria.to = filter.criteriaHasAttachment;
  }
  if (filter.skipInbox) {
    body.action.removeLabelIds.push("INBOX");
  }
  if (filter.markAsRead) {
    body.action.removeLabelIds.push("UNREAD");
  }
  if (filter.starIt) {
    body.action.addLabelIds.push("STARRED");
  }
  if (filter.deleteIt) {
    body.action.addLabelIds.push("TRASH");
  }
  if (filter.neverSendItToSpam) {
    body.action.removeLabelIds.push("SPAM");
  }
  if (filter.alwaysMarkItAsImportant) {
    body.action.addLabelIds.push("IMPORTANT");
  }
  if (filter.neverMarkItAsImportant) {
    body.action.removeLabelIds.push("IMPORTANT");
  }
  if (filter.category) {
    switch (filter.category) {
      case "Primary":
        body.action.addLabelIds.push("CATEGORY_PERSONAL");
        break;
      case "Social":
        body.action.addLabelIds.push("CATEGORY_SOCIAL");
        break;
      case "Promotions":
        body.action.addLabelIds.push("CATEGORY_PROMOTIONS");
        break;
      case "Updates":
        body.action.addLabelIds.push("CATEGORY_UPDATES");
        break;
      case "Forums":
        body.action.addLabelIds.push("CATEGORY_FORUMS");
        break;
    }
  }
  if (filter.label) {
    body.action.addLabelIds.push(filter.label.id);
  }
  if (filter.actionForward) {
    body.action.forward = filter.actionForward;
  }
  console.log("Creating " + JSON.stringify(body));
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
}
