import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UberAPI {
	private client_secret: string = 'JZY1-0Etr-sOwuiqym2gNBSVLQQUwb_HHC6N9SlE';
	private server_token: string = 'xT70oYVQTorH24Sv03gFrQuHt3D-J04dxz0slq--';
	private client_id: string = 'hnhACgWoGwhb45sOG2SY276UuZ5QLr-S';
	private redirect_uri: string = 'http://localhost:8000/callback';
	private scopes: string = 'profile history places request';
	private UBER_SANDBOX_API_URL = 'https://sanbox-api.uber.com/v1.2/';
	private TOKEN_KEY = 'token';
	private token: any; // store Token in memory
	private loader: any;

	constructor(private http: Http, private storage: Storage, private loadingCtrl: LoadingController,
				private inAppBrowser: InAppBrowser) {
		this.storage.get(this.TOKEN_KEY).then((token) => {
			this.token = token;
		});
	}

	private createAuthorizationHeader(headers: Headers) {
		headers.append('Authorization', 'Bearer' + this.token);
		headers.append('Accept-language', 'en_US');
		headers.append('Content-type', 'application/json');
	}

	private showLoader(text?: string) {
		this.loader = this.loadingCtrl.create({
			content: text || 'Loading...'
		});
		this.loader.present();
	}

	private hideLoader(): void {
		this.loader.dismiss();
	}

	isAuthenticated(): Observable<boolean> {
		this.showLoader('Authenticating...');
		return new Observable<boolean>((observer) => {
			this.storage.ready().then(() => {
				this.storage.get(this.TOKEN_KEY).then((token) => {
					observer.next(!!token);
					observer.complete();
					this.hideLoader();
				})
			})
		});
	}

	logout(): Observable<boolean> {
		return new Observable<boolean>((observer) => {
			this.storage.ready().then(() => {
				this.storage.set(this.TOKEN_KEY, undefined);
				this.token = undefined;
				observer.next(true);
				observer.complete();
			});
		});
	}

	auth(): Observable<boolean> {
		return new Observable<boolean>(observer => {
			this.storage.ready().then(() => {
				let browser = this.inAppBrowser.create(`http://login.uber.com/oauth/v2/authorize?
					client_id=${this.client_id}&response_type=code&scope=${this.scopes}&
					redirect_uri=${this.redirect_uri}`, '_blank', 
					'location=no,clearsessioncache=yes,clearcache=yes');

				browser.on('loadstart').subscribe((event) => {
					let url = event.url;

					// get the authorization code from the url parameter part
					if(url.indexOf(this.redirect_uri) === 0) {
						browser.close();

						let resp = (url).split("?")[1];
						let respParam = resp.split("&");

						var paramMap: any = {};

						for(var i = 0; i < respParam.length; i++) {
							let keyValueArray: any[] = respParam[i].split("=");
							let key = keyValueArray[0];
							let value = keyValueArray[1];
							
							paramMap[key] = value;
						}

						let headers = new Headers({
							'Content-type': "application/x-www-form-urlencoded"
						});

						let options = new RequestOptions({
							headers: headers
						});

						let data = `client_secret=${this.client_secret}&client_id=${this.client_id}&
									grant_type=authorization_code&redirect_uri=${this.redirect_uri}&
									code=${paramMap.code}`;

						return this.http.post('https://login.uber.com/oauth/v2/token', data, options).subscribe((data) => {
							let respJson: any = data.json();

							this.storage.set(this.TOKEN_KEY, respJson.access_token);
							this.token = respJson.access_token;

							observer.next(true);
							observer.complete();
						});
					}
				});
			});
		});
	}

	getMe(): Observable<Response> {
		this.showLoader();
		let headers = new Headers();
		this.createAuthorizationHeader(headers);
		return this.http.get(this.UBER_SANDBOX_API_URL + 'me', {headers: headers});
	}

	getHistory(): Observable<Response> {
		this.showLoader();
		let headers = new Headers();
		this.createAuthorizationHeader(headers);
		return this.http.get(this.UBER_SANDBOX_API_URL + 'history', {headers: headers});
	}

	getPaymentMethos(): Observable<Response> {
		this.showLoader();
		let headers = new Headers();
		this.createAuthorizationHeader(headers);
		return this.http.get(this.UBER_SANDBOX_API_URL + 'payment-methods', {headers: headers});
	}

	getProducts(latitude: number, longitude: number): Observable<Response> {
		this.showLoader();
		let headers = new Headers();
		return this.http.get(this.UBER_SANDBOX_API_URL + 'product?latitude=' + latitude +
				'&longitude=' + longitude, {headers: headers});
	}

	requestRideEstimates(start_lat: number, end_lat: number, start_lon: number, 
				end_lon: number): Observable<Response> {
		this.showLoader();
		let headers = new Headers();
		this.createAuthorizationHeader(headers);
		return this.http.post(this.UBER_SANDBOX_API_URL + 'request/estimate', {
			"start_latitude": start_lat,
			"end_latitude": end_lat,
			"start_longitude": start_lon,
			"end_longitude": end_lon
		}, {headers: headers});
	}

	requestRide(product_id: string, fare_id: string, start_lat: number, end_lat: number, 
				start_lon: number, end_lon: number): Observable<Response> {
		this.showLoader();
		let headers = new Headers();
		this.createAuthorizationHeader(headers);
		return this.http.post(this.UBER_SANDBOX_API_URL + 'requests', {
			"product_id": product_id,
			"fare_id": fare_id,
			"start_latitude": start_lat,
			"end_latitude": end_lat,
			"start_longitude": start_lon,
			"end_longitude": end_lon
		}, {headers: headers});
	}

	getCurrentRides(lat: number, lon: number): Observable<Response> {
		this.showLoader();
		let headers = new Headers();
		this.createAuthorizationHeader(headers);
		return this.http.get(this.UBER_SANDBOX_API_URL + 'requests/current', {headers: headers});
	}

	cancelCurrentRide(): Observable<Response> {
		this.showLoader();
		let headers = new Headers();
		this.createAuthorizationHeader(headers);
		return this.http.delete(this.UBER_SANDBOX_API_URL + 'requests/current', {headers: headers});
	}
}