import { EchoWebResponseModel } from "@prove/lynx/dist/models/components/echowebresponsemodel";

export abstract class ProvePrefill {
    abstract getEchoEndpoint(): Promise<EchoWebResponseModel | undefined>
}