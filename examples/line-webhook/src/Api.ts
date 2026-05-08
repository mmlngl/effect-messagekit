import * as HttpApi from "@effect/platform/HttpApi";
import * as Groups from "./Group";

export class ServerApi extends HttpApi.make("api").add(Groups.EchoGroup) {}
