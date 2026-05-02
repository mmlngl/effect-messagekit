import * as Schema from "effect/Schema";

export const EventId = Schema.NonEmptyTrimmedString.pipe(
  Schema.brand("EventId"),
  Schema.annotations({
    title: "Event ID",
    description: "Unique identifier for an Event",
  }),
);

export class BaseEvent extends Schema.Class<BaseEvent>("BaseEvent")(
  {
    id: EventId,
  },
  {
    title: "Event",
    description: "An inbound event",
  },
) {
  static decodeSingle = (input: BaseEvent.Encoded) =>
    Schema.decode(this)({ ...input });
}

export declare namespace BaseEvent {
  export type Type = typeof BaseEvent.Type;
  export type Encoded = Schema.Schema.Encoded<typeof BaseEvent>;
}
