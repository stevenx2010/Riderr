import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UberAPI } from '../../services/uber.services';
import { HomePage } from '../home/home';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private api: UberAPI) {
  	this.api.isAuthenticated().subscribe((isAuth) => {
  		if(isAuth) {
  			this.navCtrl.setRoot(HomePage);
  		}
  	});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  auth() {
  	this.api.auth().subscribe((isAuthSuccess) => {
  		this.navCtrl.setRoot(HomePage);
  	}, function(e) {
  		console.log('Failed to Authorize', e);
  	});
  }

}
