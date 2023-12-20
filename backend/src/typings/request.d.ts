//packge import 
export { };

declare global {
    namespace Express {
        interface Request {
            prefillRecordId: number;
        }
    }
}