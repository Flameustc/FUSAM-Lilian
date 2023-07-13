export {}

declare global {
	interface Window {
		FUSAM?: FUSAMPublicAPI
	}
}

type FUSAMPublicAPI = {
	present: true
	addons: Record<string, FUSAMAddonState>
}

type FUSAMAddonState = {
	distribution: string
	status: "loading" | "loaded" | "error"
}

export type FUSAMSettings = {
	enabledDistributions: Record<string, string>
}
