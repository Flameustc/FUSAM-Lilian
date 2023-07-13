/**
 *     BCAM
 *  Copyright (C) 2023  Sid
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { get as getLocal } from "./localstore.js"
import { get as getOnline, playerSettingsLoaded } from "./playerstore.js"

export function get() {
	const local = getLocal()
	if (playerSettingsLoaded()) {
		return {
			enabledDistributions: {
				...getOnline().enabledDistributions,
				...local.enabledDistributions,
			},
		}
	}
	return local
}
