/**
 * @param {any} settings
 * @returns {settings is import("./types/bcam").BCAMSettings}
 */
export function isSettingsV1(settings) {
	return "enabledDistributions" in settings
}
