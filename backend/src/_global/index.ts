export const API_DOMAIN = process.env.API_DOMAIN;
export const APP_DOMAIN = process.env.PROVE_UI_URL;
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
export const enum AppEnvSelect {
    PRODUCTION = 'production',
    SANDBOX = 'sandbox',
}
export const AppEnvMap: { [type in AppEnvSelect]: any } = {
    [AppEnvSelect.PRODUCTION]: true,
    [AppEnvSelect.SANDBOX]: true,
};
export type APP_ENV = AppEnvSelect.PRODUCTION | AppEnvSelect.SANDBOX;
export const AppsEnvs = [AppEnvSelect.PRODUCTION, AppEnvSelect.SANDBOX];