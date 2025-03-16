import { RouteHandler } from "gadget-server";
import { saveAndRefreshQueue } from "../models/user/functions/saveAndUpdateQueue";

/**
 * Route handler for GET hello
 *
 * See: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
const route: RouteHandler = async ({ request, reply, api, logger, connections }) => {
  // This route file will respond to an http request -- feel free to edit or change it!
  // For more information on HTTP routes in Gadget applications, see https://docs.gadget.dev/guides/http-routes
  const queues = await saveAndRefreshQueue(api, logger);
  await reply.type("application/json").send(queues);
};

export default route;
