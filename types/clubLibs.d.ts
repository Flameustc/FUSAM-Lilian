export {}

declare global {
	var LZString: {
		compressToBase64: (data: string) => string
		compressToUTF16: (data: string) => string
		decompressFromBase64: (data: string) => string
		decompressFromUTF16: (data: string) => string
	}

	// Overrides the default typedef for the `PlayerOnlineSettings` interface to have type-safety for FUSAMSettings
	interface PlayerOnlineSettings {
		FUSAMSettings: string
	}
}
