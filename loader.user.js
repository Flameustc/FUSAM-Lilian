// ==UserScript==
// @name Bondage Club Addon Manager Loader
// @namespace https://www.bondageprojects.com/
// @version 1.0
// @description A loader for the BCAM
// @author Sidious
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match http://localhost:*/*
// @icon data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant none
// @run-at document-end
// ==/UserScript==
/* eslint-disable no-inline-comments */
// @ts-check
// eslint-disable-next-line
/// <reference path="./node_modules/@total-typescript/ts-reset/dist/recommended.d.ts"/>

/**
 *     BCAM Loader
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

;(function () {
	"use strict"

	const script = document.createElement("script")
	script.src = `https://sidiousious.gitlab.io/bc-addon-loader/bcam.js?v=${(
		Date.now() / 10000
	).toFixed(0)}`
	script.type = "module"
	document.head.appendChild(script)
})()
