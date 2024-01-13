import { hasOwnProperty } from "../utilities";

export async function toLabel(label: any) {
  let result: any = {
    id: label.id,
    name: label.name,
    messageListVisibility: label.messageListVisibility,
    labelListVisibility: label.labelListVisibility,
    type: label.type,
  };
  if (hasOwnProperty(label, "color")) {
    result.textColor = label.color.textColor;
    result.backgroundColor = label.color.backgroundColor;
  }
  return result;
}
