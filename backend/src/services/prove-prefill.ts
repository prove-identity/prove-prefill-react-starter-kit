// import { ProveIdentity } from "@src/integrations/prove";
//
// implement service logic here
// package import
// import { Types, } from "mongoose";
// import moment from 'moment-timezone';
// import { serializeError, } from 'serialize-error';
// //module import
// import { Prove, } from "../integrations/prove/prove";
// import { IClientEndUser } from "../integrations/client_end_user/client_end_user.definitions";
// import {
//     APPLICABLE_USER_COUNTRIES,
//     OWNERSHIP_CHECK_ATTEMPT_CAP,
//     ProductAuthProducts,
//     Products,
// } from "../integrations/prove/prove.constants";
// import {
//     AuthUrlResponse,
//     KycStatus,
//     ProveAuthResponse,
//     VerifyIdentityPayload,
// } from "../integrations/prove/prove.definitions";
// import { AppEnvSelect, APP_ENV, } from "../integrations/_global/global.constants";
// import { ClientStore, } from "../integrations/clients/client";
// import { EndUserStore, } from "../integrations/client_end_user/client_end_user";
// import { sendWebhook, } from "./webhook.services";
// import { AuthorizationStep, } from "../integrations/clients_webhooks/clients_webhooks.constants";
// import { Octane, } from "../integrations/octane/octane";
// import { BilledMeters, } from "../integrations/octane/octane.constants";
// import { writeErrorToLog, } from "../integrations/prove/prove.models";
// import { IdentityData } from "../integrations/client_end_user/identity_data/identity_data";
//
// //#region TYPES
// type CheckTrustHumanPayload = {
//     consentStatus: string;
//     sourceIp: string;
//     phoneNumber: string;
// }
// type TrustScoreResults = {
//     verified: boolean
//     redirectUrl: string;
// }
// type InstantLinkResult = {
//     verified: boolean,
//     carrier: string,
//     countryCode: string,
//     ipAddressMatch: boolean,
//     lineType: string,
//     linkClicked: boolean,
//     phoneNumber: string,
//     transactionId: string,
// }
// type VerifyIdentityParams = {
//     firstName: string,
//     lastName: string,
//     dob: string,
//     address: string,
//     city: string,
//     region: string,
//     postalCode: string,
// }
// type VerifyEligibility = {
//     verified: boolean;
//     eligibility?: boolean;
//     identityNotEligible?: boolean;
// }
// type VerifyIdentity = {
//     verified: boolean,
//     canRetry?: boolean;
// }
// //#endregion
//
// export async function checkTrust(//verifyPossession
//     user: IClientEndUser,
//     params: CheckTrustHumanPayload,
//     product: ProductAuthProducts,
//     identityDataId: Types.ObjectId,
//     env: APP_ENV,
// ): Promise<TrustScoreResults> {
//     try {
//         //prevent api call if trust_score < PROVE_TRUST_SCORE_CUTOFF
//         const productTrustScoreToleranceLimit = await ClientStore.getClientTrustScoreToleranceLimit(
//             user?.client?._id,
//             product
//         );
//         const identityData = await EndUserStore.getUserIdentityDataByID(identityDataId, user._id);
//         if (
//             (
//                 !!identityData?.trustData?.trustScore
//                 && identityData.trustData.trustScore < productTrustScoreToleranceLimit)
//             || (!!identityData?.trustData?.countryCode
//                 && !APPLICABLE_USER_COUNTRIES.includes(identityData.trustData.countryCode)
//             )
//         ) {
//             throw new Error('User trust score is below threshold; request was previously completed');
//         }
//         const { phoneNumber, consentStatus, sourceIp } = params;
//         const prove = new Prove(user, product, identityDataId, identityData?.sessionID, env);
//         const result: ProveAuthResponse = await prove.checkTrust(phoneNumber, consentStatus,);
//         if ((result && !!APPLICABLE_USER_COUNTRIES.includes(result.countryCode) && result.trustScore >= productTrustScoreToleranceLimit) || product === Products.AUTH) {
//             const { userAuthGuid, encryptedGuid } = await Prove.generateUserAuthGuid();
//             await prove.updateSuccessfulReputationCheck(userAuthGuid, phoneNumber,);
//             //update user demographics country after successful trust score
//             if (product !== Products.AUTH) {
//                 user.demographics.countryCode = result.countryCode;
//                 await user.save();
//             }
//             const authResult: AuthUrlResponse = await prove.getAuthUrl(sourceIp, phoneNumber, encryptedGuid,);
//             const client = await ClientStore.getClientByID(user?.client?._id);
//             const clientName = client?.clientDetails?.name;
//             try {
//                 await prove.sendSMS(result?.phoneNumber || params?.phoneNumber, authResult?.redirectUrl, clientName);
//             } catch (e) {
//                 try {
//                     await prove.sendSMS(result?.phoneNumber || params?.phoneNumber, authResult?.redirectUrl, clientName,);
//                 } catch (e) {
//                     throw new Error(`Failure to send SMS to ${params?.phoneNumber}`);
//                 }
//             }
//             const trustScoreResults = {
//                 verified: true,
//                 redirectUrl: authResult?.redirectUrl,
//             }
//             return trustScoreResults;
//         } else {
//             const trustScoreResults = {
//                 verified: false,
//                 redirectUrl: null,
//             }
//             //send failure webhook
//             await sendWebhook(identityData, {
//                 user_uuid: user.uuid,
//                 authorizationStep: AuthorizationStep.REPUTATION_CHECK,
//                 verified: trustScoreResults.verified,
//                 failureReason: 'User trust score is below threshold',
//                 clientId: new Types.ObjectId(user?.client?._id),
//             });
//             return trustScoreResults;
//         }
//     } catch (e) {
//         await writeErrorToLog({
//             end_user_id: user._id.toString(),
//             identityDataId: identityDataId || null,
//             authorizationStep: AuthorizationStep.REPUTATION_CHECK,
//             methodName: 'identity_verification.services/checkTrust',
//             product: product,
//             env: env,
//             params: JSON.stringify(params),
//             errorMessage: JSON.stringify(serializeError(e)),
//         });
//         return {
//             verified: false,
//             redirectUrl: null,
//         }
//     }
// }
//
// export async function resendCheckTrustTextMessage(
//     user: IClientEndUser,
//     params: Partial<CheckTrustHumanPayload>,
//     product: ProductAuthProducts,
//     identityDataId: Types.ObjectId,
//     env: APP_ENV,
// ): Promise<TrustScoreResults> {
//     try {
//         const identityData = await EndUserStore.getUserIdentityDataByID(identityDataId, user._id);
//         const { redirectUrl, redirectUrlCreatedDate: urlCreatedDate } = identityData?.authorizationData || {};
//         const phoneNumber = identityData?.trustData.phoneNumber;
//         if (!!redirectUrl && !!phoneNumber) {
//             //validate time (within last 5 mins)
//             const fiveMinsAgo = moment.tz(moment(), "UTC").subtract(60, 'minutes');
//             const createdDate = moment.tz(urlCreatedDate, 'UTC').tz("UTC");
//             const isWithinFiveMins = createdDate.isAfter(fiveMinsAgo);
//             const prove = new Prove(user, product, identityDataId, identityData?.sessionID, env);
//             if (!isWithinFiveMins) {
//                 await prove.sendSMS(phoneNumber, redirectUrl);
//             } else {
//                 const { userAuthGuid, encryptedGuid } = await Prove.generateUserAuthGuid();
//                 await prove.updateResendRedirectUrlCredentials(userAuthGuid);
//                 const authResult = await prove.getAuthUrl(params?.sourceIp, phoneNumber, encryptedGuid);
//                 try {
//                     //@ts-ignore
//                     await prove.sendSMS(phoneNumber, authResult?.redirectUrl);
//                 } catch (e) {
//                     throw e;
//                 }
//                 return {
//                     verified: true,
//                     redirectUrl: authResult?.redirectUrl,
//                 }
//             }
//             return {
//                 verified: true,
//                 redirectUrl: redirectUrl,
//             }
//         } else {
//             if (!redirectUrl) {
//                 //throw new Error('User contains no redirect_url');
//                 return {
//                     verified: false,
//                     redirectUrl: null,
//                 }
//             } else {
//                 //throw new Error('User document has no phone number');
//                 return {
//                     verified: false,
//                     redirectUrl: null,
//                 }
//             }
//         }
//     } catch (e) {
//         await writeErrorToLog({
//             end_user_id: user._id.toString(),
//             identityDataId: identityDataId || null,
//             authorizationStep: AuthorizationStep.REPUTATION_CHECK_RESEND,
//             methodName: 'identity_verification.services/resendCheckTrustTextMessage',
//             product: product,
//             env: env,
//             params: JSON.stringify(params),
//             errorMessage: JSON.stringify(serializeError(e)),
//         });
//         throw e;
//     }
// }
//
// export async function getInstantLinkResult(//confirmPossession
//     user: IClientEndUser,
//     params: { vfp: string },
//     product: ProductAuthProducts,
//     identityDataId: Types.ObjectId,
//     env: APP_ENV,
// ): Promise<Partial<InstantLinkResult>> {
//     try {
//         const identityData = await EndUserStore.getUserIdentityDataByID(identityDataId, user._id);
//         const productTrustScoreToleranceLimit = await ClientStore.getClientTrustScoreToleranceLimit(user?.client?._id, product);
//         if (!!user.demographics.countryCode && user.demographics.countryCode !== 'US') {
//             throw new Error('notauthorized');
//         }
//         if (!!identityData.trustData.trustScore && identityData.trustData.trustScore < productTrustScoreToleranceLimit) {
//             throw new Error('User trust score is below threshold; request was previously completed');
//         }
//         if (identityData?.identityFlags?.reputationCheck === false) {
//             throw new Error('notauthorized');
//         }
//         if (identityData?.identityFlags?.possessionCheck === false) {
//             return {
//                 verified: false,
//                 carrier: null,
//                 countryCode: null,
//                 ipAddressMatch: null,
//                 lineType: null,
//                 linkClicked: null,
//                 phoneNumber: null,
//                 transactionId: null,
//             }
//         }
//         //return successful response if instant_link check was previously verified
//         if (identityData?.identityFlags?.possessionCheck === true) {
//             return {
//                 verified: true,
//                 carrier: identityData?.instantLinkData?.carrier,
//                 countryCode: identityData?.instantLinkData?.countryCode,
//                 ipAddressMatch: identityData?.instantLinkData?.ipAddressMatch,
//                 lineType: identityData?.instantLinkData?.lineType,
//                 linkClicked: identityData?.instantLinkData?.linkClicked,
//                 phoneNumber: identityData?.instantLinkData?.phoneNumber,
//                 transactionId: identityData?.instantLinkData?.transactionId,
//             }
//         }
//         if (identityData?.authorizationData?.authGuidClaimed === true) {
//             throw new Error('notauthorized');
//         }
//         const prove = new Prove(user, product, identityDataId, identityData?.sessionID, env);
//         const { verified, ...instantLinkResult } = await prove.getInstantLinkResult(params?.vfp as string,);
//         let proveMobilePhoneNumber: string = '';
//         if (!!instantLinkResult?.PhoneNumber) {
//             proveMobilePhoneNumber = `+${instantLinkResult.PhoneNumber.replace(/ /g, '')}`;
//         }
//         if (verified === true && !!proveMobilePhoneNumber && user?.demographics?.phoneNumber !== proveMobilePhoneNumber) {
//             try {
//                 //update phone number if instantLink result if LinkClicked === true && PhoneMatch !== 'false'
//                 user.demographics.phoneNumber = proveMobilePhoneNumber;
//                 await user.save();
//             } catch (e) {
//             }
//         }
//         await prove.updateInstantLinkResults(instantLinkResult, verified,);
//         //send webhook with response if product === human_check OR if verified === false
//         if (!!verified && [Products.AUTH, Products.HUMAN_CHECK,].includes(product)) {
//             if (product !== Products.AUTH) {
//                 await sendWebhook(identityData, {
//                     user_uuid: user.uuid,
//                     authorizationStep: AuthorizationStep.POSSESSION_CHECK,
//                     verified: verified,
//                     clientId: new Types.ObjectId(user?.client?._id),
//                 });
//                 //only bill user for api call if in production env
//                 if (env === AppEnvSelect.PRODUCTION) {
//                     //send webhook results
//                     const client = await ClientStore.getClientByID(user?.client?._id);
//                     const octane = new Octane(client);
//                     //bill client for successful human_check
//                     await octane.billApiMetric(BilledMeters.HUMAN_CHECK);
//                 }
//             }
//         } else {
//             //send webhook results
//             await sendWebhook(identityData, {
//                 user_uuid: user.uuid,
//                 authorizationStep: AuthorizationStep.POSSESSION_CHECK,
//                 verified: verified,
//                 failureReason: 'User phone could not be verified.',
//                 clientId: new Types.ObjectId(user?.client?._id),
//             });
//         }
//         return {
//             verified,
//             carrier: instantLinkResult?.Carrier || null,
//             countryCode: instantLinkResult?.CountryCode || null,
//             ipAddressMatch: instantLinkResult?.IpAddressMatch || null,
//             lineType: instantLinkResult?.LineType || null,
//             linkClicked: instantLinkResult?.LinkClicked || null,
//             phoneNumber: instantLinkResult?.PhoneNumber || null,
//             transactionId: instantLinkResult?.TransactionId || null,
//         }
//     } catch (e) {
//         await writeErrorToLog({
//             end_user_id: user._id.toString(),
//             identityDataId: identityDataId || null,
//             authorizationStep: AuthorizationStep.POSSESSION_CHECK,
//             methodName: 'identity_verification.services/getInstantLinkResult',
//             product: product,
//             env: env,
//             params: JSON.stringify(params),
//             errorMessage: JSON.stringify(serializeError(e)),
//         });
//         return {
//             verified: false,
//             carrier: null,
//             countryCode: null,
//             ipAddressMatch: null,
//             lineType: null,
//             linkClicked: null,
//             phoneNumber: null,
//             transactionId: null,
//         }
//     }
// }
//
// //** ELIGIBILITY **
// export async function getPrefillEligibility(
//     user: IClientEndUser,
//     params: {},
//     product: ProductAuthProducts,
//     identityDataId: Types.ObjectId,
//     env: APP_ENV,
// ): Promise<VerifyEligibility> {
//     try {
//         const identityData = await EndUserStore.getUserIdentityDataByID(identityDataId, user._id);
//         const productTrustScoreToleranceLimit = await ClientStore.getClientTrustScoreToleranceLimit(user?.client?._id, product);
//         if (!identityData.identityFlags.possessionCheck) throw new Error('notauthorized');
//         const phoneNumber = user?.demographics?.phoneNumber;
//         if (!phoneNumber) throw new Error('User Document is missing a phoneNumber');
//         const prove = new Prove(user, product, identityDataId, identityData?.sessionID, env);
//         const { eligibility = false, payfoneAlias, } = await prove.eligibility(phoneNumber, productTrustScoreToleranceLimit);
//         //check user trust before completing eligibility if user is not eligible for pre-fill flow
//         if (eligibility === false) {
//             //call checkTrust with non_prefill credentials
//             const result: ProveAuthResponse = await prove.checkTrust(phoneNumber,);
//             await prove.updateEligibilityResult(result);
//             user.demographics.countryCode = result.countryCode;
//             await user.save();
//             if (result.countryCode === "US" && result.trustScore >= productTrustScoreToleranceLimit) {
//                 const reputationCheck: boolean = true;
//                 await prove.updateEligibilityReputationCheckResult(eligibility, reputationCheck, payfoneAlias,);
//                 return { verified: true, eligibility: false };
//             } else {
//                 //! FAILURE_REASON =`User trustScore is below threshold: ${result.trustScore} and lineType: ${result?.lineType}`
//                 const reputationCheck: boolean = false;
//                 await prove.updateEligibilityReputationCheckResult(eligibility, reputationCheck, payfoneAlias,);
//                 return { verified: false, eligibility: null, identityNotEligible: true, };
//             }
//         } else {
//             const reputationCheck: boolean = true;
//             await prove.updateEligibilityReputationCheckResult(eligibility, reputationCheck, payfoneAlias,);
//             return { verified: true, eligibility: true };
//         }
//     } catch (e) {
//         await writeErrorToLog({
//             end_user_id: user._id.toString(),
//             identityDataId: identityDataId || null,
//             authorizationStep: AuthorizationStep.ELIGIBILITY_CHECK,
//             methodName: 'identity_verification.services/getPrefillEligibility',
//             product: product,
//             env: env,
//             params: JSON.stringify(params),
//             errorMessage: JSON.stringify(serializeError(e)),
//         });
//         return {
//             verified: false,
//             identityNotEligible: true,
//             eligibility: null,
//         };
//     }
// };
//
// //** GET USER PREFILL DATA **
// export async function identity(
//     user: IClientEndUser,
//     params: { dob: string; last4?: string; },
//     product: ProductAuthProducts,
//     identityDataId: Types.ObjectId,
//     env: APP_ENV,
// ) {
//     try {
//         const identityData = await EndUserStore.getUserIdentityDataByID(identityDataId, user._id);
//         if (!identityData?.identityFlags?.eligibilityCheck) throw new Error('notauthorized');
//         const productTrustScoreToleranceLimit = await ClientStore.getClientTrustScoreToleranceLimit(user?.client?._id, product);
//         const phoneNumber = user?.demographics?.phoneNumber;
//         if (!phoneNumber) throw new Error('User Document is missing a phoneNumber');
//         const prove = new Prove(user, product, identityDataId, identityData?.sessionID, env);
//         const identityResult = await prove.identity(phoneNumber, params?.dob, params?.last4);
//         if (!!identityResult.verified) {
//             const reputationCheck: boolean = true;
//             await prove.updateIdentityResult(identityResult?.verified, reputationCheck,);
//             return {
//                 ...identityResult,
//                 verified: true,
//                 manualEntryRequired: false,
//             };
//         } else {
//             //call checkTrust with non_prefill credentials
//             const trustResult: ProveAuthResponse = await prove.checkTrust(phoneNumber,);
//             if (trustResult.countryCode === "US" && trustResult.trustScore >= productTrustScoreToleranceLimit) {
//                 const reputationCheck: boolean = true;
//                 await prove.updateIdentityResult(identityResult?.verified, reputationCheck);
//                 await prove.updateIdentityReputationCheckResult(trustResult);
//                 return { verified: true, manualEntryRequired: true, };
//             } else {
//                 const reputationCheck: boolean = false;
//                 await prove.updateIdentityResult(identityResult?.verified, reputationCheck);
//                 await prove.updateFailedPrefillResult();
//                 return { verified: false, manualEntryRequired: false, };
//             }
//         }
//     } catch (e) {
//         await writeErrorToLog({
//             end_user_id: user._id.toString(),
//             identityDataId: identityDataId || null,
//             authorizationStep: AuthorizationStep.IDENITY_VERIFIED,
//             methodName: 'identity_verification.services/identity',
//             product: product,
//             env: env,
//             params: JSON.stringify(params),
//             errorMessage: JSON.stringify(serializeError(e)),
//         });
//         return {
//             verified: false,
//         };
//     }
// };
//
// //** VERIFY IDENTITY **
// export async function verifyIdentity(
//     user: IClientEndUser,
//     params: VerifyIdentityParams,
//     product: ProductAuthProducts,
//     identityDataId: Types.ObjectId,
//     env: APP_ENV,
// ): Promise<VerifyIdentity> {
//     try {
//         const identityData = await EndUserStore.getUserIdentityDataByID(identityDataId, user._id);
//         if (identityData?.identityFlags?.identityVerified === false) {
//             return {
//                 verified: false,
//                 canRetry: false,
//             };
//         }
//         if (identityData?.identityFlags?.eligibilityReputationCheck === false) {
//             return {
//                 verified: false,
//                 canRetry: false,
//             };
//         }
//         if (identityData?.identityFlags?.identityVerified === true) {
//             return {
//                 verified: true
//             }
//         };
//         const phoneNumber = user?.demographics?.phoneNumber;
//         if (!phoneNumber) throw new Error('User is missing a phoneNumber');
//         const configurableFieldsLimits = await ClientStore.getConfigurableFieldsLimits(user?.client?._id,);
//         const prove = new Prove(user, product, identityDataId, identityData?.sessionID, env);
//         const verifyIdentityResult = await prove.verifyIdentity(
//             { ...params, phoneNumber, } as VerifyIdentityPayload,
//             configurableFieldsLimits,
//             identityData?.identityFlags?.identityCheck || false
//         );
//         const {
//             verified,
//             proveResult,
//             status = 0,
//             errorReasons = []
//         } = verifyIdentityResult;
//         //record prove api results to logs
//         if (!!status && status !== 0) {
//             return {
//                 verified: false,
//                 canRetry: false,
//             };
//         } else {
//             if (!!verified) {
//                 //update user demographics with verified information
//                 user.demographics = {
//                     ...user.demographics,
//                     firstName: params.firstName,
//                     lastName: params.lastName,
//                     address: params.address,
//                     countryCode: proveResult.countryCode,
//                     city: params.city,
//                     region: params.region,
//                     postalCode: params.postalCode,
//                     dateOfBirth: params.dob,
//                 }
//                 await user.save();
//                 //set ownershipCheck and identityVerified to true on data attempt
//                 await prove.updateVerifyIdentityResult(params, proveResult);
//                 return {
//                     verified: true,
//                 }
//             } else {
//                 await writeErrorToLog({
//                     end_user_id: user._id.toString(),
//                     identityDataId: identityDataId || null,
//                     authorizationStep: AuthorizationStep.OWNERSHIP_CHECK,
//                     methodName: 'identity_verification.services/verifyIdentity-failedIdentityAttempt',
//                     product: product,
//                     env: env,
//                     params: JSON.stringify(params),
//                     errorMessage: JSON.stringify(errorReasons),
//                 });
//                 //check user ownershipCheckCount (if greater than 3, then return error_code)
//                 //else increment ownership_check_count by 1 and return verified: false
//                 const ownershipCheckCount = identityData?.identityFlags?.ownershipCheckCount || 0;
//                 if (ownershipCheckCount === OWNERSHIP_CHECK_ATTEMPT_CAP) {
//                     //set ownershipCheck and identityVerified to false
//                     await prove.updateFailedOwnershipCheckResult();
//                     return {
//                         verified: false,
//                         canRetry: false,
//                     }
//                 } else {
//                     //increment ownershipCheckAttempt by 1 to record attempt
//                     await prove.incrementOwnershipCheckAttempt();
//                     return {
//                         verified: false,
//                         canRetry: true,
//                     }
//                 }
//             }
//         }
//     } catch (e) {
//         await writeErrorToLog({
//             end_user_id: user._id.toString(),
//             identityDataId: identityDataId || null,
//             authorizationStep: AuthorizationStep.OWNERSHIP_CHECK,
//             methodName: 'identity_verification.services/verifyIdentity',
//             product: product,
//             env: env,
//             params: JSON.stringify(params),
//             errorMessage: JSON.stringify(serializeError(e)),
//         });
//         return {
//             verified: false,
//             canRetry: false,
//         };
//     }
// }
//
// //** GET USER KYC STATUS **
// export async function getUserKycStatus(
//     user: IClientEndUser,
//     params: {},
//     product: ProductAuthProducts,
//     identityDataId: Types.ObjectId,
//     env: APP_ENV,
// ): Promise<KycStatus> {
//     try {
//         const identityData = await EndUserStore.getUserIdentityDataByID(identityDataId, user._id);
//         const prove = new Prove(user, product, identityDataId, identityData?.sessionID, env);
//         const result: KycStatus = await prove.getUserKycStatus();
//         return result;
//     } catch (e) {
//         await writeErrorToLog({
//             end_user_id: user._id.toString(),
//             identityDataId: null,
//             authorizationStep: AuthorizationStep.USER_KYC_STATUS,
//             methodName: 'identity_verification.services/getUserKycStatus',
//             product: product,
//             env: env,
//             params: JSON.stringify(params),
//             errorMessage: JSON.stringify(serializeError(e)),
//         });
//         return {
//             reputationCheck: false,
//             possessionCheck: false,
//             proceedToEligibility: false,
//             eligibilityCheck: false,
//             ownershipCheck: false,
//             ownershipCheckCapReached: false,
//             identityVerified: false,
//             product: product,
//         };
//     }
// };
//
// // Check if url is whitelisted
// // This implementation will change post MVP See comment
// // inside of the getAllWhitelistedURLs method
// export async function checkWhitelistedURL(
//     url: string
// ) {
//     try {
//         const urlExists = await ClientStore.getWhitelistedURLExists(url);
//         return urlExists;
//     } catch (e) {
//         return false
//     }
// };
//
// // verify user vfp (helper method for CSP header verification for react widget)
// export async function verifyUserVfp(
//     vfp: string,
// ): Promise<boolean> {
//     try {
//         const verified = await IdentityData.validateUserVfp(vfp);
//         return verified;
//     } catch (e) {
//         return false
//     }
// };
//
// // verify user vfp (helper method for CSP header verification for react widget)
// export async function verifySessionGuid(
//     vfp: string,
// ): Promise<boolean> {
//     try {
//         const verified = await IdentityData.verifySessionGuid(vfp);
//         return verified;
//     } catch (e) {
//         return false
//     }
// };
