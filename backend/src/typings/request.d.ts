import PrefillWithoutMnoConsent from "@src/models/prefill-without-mno-consent";

//packge import 
export { };

declare global {
    namespace Express {
        interface Request {
            prefillRecordId: number;
            isMobile?: boolean; 
            prefillRecord?: PrefillWithoutMnoConsent;
        }
    }
}