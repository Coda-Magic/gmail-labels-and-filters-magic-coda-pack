import * as coda from "@codahq/packs-sdk";
import * as utilities from "./utilities";

export async function toLabel(label: any) {
  let result: any = {
    id: label.id,
    name: label.name,
    messageListVisibility: label.messageListVisibility,
    labelListVisibility: label.labelListVisibility,
    type: label.type,
  };
  return result;
}

export async function toFilter(filter: any) {
  let result: any = {
    id: filter.id,
  };
  if (utilities.hasOwnProperty(filter.criteria, "subject")) {
    result.criteriaSubject = filter.criteria.subject;
  }
  if (utilities.hasOwnProperty(filter.criteria, "to")) {
    result.criteriaTo = filter.criteria.to;
  }
  if (utilities.hasOwnProperty(filter.criteria, "from")) {
    result.criteriaFrom = filter.criteria.from;
  }
  if (utilities.hasOwnProperty(filter.criteria, "query")) {
    result.criteriaQuery = filter.criteria.query;
  }
  if (utilities.hasOwnProperty(filter.criteria, "hasAttachment")) {
    result.criteriaHasAttachment = filter.criteria.hasAttachment;
  }
  result.actionLabelsToAdd = [];
  result.actionLabelsToRemove = [];
  if (utilities.hasOwnProperty(filter.action, "addLabelIds")) {
    for (let label of filter.action.addLabelIds) {
      result.actionLabelsToAdd.push({ id: label });
    }
  }
  if (utilities.hasOwnProperty(filter.action, "removeLabelIds")) {
    for (let label of filter.action.removeLabelIds) {
      result.actionLabelsToRemove.push({ id: label });
    }
  }
  if (utilities.hasOwnProperty(filter.action, "query")) {
    result.actionForward = filter.action.forward;
  }
  return result;
}

export async function toMessage(message: any) {
  let result: any = {
    id: message.id,
    snippet: message.snippet,
  };

  result.labels = [];
  for (let label of message.labelIds) {
    result.labels.push({ id: label });
  }
  for (let header of message.payload.headers) {
    if (header.name == "Subject") {
      result.subject = header.value;
    }
    if (header.name == "From") {
      result.from = header.value;
    }
    if (header.name == "Date") {
      result.date = header.value;
    }
    if (header.name == "To") {
      result.to = header.value;
    }
  }
  return result;
}
