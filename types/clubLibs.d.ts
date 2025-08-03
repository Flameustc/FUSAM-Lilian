export {}

declare global {
	// Overrides the default typedef for the `PlayerOnlineSettings` interface to have type-safety for FUSAMSettings
	interface PlayerOnlineSettings {
		FUSAMSettings: string
	}
}
