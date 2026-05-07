import * as Console from "@mmlngl/effect-messagekit-provider-console";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Layer from "effect/Layer";

const LineClientLayer = Line.Client.LineClient.layer.pipe(
  Layer.provide(Line.Config.LineConfig.layerFromEnv),
);

const ConsoleClientLayer = Console.Client.ConsoleClient.layer;

export const ClientsLayer = Layer.mergeAll(LineClientLayer, ConsoleClientLayer);
