import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://quickpulse.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "s7KdX16Ll7ge",
  fields: {
    birthDate: {
      type: "dateTime",
      includeTime: false,
      validations: { required: true },
      storageKey: "__hWKgtogyCw",
    },
    firstName: {
      type: "string",
      validations: { required: true },
      storageKey: "17OctPipOIUa",
    },
    lastName: {
      type: "string",
      validations: { required: true },
      storageKey: "9nxlI3HcFwTC",
    },
    phase: {
      type: "enum",
      default: "ASSESSMENT",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: [
        "ASSESSMENT",
        "CONSULTATION",
        "TREATMENT",
        "DISCHARGED",
      ],
      storageKey: "lc0vjHWfTGWW",
    },
    phasePosition: {
      type: "number",
      decimals: 0,
      storageKey: "ZTu7rjIAwcuI",
    },
    priority: {
      type: "enum",
      default: "NONE",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
      storageKey: "AH5wxCqn7tTL",
    },
  },
};
