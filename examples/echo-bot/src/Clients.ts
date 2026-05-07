import * as Console from "@mmlngl/effect-messagekit-provider-console";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Layer from "effect/Layer";

const LineClientLayer = Line.Client.layer;

const ConsoleClientLayer = Console.Client.layer;

export const ClientsLayer = Layer.mergeAll(LineClientLayer, ConsoleClientLayer);
