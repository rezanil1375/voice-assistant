type ResponseMode = "text" | "audio";
type ResponseModePayload = {
  data: ResponseMode;
  type: "SET_RESPONSE_MODE";
};
type ResponsPayload = {
  data: string;
  type: "SET_RESPONSE";
};

type IsRecordingPayload = {
  data: boolean;
  type: "SET_IS_RECORDING";
};
type audioUrlPayload = {
  data: string;
  type: "SET_AUDIO_URL";
};
export type Action = {
  payload:
    | ResponseModePayload
    | IsRecordingPayload
    | ResponsPayload
    | audioUrlPayload;
};
export interface Data {
  responseMode: ResponseMode;
  recording: boolean;
  response: string;
  audioUrl: string;
}
