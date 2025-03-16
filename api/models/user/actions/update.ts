import { applyParams, save, ActionOptions } from "gadget-server";
import { saveAndRefreshQueue } from "../functions/saveAndUpdateQueue";

// When a medical worker updates a patient, the queue should be reordered to take into consideration the patient
export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await save(record);
};

export const onSuccess: ActionOnSuccess = async ({ params, record, logger, api, session }) => {
  await saveAndRefreshQueue(api);
};

export const options: ActionOptions = {
  actionType: "update",
};

