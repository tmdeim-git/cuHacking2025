import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";
import { saveAndRefreshQueue } from "../functions/saveAndUpdateQueue";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);
  await save(record);
};

export const onSuccess: ActionOnSuccess = async ({ record, logger, api }) => {
  await saveAndRefreshQueue(api);
};

export const options: ActionOptions = {
  actionType: "delete",
};
