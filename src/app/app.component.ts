import { Component,OnInit } from '@angular/core';
import * as Crypto from 'crypto-browserify'
import {Buffer} from 'buffer'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  customer={"email":'',"first_name":"FName","last_name":"LName",tag_string: "child1, child2",return_to:"https://your-store.com/products/xyz"};
  address={
    address1: "123 Bil",
    city: "New York",
    country: "United States",
    province: "New York",
    zip: "10001"
  };
  BLOCK_SIZE=16;
  secret='';
  encryptionKey='';
  signingKey='';
  errorMessage='';
  logUrl='';
  showLogUrl=false;
  constructor() {
    let hash = Crypto.createHash("sha256").update(this.secret).digest();
    this.encryptionKey = hash.slice(0, this.BLOCK_SIZE);
    this.signingKey = hash.slice(this.BLOCK_SIZE, 32);
  }
  ngOnInit() {
    this.showLogUrl=false;
    setInterval(()=>{
      let currentTime=new Date();
      this.customer['created_at']=currentTime.toISOString();
      this.customer['addtimed']=currentTime.toString()
    }, 1000);
  }
  onShopifyLogin(){
    this.showLogUrl=false;
    if(this.customer['email'].trim()==''){
      this.errorMessage="email needed";
      return false;
    }


    this.customer['addresses']=[];
    this.customer['addresses'].push(this.address);

    let cipherText = this.onEncrypt(JSON.stringify(this.customer));
    let token = Buffer.concat([cipherText, this.onSign(cipherText)]).toString('base64');
    token = token.replace(/\+/g, '-').replace(/\//g, '_');
        console.log(token)
        this.showLogUrl=true;
        this.logUrl="https://kidbox-test.myshopify.com/account/login/multipass/"+token;

  }
  onSign (data) {
      var signed = Crypto.createHmac("SHA256", this.signingKey).update(data).digest();
      return signed;
  }

  onEncrypt(plaintext) {
      let iv = Crypto.randomBytes(this.BLOCK_SIZE);
      let cipher = Crypto.createCipheriv('aes-128-cbc', this.encryptionKey,iv);
      let encrypted = Buffer.concat([iv, cipher.update(plaintext, 'utf8'), cipher.final()]);
      return encrypted;
  }
}
