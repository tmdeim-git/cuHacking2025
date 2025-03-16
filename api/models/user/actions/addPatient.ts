import { applyParams, save, ActionOptions } from "gadget-server";
import { saveAndRefreshQueue } from "../functions/saveAndUpdateQueue";

// As a nurse, I want to add a patient in the queue with phase and priority taken into consideration automatically so that it sorts the queue when I add them.

export const run: ActionRun = async ({ params, record, logger, api, session }) => {
  applyParams(params, record);
  await save(record);
  return {
    result: "ok"
  };
};

export const onSuccess: ActionOnSuccess = async ({ params, record, logger, api, session }) => {
  await saveAndRefreshQueue(api);
};

export const options: ActionOptions = {
  actionType: "create",
  returnType: true,
};
