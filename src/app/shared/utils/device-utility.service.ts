import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class DeviceUtilityService {
	
	private mobileDeviceRegex: RegExp =
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

	/**
	 * Returns a boolean indicating whether the current device is a mobile device.
	 * Uses a regular expression to test the user agent string for common patterns found in mobile 
	 * device user agents.
	 * @returns {boolean} true if the device is a mobile device, false otherwise.
	 */
	public get isMobileDevice(): boolean {
		return this.mobileDeviceRegex.test(navigator.userAgent);
	}
}
