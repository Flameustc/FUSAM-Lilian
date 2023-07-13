export {}

declare global {
	interface Window {
		BCAM?: BCAMPublicAPI
	}
}

type BCAMPublicAPI = {
	present: true
	addons: Record<string, BCAMAddonState>
}

type BCAMAddonState = {
	distribution: string
	status: "loading" | "loaded" | "error"
}

export type BCAMSettings = {
	enabledDistributions: Record<string, string>
}
